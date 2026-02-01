const HOD = require("../models/hod.model");
const Department = require("../models/department.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

// @route GET /admin/hods
const getAllHODs = async (req, res) => {
    try {
        const { search, department, isActive } = req.query;

        let query = {};

        const userId = req.userId;
        const user = await User.findById(userId).select("collegeId");

        if (!user || !user.collegeId) {
            return res.status(200).json({ success: true, count: 0, hods: [] });
        }

        query.collegeId = user.collegeId;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } },
            ];
        }

        if (department) {
            query.department = department;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const hods = await HOD.find(query).populate("department", "name code").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: hods.length,
            hods,
        });
    } catch (error) {
        console.error("Error fetching HODs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch HODs",
            error: error.message,
        });
    }
};

// @route GET /admin/hods/:id
const getHODById = async (req, res) => {
    try {
        const { id } = req.params;

        const hod = await HOD.findById(id).populate("department", "name code");

        if (!hod) {
            return res.status(404).json({
                success: false,
                message: "HOD not found",
            });
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        if (!admin.collegeId || (hod.collegeId && hod.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. HOD belongs to another college." });
        }

        res.status(200).json({
            success: true,
            hod,
        });
    } catch (error) {
        console.error("Error fetching HOD:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch HOD",
            error: error.message,
        });
    }
};

// @route POST /admin/hods
const createHOD = async (req, res) => {
    try {
        const { name, email, employeeId, department, password } = req.body;

        if (!name || !email || !employeeId || !department) {
            return res.status(400).json({
                success: false,
                message: "Name, email, employee ID, and department are required",
            });
        }

        // Check if HOD with same email or employeeId exists
        const existingHOD = await HOD.findOne({
            $or: [{ email }, { employeeId }],
        });

        if (existingHOD) {
            return res.status(400).json({
                success: false,
                message: "HOD with this email or employee ID already exists",
            });
        }

        // Verify department exists
        const dept = await Department.findById(department);
        if (!dept) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        // Hash password if provided
        const hodData = { ...req.body };
        if (password) {
            hodData.password = await bcrypt.hash(password, 10);
        } else {
            delete hodData.password; // Remove password field if not provided
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        if (!admin || !admin.collegeId) {
            return res.status(403).json({ message: "You must be associated with a college to create an HOD." });
        }
        hodData.collegeId = admin.collegeId;

        const hod = new HOD(hodData);
        await hod.save();

        const populatedHOD = await HOD.findById(hod._id).populate("department", "name code");

        res.status(201).json({
            success: true,
            message: "HOD created successfully",
            hod: populatedHOD,
        });
    } catch (error) {
        console.error("Error creating HOD:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create HOD",
            error: error.message,
        });
    }
};

// @route PUT /admin/hods/:id
const updateHOD = async (req, res) => {
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
                const existingHOD = await HOD.findOne(query);

                if (existingHOD) {
                    return res.status(400).json({
                        success: false,
                        message: "HOD with this email or employee ID already exists",
                    });
                }
            }
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        const hodToUpdate = await HOD.findById(id);
        if (!hodToUpdate) return res.status(404).json({ success: false, message: "HOD not found" });

        if (!admin.collegeId || (hodToUpdate.collegeId && hodToUpdate.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. HOD belongs to another college." });
        }

        const hod = await HOD.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("department", "name code");

        if (!hod) {
            return res.status(404).json({
                success: false,
                message: "HOD not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "HOD updated successfully",
            hod,
        });
    } catch (error) {
        console.error("Error updating HOD:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update HOD",
            error: error.message,
        });
    }
};

// @route DELETE /admin/hods/:id
const deleteHOD = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        const hodToDelete = await HOD.findById(id);
        if (!hodToDelete) return res.status(404).json({ success: false, message: "HOD not found" });

        if (!admin.collegeId || (hodToDelete.collegeId && hodToDelete.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. HOD belongs to another college." });
        }

        const hod = await HOD.findByIdAndDelete(id);

        if (!hod) {
            return res.status(404).json({
                success: false,
                message: "HOD not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "HOD deleted successfully",
            hod,
        });
    } catch (error) {
        console.error("Error deleting HOD:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete HOD",
            error: error.message,
        });
    }
};

// @route GET /admin/hods/stats
const getHODStats = async (req, res) => {
    try {
        const totalHODs = await HOD.countDocuments();
        const activeHODs = await HOD.countDocuments({ isActive: true });
        const inactiveHODs = await HOD.countDocuments({ isActive: false });

        const avgExperience = await HOD.aggregate([
            { $group: { _id: null, avg: { $avg: "$experience" } } },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalHODs,
                activeHODs,
                inactiveHODs,
                avgExperience: avgExperience.length > 0 ? Math.round(avgExperience[0].avg * 10) / 10 : 0,
            },
        });
    } catch (error) {
        console.error("Error fetching HOD stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch HOD statistics",
            error: error.message,
        });
    }
};

module.exports = {
    getAllHODs,
    getHODById,
    createHOD,
    updateHOD,
    deleteHOD,
    getHODStats,
};
