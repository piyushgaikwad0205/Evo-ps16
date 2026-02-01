const College = require("../models/college.model");
const Admin = require("../models/admin.model");
const User = require("../models/user.model");
const Post = require("../models/post.model");
const GlobalSettings = require("../models/globalSettings.model");
const Log = require("../models/log.model");
const Notification = require("../models/notification.model");
const Staff = require("../models/staff.model");
const Teacher = require("../models/teacher.model");
const Hod = require("../models/hod.model");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

/**
 * @route GET /admin/super/stats
 * @desc Get global analytics for super admin
 */
const getGlobalStats = async (req, res) => {
    try {
        const [
            totalColleges,
            totalUsers,
            totalAdmins,
            totalPosts,
            activeColleges,
            pendingColleges,
            suspendedUsers,
            blockedUsers,
            totalStaff,
            totalTeachers,
            totalHODs
        ] = await Promise.all([
            College.countDocuments(),
            User.countDocuments(),
            Admin.countDocuments(),
            Post.countDocuments(),
            College.countDocuments({ status: "approved" }),
            College.countDocuments({ status: "pending" }),
            User.countDocuments({ isSuspended: true, isBlocked: { $ne: true } }),
            User.countDocuments({ isBlocked: true }),
            Staff.countDocuments(),
            Teacher.countDocuments(),
            Hod.countDocuments()
        ]);

        const activeUsers = totalUsers - suspendedUsers - blockedUsers;

        res.status(200).json({
            totalColleges,
            totalUsers,
            totalAdmins,
            totalPosts,
            activeColleges,
            pendingColleges,
            activeUsers,
            suspendedUsers,
            blockedUsers,
            totalStaff,
            totalTeachers,
            totalHODs,
            systemHealth: "Good" // Mock value for now
        });
    } catch (error) {
        console.error("Error fetching global stats:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route PUT /admin/super/colleges/:id/status
 * @desc Update college status (approve/suspend)
 */
const updateCollegeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "suspended", "pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const college = await College.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }

        res.status(200).json({ message: "College status updated", college });
    } catch (error) {
        console.error("Error updating college status:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route POST /admin/super/colleges/:id/admins
 * @desc Create an admin for a specific college
 */
const createCollegeAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const collegeId = req.params.id;

        console.log("Creating admin:", { username, collegeId, passwordLength: password?.length });

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required",
                received: { username: !!username, password: !!password }
            });
        }

        // Validate username format
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                message: "Username must be between 3 and 20 characters"
            });
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            return res.status(400).json({
                message: "Username can only contain letters and numbers"
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(collegeId)) {
            return res.status(400).json({ message: "Invalid college ID format" });
        }

        // Check if username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Check if college exists
        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }

        // Create new admin
        const newAdmin = new Admin({
            username: username.trim(),
            password: password,
            role: "admin",
            college: collegeId
        });

        await newAdmin.save();

        console.log("Admin created successfully:", newAdmin._id);

        // Return admin without password
        const adminResponse = {
            _id: newAdmin._id,
            username: newAdmin.username,
            role: newAdmin.role,
            college: newAdmin.college,
            createdAt: newAdmin.createdAt
        };

        res.status(201).json({
            message: "College admin created successfully",
            admin: adminResponse
        });
    } catch (error) {
        console.error("Error creating college admin:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            errors: error.errors
        });

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: messages
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            details: error.errors ? Object.values(error.errors).map(e => e.message) : []
        });
    }
};

/**
 * @route GET /admin/super/colleges/:id/admins
 * @desc Get all admins for a specific college
 */
const getCollegeAdmins = async (req, res) => {
    try {
        const collegeId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(collegeId)) {
            return res.status(400).json({
                message: "Invalid college ID format",
                providedId: collegeId
            });
        }

        // Check if college exists
        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }

        // Find admins for this college
        const admins = await Admin.find({
            college: collegeId,
            role: "admin"
        })
            .select("-password")
            .populate("college", "name code")
            .lean();

        res.status(200).json({
            success: true,
            count: admins.length,
            admins
        });
    } catch (error) {
        console.error("Error fetching college admins:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * @route DELETE /admin/super/admins/:id
 * @desc Remove a college admin
 */
const deleteCollegeAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID format" });
        }

        const admin = await Admin.findByIdAndDelete(adminId);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({ message: "Admin removed successfully" });
    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route GET /admin/super/settings
 * @desc Get global settings
 */
const getGlobalSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = await GlobalSettings.create({});
        }
        res.status(200).json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route PUT /admin/super/settings
 * @desc Update global settings
 */
const updateGlobalSettings = async (req, res) => {
    try {
        const updates = req.body;
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = new GlobalSettings(updates);
        } else {
            Object.assign(settings, updates);
        }
        await settings.save();
        res.status(200).json({ message: "Settings updated", settings });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route GET /admin/super/logs
 * @desc Get global system logs
 */
const getGlobalLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Build query based on admin role
        let query = {};

        // Only Super Admin can see all logs
        // Regular admins shouldn't access this endpoint (handled by route protection)
        // But as an extra safety measure, we can add filtering here
        if (req.adminRole !== 'superadmin') {
            return res.status(403).json({ message: "Access denied. Super Admin only." });
        }

        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'actor',
                select: 'username email role name department course yearOfStudy'
            })
            .lean();

        const total = await Log.countDocuments(query);

        res.status(200).json({
            logs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalLogs: total
        });
    } catch (error) {
        console.error("Error fetching global logs:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route GET /admin/super/users
 * @desc Get global users with filtering
 */
const getGlobalUsers = async (req, res) => {
    try {
        const { role, collegeId, search, status } = req.query;
        const query = {};

        if (role) query.role = role;
        if (collegeId) query.collegeId = collegeId;

        // Status filtering
        if (status) {
            if (status === 'active') {
                // Active users are those who are NOT suspended AND NOT blocked
                // We use $ne: true to include users where the field might be missing (undefined/null) or false
                query.isSuspended = { $ne: true };
                query.isBlocked = { $ne: true };
            } else if (status === 'suspended') {
                query.isSuspended = true;
                query.isBlocked = { $ne: true };
            } else if (status === 'blocked') {
                query.isBlocked = true;
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .populate('collegeId', 'name code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(query);

        res.status(200).json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (error) {
        console.error("Error fetching global users:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route POST /admin/super/notifications
 * @desc Send global notification
 */
const createGlobalNotification = async (req, res) => {
    try {
        const { title, message, targetAudience, expiresAt, targetCollege } = req.body;

        // Ensure only super admin can do this (middleware should handle, but extra check)
        if (req.admin.role !== 'superadmin') {
            return res.status(403).json({ message: "Only Super Admin can create global notifications" });
        }

        // Validate targetCollege if audience requires it
        if ((targetAudience === 'college' || targetAudience === 'college_admins') && !targetCollege) {
            return res.status(400).json({ message: "Target College ID is required for this audience type" });
        }

        const notification = await Notification.create({
            title,
            message,
            targetAudience: targetAudience || 'all',
            targetCollege: targetCollege || null,
            expiresAt,
            createdBy: req.adminId,
        });

        res.status(201).json({ message: "Global notification sent", notification });
    } catch (error) {
        console.error("Error creating global notification:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route GET /admin/super/colleges/list
 * @desc Get list of colleges for dropdown
 */
const getCollegesList = async (req, res) => {
    try {
        const colleges = await College.find({ status: "approved" })
            .select("_id name code")
            .sort({ name: 1 })
            .lean();

        res.status(200).json(colleges);
    } catch (error) {
        console.error("Error fetching colleges list:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route PUT /admin/super/users/:id/status
 * @desc Update user status (suspend/block/activate)
 */
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, duration } = req.body; // action: 'suspend', 'block', 'activate'

        let updateData = {};

        if (action === "suspend") {
            if (!duration || isNaN(parseInt(duration))) {
                return res.status(400).json({ message: "Valid duration is required for suspension" });
            }
            // Calculate suspension end date
            const suspensionDate = new Date();
            suspensionDate.setDate(suspensionDate.getDate() + parseInt(duration));

            updateData = {
                isSuspended: true,
                suspensionExpiresAt: suspensionDate,
                isBlocked: false
            };
        } else if (action === "block") {
            updateData = {
                isBlocked: true, // Permanent block
                isSuspended: true,
                suspensionExpiresAt: null
            };
        } else if (action === "activate") {
            updateData = {
                isSuspended: false,
                isBlocked: false,
                suspensionExpiresAt: null
            };
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: `User ${action}ed successfully`, user });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @route PUT /admin/super/users/:id
 * @desc Update user details (Edit)
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent updating sensitive fields directly through this endpoint if needed
        delete updates.password;
        delete updates.logs;

        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



/**
 * @route GET /admin/super/colleges/:id/overview
 * @desc Get detailed overview stats for a specific college
 */
const getCollegeOverview = async (req, res) => {
    try {
        const collegeId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(collegeId)) {
            return res.status(400).json({ message: "Invalid college ID format" });
        }

        const College = require("../models/college.model");
        const Event = require("../models/event.model");
        const Club = require("../models/club.model");

        // Check if college exists
        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }

        const [
            totalAdmins,
            totalTeachers,
            totalStaff,
            totalUsers,
            totalEvents,
            totalClubs
        ] = await Promise.all([
            Admin.countDocuments({ college: collegeId, role: "admin" }),
            Teacher.countDocuments({ collegeId }),
            Staff.countDocuments({ collegeId }),
            User.countDocuments({ collegeId }),
            Event.countDocuments({ collegeId }),
            Club.countDocuments({ collegeId }),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                admins: totalAdmins,
                teachers: totalTeachers,
                staff: totalStaff,
                users: totalUsers,
                events: totalEvents,
                clubs: totalClubs
            }
        });
    } catch (error) {
        console.error("Error fetching college overview:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};


module.exports = {
    getGlobalStats,
    updateCollegeStatus,
    createCollegeAdmin,
    getCollegeAdmins,
    deleteCollegeAdmin,
    getGlobalSettings,
    updateGlobalSettings,
    getGlobalLogs,
    getGlobalUsers,
    createGlobalNotification,
    getCollegesList,
    updateUserStatus,
    updateUser,
    getCollegeOverview
};
