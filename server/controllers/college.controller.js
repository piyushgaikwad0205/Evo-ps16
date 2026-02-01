const College = require("../models/college.model");

/**
 * @route GET /colleges
 * @description Get all approved colleges for dropdown
 * @access Public
 */
const getColleges = async (req, res) => {
    try {
        const colleges = await College.find({
            isActive: true,
            status: "approved"
        })
            .select("_id name city state")
            .sort({ name: 1 })
            .lean();

        res.status(200).json(colleges);
    } catch (error) {
        console.error("Error fetching colleges:", error);
        res.status(500).json({ message: "Failed to fetch colleges" });
    }
};

module.exports = {
    getColleges
};

/**
 * @route POST /admin/colleges
 * @description Create a new college (Super Admin only)
 * @access Private
 */
const createCollege = async (req, res) => {
    try {
        const { code } = req.body;
        const existingCollege = await College.findOne({ code });

        if (existingCollege) {
            return res.status(400).json({ message: "College with this code already exists" });
        }

        const collegeData = { ...req.body };
        if (req.fileUrl) {
            collegeData.logo = req.fileUrl;
        }

        const newCollege = new College(collegeData);
        await newCollege.save();

        res.status(201).json(newCollege);
    } catch (error) {
        console.error("Error creating college:", error);
        res.status(500).json({ message: "Failed to create college" });
    }
};

/**
 * @route GET /admin/colleges
 * @description Get all colleges (Admin view)
 * @access Private
 */
const getAllColleges = async (req, res) => {
    try {
        const colleges = await College.find({}).sort({ createdAt: -1 });
        res.status(200).json(colleges);
    } catch (error) {
        console.error("Error fetching colleges:", error);
        res.status(500).json({ message: "Failed to fetch colleges" });
    }
};

/**
 * @route GET /admin/colleges/:id
 * @description Get college by ID
 * @access Private
 */
const getCollegeById = async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }
        res.status(200).json(college);
    } catch (error) {
        console.error("Error fetching college:", error);
        res.status(500).json({ message: "Failed to fetch college" });
    }
};

/**
 * @route PUT /admin/colleges/:id
 * @description Update college details
 * @access Private
 */
const updateCollege = async (req, res) => {
    try {
        const updates = { ...req.body };

        // Handle logo upload if present
        if (req.fileUrl) {
            updates.logo = req.fileUrl;
        }

        const college = await College.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }

        res.status(200).json(college);
    } catch (error) {
        console.error("Error updating college:", error);
        res.status(500).json({ message: "Failed to update college" });
    }
};

/**
 * @route DELETE /admin/colleges/:id
 * @description Delete a college
 * @access Private
 */
const deleteCollege = async (req, res) => {
    try {
        const college = await College.findByIdAndDelete(req.params.id);
        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }
        res.status(200).json({ message: "College deleted successfully" });
    } catch (error) {
        console.error("Error deleting college:", error);
        res.status(500).json({ message: "Failed to delete college" });
    }
};

/**
 * @route POST /admin/create-super-admin
 * @description Initial setup for super admin
 * @access Public (Dev only/Restricted)
 */
const createInitialSuperAdmin = async (req, res) => {
    const Admin = require("../models/admin.model");
    const bcrypt = require("bcrypt");

    try {
        const { username, password, email } = req.body;

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newAdmin = await Admin.create({
            username,
            email,
            password: hashedPassword,
            role: "superadmin"
        });

        res.status(201).json({ message: "Super Admin created", adminId: newAdmin._id });
    } catch (error) {
        console.error("Error creating super admin:", error);
        res.status(500).json({ message: "Failed to create super admin" });
    }
};

module.exports = {
    getColleges,
    createCollege,
    getAllColleges,
    getCollegeById,
    updateCollege,
    deleteCollege,
    createInitialSuperAdmin
};
