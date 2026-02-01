const express = require("express");
const router = express.Router();
const collegeController = require("../controllers/college.controller");

// Public routes
router.get("/", collegeController.getColleges);

module.exports = router;
