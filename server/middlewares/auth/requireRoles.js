module.exports = function requireRoles(allowedRoles = []) {
	return (req, res, next) => {
		const role = req.userRole || "general";
		if (!allowedRoles.includes(role)) {
			return res.status(403).json({ message: "Access denied" });
		}
		next();
	};
};