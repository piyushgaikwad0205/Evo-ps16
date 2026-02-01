const router = require("express").Router();
const {
    facultySignin,
    getCurrentUser,
} = require("../controllers/faculty.auth.controller");
const requireFacultyAuth = require("../middlewares/auth/facultyAuth");

// Public routes
router.post("/signin", facultySignin);

// Protected routes
router.get("/me", requireFacultyAuth, getCurrentUser);

// Class & Section routes
const { getAllClasses } = require("../controllers/class.controller");
const { getAllSections, getSectionStats } = require("../controllers/section.controller");

router.get("/classes", requireFacultyAuth, getAllClasses);
router.get("/sections", requireFacultyAuth, getAllSections);
router.get("/sections/stats", requireFacultyAuth, getSectionStats);

module.exports = router;
