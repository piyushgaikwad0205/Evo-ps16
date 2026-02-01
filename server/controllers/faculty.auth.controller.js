const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HOD = require("../models/hod.model");
const Teacher = require("../models/teacher.model");
const Staff = require("../models/staff.model");

// @route POST /api/faculty/signin
// @desc Faculty/Staff signin with auto-detection
const facultySignin = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Normalize email and trim password
        email = email.toLowerCase().trim();
        password = password.trim();

        let user = null;
        let userType = null;

        console.log(`[Faculty Auth] Attempting signin for email: ${email}`);

        // Check in HOD collection
        user = await HOD.findOne({ email }).select("+password").populate("department", "name code");
        if (user) {
            console.log(`[Faculty Auth] Found user in HOD collection: ${user.email}`);
            userType = "hod";
        } else {
            console.log(`[Faculty Auth] Not found in HOD collection`);
        }

        // Check in Teacher collection if not found
        if (!user) {
            user = await Teacher.findOne({ email }).select("+password").populate("department", "name code");
            if (user) {
                console.log(`[Faculty Auth] Found user in Teacher collection: ${user.email}`);
                userType = "teacher";
            } else {
                console.log(`[Faculty Auth] Not found in Teacher collection`);
            }
        }

        // Check in Staff collection if not found
        if (!user) {
            user = await Staff.findOne({ email }).select("+password");
            if (user) {
                console.log(`[Faculty Auth] Found user in Staff collection: ${user.email}`);
                userType = "staff";
            } else {
                console.log(`[Faculty Auth] Not found in Staff collection`);
            }
        }

        // If user not found in any collection
        if (!user) {
            console.log(`[Faculty Auth] User not found in any collection: ${email}`);
            return res.status(401).json({
                success: false,
                message: "User not found with this email",
            });
        }

        // Check if password is set
        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: "Your account credentials have not been set up yet. Please contact administration.",
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact administration.",
            });
        }

        // Verify password
        console.log(`[Faculty Auth] Verifying password for user: ${user.email}`);
        console.log(`[Faculty Auth] Stored hash length: ${user.password ? user.password.length : 'N/A'}`);
        console.log(`[Faculty Auth] Provided password length: ${password.length}`);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`[Faculty Auth] Password verification failed`);
            return res.status(401).json({
                success: false,
                message: "Incorrect password",
            });
        }
        console.log(`[Faculty Auth] Password verification successful`);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                type: userType,
                employeeId: user.employeeId,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        // Remove password from response
        const userObject = user.toObject();
        delete userObject.password;

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token,
            user: userObject,
            userType,
        });
    } catch (error) {
        console.error("Faculty signin error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during signin",
            error: error.message,
        });
    }
};

// @route GET /api/faculty/me
// @desc Get current faculty/staff user
const getCurrentUser = async (req, res) => {
    try {
        const { type, id } = req.user; // From auth middleware

        let user = null;

        if (type === "hod") {
            user = await HOD.findById(id).populate("department", "name code");
        } else if (type === "teacher") {
            user = await Teacher.findById(id).populate("department", "name code");
        } else if (type === "staff") {
            user = await Staff.findById(id);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
            userType: type,
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

module.exports = {
    facultySignin,
    getCurrentUser,
};
