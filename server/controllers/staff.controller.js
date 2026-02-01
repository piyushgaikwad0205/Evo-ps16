const Staff = require("../models/staff.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

// @route GET /admin/staff
const getAllStaff = async (req, res) => {
    try {
        const { search, role, isActive } = req.query;

        let query = {};

        const userId = req.userId;
        const user = await User.findById(userId).select("collegeId");

        if (!user || !user.collegeId) {
            return res.status(200).json({ success: true, count: 0, staff: [] });
        }

        query.collegeId = user.collegeId;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } },
            ];
        }

        if (role) {
            query.role = role;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const staff = await Staff.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: staff.length,
            staff,
        });
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch staff",
            error: error.message,
        });
    }
};

// @route GET /admin/staff/:id
const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await Staff.findById(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found",
            });
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        if (!admin.collegeId || (staff.collegeId && staff.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. Staff belongs to another college." });
        }

        res.status(200).json({
            success: true,
            staff,
        });
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch staff member",
            error: error.message,
        });
    }
};

// @route POST /admin/staff
const createStaff = async (req, res) => {
    try {
        const { name, email, employeeId, password } = req.body;

        if (!name || !email || !employeeId) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and employee ID are required",
            });
        }

        // Check if staff with same email or employeeId exists
        const existingStaff = await Staff.findOne({
            $or: [{ email }, { employeeId }],
        });

        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: "Staff member with this email or employee ID already exists",
            });
        }

        // Hash password if provided
        const staffData = { ...req.body };
        if (password) {
            staffData.password = await bcrypt.hash(password, 10);
        } else {
            delete staffData.password;
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        if (!admin || !admin.collegeId) {
            return res.status(403).json({ message: "You must be associated with a college to create a staff member." });
        }
        staffData.collegeId = admin.collegeId;

        const staff = new Staff(staffData);
        await staff.save();

        res.status(201).json({
            success: true,
            message: "Staff member created successfully",
            staff,
        });
    } catch (error) {
        console.error("Error creating staff:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
                error: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to create staff member",
            error: error.message,
        });
    }
};

// @route PUT /admin/staff/:id
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if updating to an email/employeeId that already exists
        if (updateData.email || updateData.employeeId) {
            const query = { _id: { $ne: id } };
            const orConditions = [];

            if (updateData.email) {
                orConditions.push({ email: updateData.email });
            }
            if (updateData.employeeId) {
                orConditions.push({ employeeId: updateData.employeeId });
            }

            if (orConditions.length > 0) {
                query.$or = orConditions;
                const existingStaff = await Staff.findOne(query);

                if (existingStaff) {
                    return res.status(400).json({
                        success: false,
                        message: "Staff member with this email or employee ID already exists",
                    });
                }
            }
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        const staffToUpdate = await Staff.findById(id);
        if (!staffToUpdate) return res.status(404).json({ success: false, message: "Staff member not found" });

        if (!admin.collegeId || (staffToUpdate.collegeId && staffToUpdate.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. Staff belongs to another college." });
        }

        const staff = await Staff.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Staff member updated successfully",
            staff,
        });
    } catch (error) {
        console.error("Error updating staff:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
                error: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to update staff member",
            error: error.message,
        });
    }
};

// @route DELETE /admin/staff/:id
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        const staffToDelete = await Staff.findById(id);
        if (!staffToDelete) return res.status(404).json({ success: false, message: "Staff member not found" });

        if (!admin.collegeId || (staffToDelete.collegeId && staffToDelete.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. Staff belongs to another college." });
        }

        const staff = await Staff.findByIdAndDelete(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Staff member deleted successfully",
            staff,
        });
    } catch (error) {
        console.error("Error deleting staff:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete staff member",
            error: error.message,
        });
    }
};

// @route GET /admin/staff/stats
const getStaffStats = async (req, res) => {
    try {
        const totalStaff = await Staff.countDocuments();
        const activeStaff = await Staff.countDocuments({ isActive: true });
        const inactiveStaff = await Staff.countDocuments({ isActive: false });

        const byRole = await Staff.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalStaff,
                activeStaff,
                inactiveStaff,
                byRole,
            },
        });
    } catch (error) {
        console.error("Error fetching staff stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch staff statistics",
            error: error.message,
        });
    }
};

module.exports = {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffStats,
};
