const Class = require("../models/class.model");
const Department = require("../models/department.model");
const User = require("../models/user.model");

// @route GET /admin/classes
// @route GET /admin/classes
const getAllClasses = async (req, res) => {
    try {
        const { department, isActive } = req.query;
        let query = {};

        // Enforce College Isolation
        if (req.collegeId) {
            query.collegeId = req.collegeId;
        } else if (req.query.collegeId) {
            // Allow filtering by college for Super Admin
            query.collegeId = req.query.collegeId;
        }

        if (department) {
            query.department = department;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const classes = await Class.find(query)
            .populate("department", "name code")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: classes.length,
            classes,
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch classes",
            error: error.message,
        });
    }
};

// @route POST /admin/classes
const createClass = async (req, res) => {
    try {
        const { name, department, academicYear, semester } = req.body;

        if (!name || !department || !semester) {
            return res.status(400).json({
                success: false,
                message: "Name, department, and semester are required",
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

        // Check if class with same name exists in department
        const existingClass = await Class.findOne({ name, department });
        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: "Class with this name already exists in the department",
            });
        }

        // Determine College ID
        const collegeId = req.collegeId || req.body.collegeId;
        if (!collegeId) {
            return res.status(400).json({ message: "College ID is required." });
        }

        const newClass = new Class({
            name,
            department,
            academicYear,
            semester,
            collegeId,
        });

        await newClass.save();

        const populatedClass = await Class.findById(newClass._id).populate("department", "name code");

        res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: populatedClass,
        });
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create class",
            error: error.message,
        });
    }
};

// @route PUT /admin/classes/:id
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, academicYear, semester, isActive } = req.body;

        const classToUpdate = await Class.findById(id);
        if (!classToUpdate) return res.status(404).json({ success: false, message: "Class not found" });

        // Enforce College Isolation
        if (req.collegeId && classToUpdate.collegeId && classToUpdate.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. Class belongs to another college." });
        }

        const updatedClass = await Class.findByIdAndUpdate(
            id,
            { name, academicYear, semester, isActive },
            { new: true, runValidators: true }
        ).populate("department", "name code");

        if (!updatedClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Class updated successfully",
            class: updatedClass,
        });
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update class",
            error: error.message,
        });
    }
};

// @route DELETE /admin/classes/:id
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const classToDelete = await Class.findById(id);
        if (!classToDelete) return res.status(404).json({ success: false, message: "Class not found" });

        // Enforce College Isolation
        if (req.collegeId && classToDelete.collegeId && classToDelete.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. Class belongs to another college." });
        }

        // Check if class has sections (to be implemented if Section model is used)
        // For now, just delete
        const deletedClass = await Class.findByIdAndDelete(id);

        if (!deletedClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Class deleted successfully",
            class: deletedClass,
        });
    } catch (error) {
        console.error("Error deleting class:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete class",
            error: error.message,
        });
    }
};

module.exports = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass,
};
