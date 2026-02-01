const Teacher = require("../models/teacher.model");
const Department = require("../models/department.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

// @route GET /admin/teachers
const getAllTeachers = async (req, res) => {
    try {
        const { search, department, designation, isActive } = req.query;

        let query = {};

        const userId = req.userId;
        const user = await User.findById(userId).select("collegeId");

        if (!user || !user.collegeId) {
            return res.status(200).json({ success: true, count: 0, teachers: [] });
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

        if (designation) {
            query.designation = designation;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const teachers = await Teacher.find(query).populate("department", "name code").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers,
        });
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch teachers",
            error: error.message,
        });
    }
};

// @route GET /admin/teachers/:id
const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teacher.findById(id).populate("department", "name code");

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        if (!admin.collegeId || (teacher.collegeId && teacher.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. Teacher belongs to another college." });
        }

        res.status(200).json({
            success: true,
            teacher,
        });
    } catch (error) {
        console.error("Error fetching teacher:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch teacher",
            error: error.message,
        });
    }
};

// @route POST /admin/teachers
const createTeacher = async (req, res) => {
    try {
        const { name, email, employeeId, department, password } = req.body;

        if (!name || !email || !employeeId || !department) {
            return res.status(400).json({
                success: false,
                message: "Name, email, employee ID, and department are required",
            });
        }

        // Check if teacher with same email or employeeId exists
        const existingTeacher = await Teacher.findOne({
            $or: [{ email }, { employeeId }],
        });

        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: "Teacher with this email or employee ID already exists",
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
        const teacherData = { ...req.body };
        if (password) {
            teacherData.password = await bcrypt.hash(password, 10);
        } else {
            delete teacherData.password;
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        if (!admin || !admin.collegeId) {
            return res.status(403).json({ message: "You must be associated with a college to create a teacher." });
        }
        teacherData.collegeId = admin.collegeId;

        const teacher = new Teacher(teacherData);
        await teacher.save();

        const populatedTeacher = await Teacher.findById(teacher._id).populate("department", "name code");

        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            teacher: populatedTeacher,
        });
    } catch (error) {
        console.error("Error creating teacher:", error);
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
            message: "Failed to create teacher",
            error: error.message,
        });
    }
};

// @route PUT /admin/teachers/:id
const updateTeacher = async (req, res) => {
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
                const existingTeacher = await Teacher.findOne(query);

                if (existingTeacher) {
                    return res.status(400).json({
                        success: false,
                        message: "Teacher with this email or employee ID already exists",
                    });
                }
            }
        }

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        const teacherToUpdate = await Teacher.findById(id);
        if (!teacherToUpdate) return res.status(404).json({ success: false, message: "Teacher not found" });

        if (!admin.collegeId || (teacherToUpdate.collegeId && teacherToUpdate.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. Teacher belongs to another college." });
        }

        const teacher = await Teacher.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("department", "name code");

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
            teacher,
        });
    } catch (error) {
        console.error("Error updating teacher:", error);
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
            message: "Failed to update teacher",
            error: error.message,
        });
    }
};

// @route DELETE /admin/teachers/:id
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const adminId = req.userId;
        const admin = await User.findById(adminId).select("collegeId");

        const teacherToDelete = await Teacher.findById(id);
        if (!teacherToDelete) return res.status(404).json({ success: false, message: "Teacher not found" });

        if (!admin.collegeId || (teacherToDelete.collegeId && teacherToDelete.collegeId.toString() !== admin.collegeId.toString())) {
            return res.status(403).json({ success: false, message: "Access denied. Teacher belongs to another college." });
        }

        const teacher = await Teacher.findByIdAndDelete(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Teacher deleted successfully",
            teacher,
        });
    } catch (error) {
        console.error("Error deleting teacher:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete teacher",
            error: error.message,
        });
    }
};

// @route GET /admin/teachers/stats
const getTeacherStats = async (req, res) => {
    try {
        const totalTeachers = await Teacher.countDocuments();
        const activeTeachers = await Teacher.countDocuments({ isActive: true });
        const inactiveTeachers = await Teacher.countDocuments({ isActive: false });

        const byDesignation = await Teacher.aggregate([
            { $group: { _id: "$designation", count: { $sum: 1 } } },
        ]);

        const avgExperience = await Teacher.aggregate([
            { $group: { _id: null, avg: { $avg: "$experience" } } },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalTeachers,
                activeTeachers,
                inactiveTeachers,
                byDesignation,
                avgExperience: avgExperience.length > 0 ? Math.round(avgExperience[0].avg * 10) / 10 : 0,
            },
        });
    } catch (error) {
        console.error("Error fetching teacher stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch teacher statistics",
            error: error.message,
        });
    }
};

module.exports = {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherStats,
};
