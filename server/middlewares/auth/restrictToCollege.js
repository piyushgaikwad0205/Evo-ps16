const restrictToCollege = (req, res, next) => {
    // Allow Super Admin to bypass restriction
    // They will operate globally (req.collegeId will be undefined)
    if (req.admin.role === 'superadmin') {
        return next();
    }

    if (!req.admin.college) {
        return res.status(403).json({ message: "Access denied. No college assigned." });
    }

    // Attach collegeId to request for easy access in controllers
    req.collegeId = req.admin.college._id || req.admin.college;
    next();
};

module.exports = restrictToCollege;
