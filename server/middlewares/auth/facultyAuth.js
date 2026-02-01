const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");

const requireFacultyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

        // Check if it's a faculty/staff token
        if (!["hod", "teacher", "staff"].includes(decoded.type)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Faculty/Staff only.",
            });
        }

        // Fetch full user object for logging
        try {
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            } else {
                req.user = decoded;
            }
        } catch {
            req.user = decoded;
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

module.exports = requireFacultyAuth;
