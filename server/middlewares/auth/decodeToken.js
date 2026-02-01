const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");

/**
 * NOTE: This middleware for decoding JWT is not necessary when using Passport's JWT strategy.
 * Passport handles token decoding and user extraction automatically.
 */

const decodeToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const parts = authHeader.split(" ");
    const token = parts.length === 2 ? parts[1] : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.SECRET || "dev_secret_change_me");
    req.userId = decoded.id;

    // Populate user object for logging and authorization
    try {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        req.userRole = user.role;
      }
    } catch (_) { }

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = decodeToken;
