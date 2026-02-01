const Department = require("../models/department.model");
const User = require("../models/user.model");

// @route GET /admin/departments
// Get all departments
// @route GET /admin/departments
// Get all departments
const getAllDepartments = async (req, res) => {
    try {
        const { search, isActive, sort = "name", order = "asc" } = req.query;

        // Build query
        let query = {};

        // Enforce College Isolation
        if (req.collegeId) {
            query.collegeId = req.collegeId;
        } else if (req.query.collegeId) {
            query.collegeId = req.query.collegeId;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } },
                { headOfDepartment: { $regex: search, $options: "i" } },
            ];
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        // Build sort
        const sortOrder = order === "desc" ? -1 : 1;
        const sortObj = { [sort]: sortOrder };

        const departments = await Department.find(query).sort(sortObj);

        res.status(200).json({
            success: true,
            count: departments.length,
            departments,
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
            error: error.message,
        });
    }
};

// @route GET /admin/departments/:id
// Get single department by ID
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        // Enforce College Isolation
        if (req.collegeId && department.collegeId && department.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. Department belongs to another college." });
        }

        res.status(200).json({
            success: true,
            department,
        });
    } catch (error) {
        console.error("Error fetching department:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch department",
            error: error.message,
        });
    }
};

// @route POST /admin/departments
// Create new department
const createDepartment = async (req, res) => {
    try {
        const {
            name,
            code,
            description,
            headOfDepartment,
            email,
            phone,
            building,
            floor,
            totalStudents,
            totalFaculty,
            establishedYear,
            isActive,
            programs,
            website,
        } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Department name and code are required",
            });
        }

        // Check if department with same name or code already exists
        const existingDept = await Department.findOne({
            $or: [{ name }, { code: code.toUpperCase() }],
        });

        if (existingDept) {
            return res.status(400).json({
                success: false,
                message: "Department with this name or code already exists",
            });
        }

        // Determine College ID
        const collegeId = req.collegeId || req.body.collegeId;
        if (!collegeId) {
            return res.status(400).json({ message: "College ID is required." });
        }

        const department = new Department({
            name,
            code: code.toUpperCase(),
            description,
            headOfDepartment,
            email,
            phone,
            building,
            floor,
            totalStudents,
            totalFaculty,
            establishedYear,
            isActive,
            programs,
            website,
            collegeId,
        });

        await department.save();

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            department,
        });
    } catch (error) {
        console.error("Error creating department:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create department",
            error: error.message,
        });
    }
};

// @route PUT /admin/departments/:id
// Update department
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If code is being updated, convert to uppercase
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }

        // Check if updating to a name/code that already exists (excluding current department)
        if (updateData.name || updateData.code) {
            const query = { _id: { $ne: id } };
            const orConditions = [];

            if (updateData.name) {
                orConditions.push({ name: updateData.name });
            }
            if (updateData.code) {
                orConditions.push({ code: updateData.code });
            }

            if (orConditions.length > 0) {
                query.$or = orConditions;
                const existingDept = await Department.findOne(query);

                if (existingDept) {
                    return res.status(400).json({
                        success: false,
                        message: "Department with this name or code already exists",
                    });
                }
            }
        }

        const deptToUpdate = await Department.findById(id);
        if (!deptToUpdate) return res.status(404).json({ success: false, message: "Department not found" });

        // Enforce College Isolation
        if (req.collegeId && deptToUpdate.collegeId && deptToUpdate.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. Department belongs to another college." });
        }

        const department = await Department.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department,
        });
    } catch (error) {
        console.error("Error updating department:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update department",
            error: error.message,
        });
    }
};

// @route DELETE /admin/departments/:id
// Delete department
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const deptToDelete = await Department.findById(id);
        if (!deptToDelete) return res.status(404).json({ success: false, message: "Department not found" });

        // Enforce College Isolation
        if (req.collegeId && deptToDelete.collegeId && deptToDelete.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. Department belongs to another college." });
        }

        const department = await Department.findByIdAndDelete(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Department deleted successfully",
            department,
        });
    } catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete department",
            error: error.message,
        });
    }
};

// @route GET /admin/departments/stats
// Get department statistics
const getDepartmentStats = async (req, res) => {
    try {
        const query = {};
        if (req.collegeId) {
            query.collegeId = req.collegeId;
        }

        const totalDepartments = await Department.countDocuments(query);
        const activeDepartments = await Department.countDocuments({ ...query, isActive: true });
        const inactiveDepartments = await Department.countDocuments({ ...query, isActive: false });

        const totalStudentsAgg = await Department.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: "$totalStudents" } } },
        ]);

        const totalFacultyAgg = await Department.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: "$totalFaculty" } } },
        ]);

        const totalStudents = totalStudentsAgg.length > 0 ? totalStudentsAgg[0].total : 0;
        const totalFaculty = totalFacultyAgg.length > 0 ? totalFacultyAgg[0].total : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalDepartments,
                activeDepartments,
                inactiveDepartments,
                totalStudents,
                totalFaculty,
            },
        });
    } catch (error) {
        console.error("Error fetching department stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch department statistics",
            error: error.message,
        });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentStats,
};
