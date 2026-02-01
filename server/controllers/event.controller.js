const Event = require("../models/event.model");
const EventRegistration = require("../models/eventRegistration.model");
const User = require("../models/user.model");

const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            helpContact,
            totalSlots,
            maxTeamSize,
            eventDate,
            location,
        } = req.body;
        // Check for bannerUrl and qrCodeUrl in req.body since files are processed before
        const { bannerUrl, qrCodeUrl } = req.body;

        if (!bannerUrl || !qrCodeUrl) {
            return res.status(400).json({ message: "Banner and QR Code are required" });
        }

        const creatorId = req.adminId || req.userId;
        const user = await User.findById(creatorId).select("collegeId");

        if (!user || !user.collegeId) {
            return res.status(403).json({ message: "You must be associated with a college to create an event." });
        }

        const newEvent = new Event({
            title,
            description,
            bannerUrl,
            helpContact,
            totalSlots,
            maxTeamSize: maxTeamSize || 5,
            qrCodeUrl,
            eventDate,
            location,
            createdBy: creatorId,
            collegeId: user.collegeId,
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Error creating event", error: error.message });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("collegeId");

        if (!user || !user.collegeId) {
            return res.status(200).json([]);
        }

        const events = await Event.find({ collegeId: user.collegeId }).sort({ eventDate: 1 });
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Error fetching events" });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const userId = req.userId;
        const user = await User.findById(userId).select("collegeId");

        if (!user.collegeId || (event.collegeId && event.collegeId.toString() !== user.collegeId.toString())) {
            return res.status(403).json({ message: "Access denied. Event belongs to another college." });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: "Error fetching event" });
    }
};

const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { teamName, teamSize, members, transactionId } = req.body;
        const { paymentProofUrl } = req.body;
        const userId = req.userId;

        if (!paymentProofUrl) {
            return res.status(400).json({ message: "Payment proof is required" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Parse members if it's a string (from FormData)
        let parsedMembers = members;
        if (typeof members === "string") {
            try {
                parsedMembers = JSON.parse(members);
            } catch (e) {
                return res.status(400).json({ message: "Invalid members format" });
            }
        }

        // Check if user has already registered for this event
        const existingUserRegistration = await EventRegistration.findOne({
            event: eventId,
            user: userId
        });

        if (existingUserRegistration) {
            return res.status(400).json({
                message: "You have already registered for this event",
                alreadyRegistered: true
            });
        }

        // Extract all member IDs (both string IDs and user object IDs)
        const memberIds = parsedMembers
            .map(m => m.userId || m._id)
            .filter(id => id); // Remove undefined/null values

        // Check if any team member (by ID) has already registered
        if (memberIds.length > 0) {
            const existingMemberRegistrations = await EventRegistration.find({
                event: eventId,
                $or: [
                    { user: { $in: memberIds } },
                    { 'members.userId': { $in: memberIds } }
                ]
            });

            if (existingMemberRegistrations.length > 0) {
                const registeredMembers = existingMemberRegistrations.map(reg => {
                    const member = parsedMembers.find(m =>
                        (m.userId && reg.user.toString() === m.userId.toString()) ||
                        reg.members.some(rm => rm.userId && rm.userId.toString() === (m.userId || m._id).toString())
                    );
                    return member ? member.name : 'Unknown';
                });

                return res.status(400).json({
                    message: `The following team member(s) have already registered for this event: ${registeredMembers.join(', ')}`,
                    duplicateMembers: true
                });
            }
        }

        // Check for duplicate contact numbers in this event
        const memberContacts = parsedMembers.map(m => m.contact).filter(c => c);
        if (memberContacts.length > 0) {
            const existingContactRegistrations = await EventRegistration.find({
                event: eventId,
                'members.contact': { $in: memberContacts }
            });

            if (existingContactRegistrations.length > 0) {
                return res.status(400).json({
                    message: "One or more team members with the same contact number have already registered for this event",
                    duplicateContacts: true
                });
            }
        }

        const newRegistration = new EventRegistration({
            event: eventId,
            user: userId,
            teamName,
            teamSize,
            members: parsedMembers,
            paymentProofUrl,
            transactionId,
        });

        await newRegistration.save();
        res.status(201).json({ message: "Registration submitted successfully" });
    } catch (error) {
        console.error("Error registering for event:", error);
        res.status(500).json({ message: "Error registering for event" });
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const registrations = await EventRegistration.find({ event: eventId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(registrations);
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ message: "Error fetching registrations" });
    }
};

const updateRegistrationStatus = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        const registration = await EventRegistration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        if (status === "approved" && registration.status !== "approved") {
            const event = await Event.findById(registration.event);
            if (event.filledSlots + registration.teamSize > event.totalSlots) {
                return res.status(400).json({ message: "Not enough slots available" });
            }
            event.filledSlots += registration.teamSize;
            await event.save();
        } else if (status === "rejected" && registration.status === "approved") {
            // If rejecting a previously approved one, free up slots
            const event = await Event.findById(registration.event);
            event.filledSlots = Math.max(0, event.filledSlots - registration.teamSize);
            await event.save();
        }

        registration.status = status;
        await registration.save();

        res.status(200).json({ message: `Registration ${status}` });
    } catch (error) {
        console.error("Error updating registration status:", error);
        res.status(500).json({ message: "Error updating registration status" });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await Event.findByIdAndDelete(id);
        await EventRegistration.deleteMany({ event: id });
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting event" });
    }
}

// Get all registrations for a specific user
const getUserRegistrations = async (req, res) => {
    try {
        const userId = req.userId;
        const registrations = await EventRegistration.find({ user: userId })
            .populate("event")
            .sort({ createdAt: -1 });
        res.status(200).json(registrations);
    } catch (error) {
        console.error("Error fetching user registrations:", error);
        res.status(500).json({ message: "Error fetching registrations" });
    }
};

// Check if user has registered for a specific event
const checkUserRegistration = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        const registration = await EventRegistration.findOne({
            event: eventId,
            user: userId
        });

        res.status(200).json({
            isRegistered: !!registration,
            registration: registration || null
        });
    } catch (error) {
        console.error("Error checking registration:", error);
        res.status(500).json({ message: "Error checking registration" });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    registerForEvent,
    getEventRegistrations,
    updateRegistrationStatus,
    deleteEvent,
    getUserRegistrations,
    checkUserRegistration
};
