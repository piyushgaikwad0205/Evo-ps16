const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin.model");
const AdminToken = require("../../models/token.admin.model");

const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // Check if the token exists in the database first
    const tokenExists = await AdminToken.findOne({ accessToken: token });
    if (!tokenExists) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.SECRET || "dev_secret_change_me");
    const admin = await Admin.findById(decoded.id);

    if (admin) {
      // Set admin ID in request for use in controllers
      req.adminId = decoded.id;
      req.admin = admin;
      req.adminRole = admin.role;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = requireAdminAuth;
