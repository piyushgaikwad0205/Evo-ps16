const express = require("express");
const router = express.Router();
const passport = require("passport");
const decodeToken = require("../middlewares/auth/decodeToken");

const {
  registerAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAlumniDirectory,
  getAlumniStats,
  verifyAlumni
} = require("../controllers/alumni.controller");

const { sendVerificationEmail } = require("../middlewares/users/verifyEmail");
const avatarUpload = require("../middlewares/users/avatarUpload");
const requireAdminAuth = require("../middlewares/auth/adminAuth");

// Public routes
router.post("/register", avatarUpload, registerAlumni);
router.get("/directory", getAlumniDirectory);

// Protected routes (require authentication)
router.use(passport.authenticate("jwt", { session: false }));
router.use(decodeToken);

router.get("/profile/:id", getAlumniProfile);
router.put("/profile/:id", avatarUpload, updateAlumniProfile);
router.get("/stats", getAlumniStats);

// Admin only routes
router.put("/verify/:id", requireAdminAuth, verifyAlumni);

module.exports = router;