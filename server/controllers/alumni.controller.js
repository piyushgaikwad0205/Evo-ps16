const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { saveLogInfo } = require("../middlewares/logger/logInfo");
const AlumniRequest = require("../models/alumniRequest.model");

/**
 * Register a new alumni request (admin approval required)
 */
const registerAlumni = async (req, res, next) => {
  try {
    const {
      name,
      email,
      graduationYear,
      department,
      currentEmployer,
      position,
      linkedinUrl,
      githubUrl,
      skills,
      industry,
      experience,
      isConsentGiven
    } = req.body;

    // Validate required fields
    if (!name || !email || !graduationYear || !department || !req.body.collegeId) {
      return res.status(400).json({
        message: "Missing required fields: name, email, graduationYear, department, and college are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Alumni already registered with this email" });
    }

    // Handle avatar upload
    const defaultAvatar = "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg";
    const fileUrl = req.files?.[0]?.filename
      ? `${req.protocol}://${req.get("host")}/assets/userAvatars/${req.files[0].filename}`
      : defaultAvatar;

    // Save alumni request for admin approval
    const requestDoc = await AlumniRequest.create({
      name: name.trim(),
      email: String(email).trim().toLowerCase(),
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      department,
      currentEmployer,
      position,
      linkedinUrl,
      githubUrl,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map(s => s.trim()) : [],
      industry,
      experience,
      bio: req.body.bio || "",
      location: req.body.location || "",
      interests: req.body.interests || "",
      avatar: fileUrl,
      status: "pending",
      collegeId: req.body.collegeId || null // Save selected college
    });

    await saveLogInfo(
      req,
      `New alumni request submitted: ${email}`,
      "alumni_request",
      "info"
    );

    res.status(201).json({
      message: "Your request has been submitted. Admin will review and contact you via email.",
      requestId: requestDoc._id
    });
  } catch (error) {
    console.error("Alumni registration error:", error);
    res.status(500).json({ message: "Failed to register alumni" });
  }
};

/**
 * Get alumni profile by ID
 */
const getAlumniProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const alumni = await User.findById(id)
      .select("-password")
      .populate("collegeId", "name")
      .lean();

    if (!alumni || alumni.role !== "alumni") {
      return res.status(404).json({ message: "Alumni not found" });
    }

    // Check if profile is public or if user is viewing their own profile
    if (!alumni.isAlumniProfilePublic && alumni._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Profile is private" });
    }

    res.status(200).json(alumni);
  } catch (error) {
    console.error("Error fetching alumni profile:", error);
    res.status(500).json({ message: "Error fetching alumni profile" });
  }
};

/**
 * Update alumni profile
 */
const updateAlumniProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure user can only update their own profile or admin can update
    if (id !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this profile" });
    }

    // Handle skills array
    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map(s => s.trim());
    }

    // Handle avatar upload if present
    if (req.files?.[0]?.filename) {
      updateData.avatar = `${req.protocol}://${req.get("host")}/assets/userAvatars/${req.files[0].filename}`;
    }

    const updatedAlumni = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, select: "-password" }
    );

    if (!updatedAlumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    await saveLogInfo(
      req,
      `Alumni profile updated: ${updatedAlumni.email}`,
      "alumni_profile_update",
      "info"
    );

    res.status(200).json({
      message: "Profile updated successfully",
      alumni: updatedAlumni
    });
  } catch (error) {
    console.error("Error updating alumni profile:", error);
    res.status(500).json({ message: "Error updating alumni profile" });
  }
};

/**
 * Get alumni directory with filters
 */
const getAlumniDirectory = async (req, res) => {
  try {
    const {
      graduationYear,
      department,
      industry,
      location,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const currentUserId = req.userId;

    // Build filter object
    const filter = {
      role: "alumni",
      alumniVerificationStatus: "verified",
      isAlumniProfilePublic: true
    };

    if (graduationYear) {
      filter.graduationYear = parseInt(graduationYear);
    }

    if (department) {
      filter.department = new RegExp(department, 'i');
    }

    if (industry) {
      filter.industry = new RegExp(industry, 'i');
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { currentEmployer: new RegExp(search, 'i') },
        { position: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const [alumni, total] = await Promise.all([
      User.find(filter)
        .select("-password -email -savedPosts")
        .sort({ graduationYear: -1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    // Get connection status for each alumni if user is authenticated
    let alumniWithConnections = alumni;
    if (currentUserId) {
      const Connection = require("../models/connection.model");
      const alumniIds = alumni.map(a => a._id);

      const connections = await Connection.find({
        $or: [
          { requester: currentUserId, recipient: { $in: alumniIds } },
          { requester: { $in: alumniIds }, recipient: currentUserId }
        ]
      }).lean();

      // Create a map of connection status
      const connectionMap = {};
      connections.forEach(conn => {
        const otherUserId = conn.requester.toString() === currentUserId ?
          conn.recipient.toString() : conn.requester.toString();
        connectionMap[otherUserId] = {
          status: conn.status,
          connectionId: conn._id,
          isRequester: conn.requester.toString() === currentUserId
        };
      });

      // Add connection status to each alumni
      alumniWithConnections = alumni.map(alumni => ({
        ...alumni,
        connectionStatus: connectionMap[alumni._id.toString()] || { status: "none" }
      }));
    }

    res.status(200).json({
      alumni: alumniWithConnections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAlumni: total,
        hasNext: skip + alumni.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching alumni directory:", error);
    res.status(500).json({ message: "Error fetching alumni directory" });
  }
};

/**
 * Get alumni statistics for dashboard
 */
const getAlumniStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: "alumni" } },
      {
        $group: {
          _id: null,
          totalAlumni: { $sum: 1 },
          verifiedAlumni: {
            $sum: { $cond: [{ $eq: ["$alumniVerificationStatus", "verified"] }, 1, 0] }
          },
          pendingVerification: {
            $sum: { $cond: [{ $eq: ["$alumniVerificationStatus", "pending"] }, 1, 0] }
          },
        }
      }
    ]);

    const yearlyStats = await User.aggregate([
      { $match: { role: "alumni", graduationYear: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$graduationYear",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    const departmentStats = await User.aggregate([
      { $match: { role: "alumni", department: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      general: stats[0] || { totalAlumni: 0, verifiedAlumni: 0, pendingVerification: 0 },
      byYear: yearlyStats,
      byDepartment: departmentStats
    });
  } catch (error) {
    console.error("Error fetching alumni statistics:", error);
    res.status(500).json({ message: "Error fetching alumni statistics" });
  }
};

/**
 * Verify alumni (Admin only)
 */
const verifyAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "verified" or "rejected"

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const alumni = await User.findByIdAndUpdate(
      id,
      { alumniVerificationStatus: status },
      { new: true, select: "-password" }
    );

    if (!alumni || alumni.role !== "alumni") {
      return res.status(404).json({ message: "Alumni not found" });
    }

    await saveLogInfo(
      req,
      `Alumni verification updated: ${alumni.email} - ${status}`,
      "alumni_verification",
      "info"
    );

    res.status(200).json({
      message: `Alumni ${status} successfully`,
      alumni
    });
  } catch (error) {
    console.error("Error verifying alumni:", error);
    res.status(500).json({ message: "Error verifying alumni" });
  }
};

module.exports = {
  registerAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAlumniDirectory,
  getAlumniStats,
  verifyAlumni
};