import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiCalendar,
    HiPlus,
    HiEye,
    HiCheck,
    HiXMark,
    HiTrash,
} from "react-icons/hi2";
import { useTheme } from "../../contexts/ThemeContext";
import eventService from "../../services/eventService";

const EventManagement = () => {
    const { isDarkMode } = useTheme();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        banner: null,
        helpContact: "",
        totalSlots: "",
        maxTeamSize: "",
        qrCode: null,
        eventDate: "",
        location: "",
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const getAdminToken = () => {
        const adminData = JSON.parse(localStorage.getItem("admin"));
        return adminData?.accessToken;
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await eventService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = getAdminToken();
            const formData = new FormData();
            formData.append("title", newEvent.title);
            formData.append("description", newEvent.description);
            formData.append("banner", newEvent.banner);
            formData.append("helpContact", newEvent.helpContact);
            formData.append("totalSlots", newEvent.totalSlots);
            formData.append("maxTeamSize", newEvent.maxTeamSize);
            formData.append("qrCode", newEvent.qrCode);
            formData.append("eventDate", newEvent.eventDate);
            formData.append("location", newEvent.location);

            await eventService.createEvent(formData, token);
            setShowCreateModal(false);
            fetchEvents();
            alert("Event created successfully!");
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Failed to create event.");
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            const token = getAdminToken();
            await eventService.deleteEvent(eventId, token);
            setEvents(events.filter((e) => e._id !== eventId));
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event.");
        }
    };

    const handleViewRegistrations = async (event) => {
        setSelectedEvent(event);
        try {
            const token = getAdminToken();
            const data = await eventService.getEventRegistrations(event._id, token);
            setRegistrations(data);
            setShowRegistrationsModal(true);
        } catch (error) {
            console.error("Error fetching registrations:", error);
            alert("Failed to fetch registrations.");
        }
    };

    const handleUpdateStatus = async (registrationId, status) => {
        try {
            const token = getAdminToken();
            await eventService.updateRegistrationStatus(registrationId, status, token);
            setRegistrations(registrations.map(reg =>
                reg._id === registrationId ? { ...reg, status } : reg
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    const handleFileChange = (e) => {
        setNewEvent({ ...newEvent, [e.target.name]: e.target.files[0] });
    };

    const handleInputChange = (e) => {
        setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Event Management
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                    <HiPlus className="w-5 h-5" /> Create Event
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading events...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div
                            key={event._id}
                            className={`rounded-xl shadow-md overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"
                                }`}
                        >
                            <img
                                src={event.bannerUrl}
                                alt={event.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {event.title}
                                </h3>
                                <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    {new Date(event.eventDate).toLocaleDateString()} • {event.location}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                        Slots: {event.filledSlots}/{event.totalSlots}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewRegistrations(event)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="View Registrations"
                                        >
                                            <HiEye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Delete Event"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Event Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-2xl rounded-xl shadow-xl p-6 my-8 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"
                                }`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    Create New Event
                                </h3>
                                <button onClick={() => setShowCreateModal(false)}>
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Event Title"
                                        required
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    />
                                    <input
                                        type="datetime-local"
                                        name="eventDate"
                                        required
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    />
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Location"
                                        required
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    />
                                    <input
                                        type="text"
                                        name="helpContact"
                                        placeholder="Help Contact (Phone)"
                                        required
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    />
                                    <input
                                        type="number"
                                        name="totalSlots"
                                        placeholder="Total Slots"
                                        required
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    />
                                    <input
                                        type="number"
                                        name="maxTeamSize"
                                        placeholder="Max Team Size"
                                        required
                                        onChange={handleInputChange}
                                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                    />
                                </div>
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    required
                                    onChange={handleInputChange}
                                    className={`w-full p-2 rounded border h-32 ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                                ></textarea>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Banner Image</label>
                                        <input
                                            type="file"
                                            name="banner"
                                            accept="image/*"
                                            required
                                            onChange={handleFileChange}
                                            className={`w-full ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>QR Code</label>
                                        <input
                                            type="file"
                                            name="qrCode"
                                            accept="image/*"
                                            required
                                            onChange={handleFileChange}
                                            className={`w-full ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                    Create Event
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Registrations Modal */}
            <AnimatePresence>
                {showRegistrationsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-4xl rounded-xl shadow-xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"
                                } max-h-[90vh] overflow-y-auto`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    Registrations for {selectedEvent?.title}
                                </h3>
                                <button onClick={() => setShowRegistrationsModal(false)}>
                                    <HiXMark className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                                        <tr>
                                            <th className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Team Name</th>
                                            <th className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Leader</th>
                                            <th className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Size</th>
                                            <th className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Payment Proof</th>
                                            <th className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Transaction ID</th>
                                            <th className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Status</th>
                                            <th className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.map((reg) => (
                                            <tr key={reg._id} className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                                                <td className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{reg.teamName}</td>
                                                <td className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{reg.members[0]?.name}</td>
                                                <td className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{reg.teamSize}</td>
                                                <td className="p-3">
                                                    <a href={reg.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                        View
                                                    </a>
                                                </td>
                                                <td className={`p-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{reg.transactionId}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {reg.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 flex gap-2">
                                                    {reg.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(reg._id, 'approved')}
                                                                className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                                title="Approve"
                                                            >
                                                                <HiCheck className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(reg._id, 'rejected')}
                                                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                                title="Reject"
                                                            >
                                                                <HiXMark className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {registrations.length === 0 && (
                                    <div className={`text-center py-8 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>No registrations found.</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventManagement;
