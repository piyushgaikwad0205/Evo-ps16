const Section = require("../models/section.model");
const Class = require("../models/class.model");
const User = require("../models/user.model");
const Teacher = require("../models/teacher.model");

// @route GET /admin/sections
// @route GET /admin/sections
const getAllSections = async (req, res) => {
    try {
        const { class: classId, isActive, classTeacher } = req.query;
        let query = {};

        // Enforce College Isolation
        if (req.collegeId) {
            query.collegeId = req.collegeId;
        } else if (req.query.collegeId) {
            query.collegeId = req.query.collegeId;
        }

        if (classId) {
            query.class = classId;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        if (classTeacher) {
            query.classTeacher = classTeacher;
        }

        const sections = await Section.find(query)
            .populate("class", "name department")
            .populate("classTeacher", "name employeeId")
            .sort({ name: 1 });

        // Get student counts for each section
        const sectionsWithCounts = await Promise.all(sections.map(async (section) => {
            const studentCount = await User.countDocuments({ sectionId: section._id });
            return {
                ...section.toObject(),
                studentCount
            };
        }));

        res.status(200).json({
            success: true,
            count: sectionsWithCounts.length,
            sections: sectionsWithCounts,
        });
    } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch sections",
            error: error.message,
        });
    }
};

// @route POST /admin/sections
const createSection = async (req, res) => {
    try {
        const { name, class: classId, maxStudents, classTeacher } = req.body;

        if (!name || !classId) {
            return res.status(400).json({
                success: false,
                message: "Name and class are required",
            });
        }

        // Verify class exists
        const cls = await Class.findById(classId);
        if (!cls) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        // Check if section with same name exists in class
        const existingSection = await Section.findOne({ name, class: classId });
        if (existingSection) {
            return res.status(400).json({
                success: false,
                message: "Section with this name already exists in the class",
            });
        }

        // Determine College ID
        const collegeId = req.collegeId || req.body.collegeId;
        if (!collegeId) {
            return res.status(400).json({ message: "College ID is required." });
        }

        const newSection = new Section({
            name,
            class: classId,
            maxStudents: maxStudents || 60,
            classTeacher: classTeacher || null,
            collegeId,
        });

        await newSection.save();

        const populatedSection = await Section.findById(newSection._id)
            .populate("class", "name department")
            .populate("classTeacher", "name employeeId");

        res.status(201).json({
            success: true,
            message: "Section created successfully",
            section: populatedSection,
        });
    } catch (error) {
        console.error("Error creating section:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create section",
            error: error.message,
        });
    }
};

// @route PUT /admin/sections/:id
const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, maxStudents, classTeacher, isActive } = req.body;

        const sectionToUpdate = await Section.findById(id);
        if (!sectionToUpdate) return res.status(404).json({ success: false, message: "Section not found" });

        // Enforce College Isolation
        if (req.collegeId && sectionToUpdate.collegeId && sectionToUpdate.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. Section belongs to another college." });
        }

        const updatedSection = await Section.findByIdAndUpdate(
            id,
            { name, maxStudents, classTeacher, isActive },
            { new: true, runValidators: true }
        )
            .populate("class", "name department")
            .populate("classTeacher", "name employeeId");

        if (!updatedSection) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Section updated successfully",
            section: updatedSection,
        });
    } catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update section",
            error: error.message,
        });
    }
};

// @route DELETE /admin/sections/:id
const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;

        const sectionToDelete = await Section.findById(id);
        if (!sectionToDelete) return res.status(404).json({ success: false, message: "Section not found" });

        // Enforce College Isolation
        if (req.collegeId && sectionToDelete.collegeId && sectionToDelete.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. Section belongs to another college." });
        }

        const deletedSection = await Section.findByIdAndDelete(id);

        if (!deletedSection) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            section: deletedSection,
        });
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete section",
            error: error.message,
        });
    }
};

// @route PUT /admin/sections/move-students
const moveStudents = async (req, res) => {
    try {
        const { studentIds, targetSectionId, targetClassId } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No students selected",
            });
        }

        if (!targetSectionId || !targetClassId) {
            return res.status(400).json({
                success: false,
                message: "Target section and class are required",
            });
        }

        // Verify section belongs to class
        const section = await Section.findOne({ _id: targetSectionId, class: targetClassId });
        if (!section) {
            return res.status(400).json({
                success: false,
                message: "Target section does not belong to the target class",
            });
        }

        // Enforce College Isolation on the target section
        if (req.collegeId && section.collegeId && section.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ message: "Target section belongs to another college." });
        }

        // Update users
        // Note: Ideally we should verify the students also belong to the college, but for now assuming admin only passes valid IDs
        await User.updateMany(
            { _id: { $in: studentIds } },
            { $set: { sectionId: targetSectionId, classId: targetClassId } }
        );

        res.status(200).json({
            success: true,
            message: `Successfully moved ${studentIds.length} students`,
        });
    } catch (error) {
        console.error("Error moving students:", error);
        res.status(500).json({
            success: false,
            message: "Failed to move students",
            error: error.message,
        });
    }
};

// @route GET /admin/sections/stats
const getSectionStats = async (req, res) => {
    try {
        const query = {};
        if (req.collegeId) {
            query.collegeId = req.collegeId;
        }

        const totalClasses = await Class.countDocuments(query);
        const totalSections = await Section.countDocuments(query);

        // Count students in sections (users with sectionId)
        // Note: Users also have collegeId, constructing query for users
        const userQuery = { sectionId: { $ne: null } };
        if (req.collegeId) {
            userQuery.collegeId = req.collegeId;
        }
        const studentsInSections = await User.countDocuments(userQuery);

        // Count sections with assigned teachers
        const teacherQuery = { ...query, classTeacher: { $ne: null } };
        const sectionsWithTeachers = await Section.countDocuments(teacherQuery);

        res.status(200).json({
            success: true,
            stats: {
                totalClasses,
                totalSections,
                studentsInSections,
                sectionsWithTeachers
            }
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics",
            error: error.message,
        });
    }
};

// @route GET /admin/sections/:id/students
const getSectionStudents = async (req, res) => {
    try {
        const { id } = req.params;

        const section = await Section.findById(id);
        if (!section) return res.status(404).json({ message: "Section not found" });

        if (req.collegeId && section.collegeId && section.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ message: "Access denied. Section belongs to another college." });
        }

        const students = await User.find({ sectionId: id, role: "student" })
            .select("name email _id")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        console.error("Error fetching section students:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch students",
            error: error.message
        });
    }
};

module.exports = {
    getAllSections,
    createSection,
    updateSection,
    deleteSection,
    moveStudents,
    getSectionStats,
    getSectionStudents
};
