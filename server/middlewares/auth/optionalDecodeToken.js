const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");

const optionalDecodeToken = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || "";
		const parts = authHeader.split(" ");
		const token = parts.length === 2 ? parts[1] : null;
		if (!token) {
			return next();
		}

		const decoded = jwt.verify(token, process.env.SECRET || "dev_secret_change_me");
		req.userId = decoded.id;
		try {
			const user = await User.findById(decoded.id).select("role");
			if (user) {
				req.userRole = user.role;
			}
		} catch (_) {}
	} catch (_) {
		// ignore invalid token for optional auth
	} finally {
		next();
	}
};

module.exports = optionalDecodeToken;