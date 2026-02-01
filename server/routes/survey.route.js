const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  createSurvey,
  getSurveys,
  getSurveyById,
  submitSurveyResponse,
  updateSurvey,
  deleteSurvey,
  updateSurveyStatus,
  getSurveyAnalytics
} = require("../controllers/survey.controller");

const requireAdminAuth = require("../middlewares/auth/adminAuth");
const decodeToken = require("../middlewares/auth/decodeToken");

// Protected routes (require authentication)
router.use(passport.authenticate("jwt", { session: false }));
router.use(decodeToken);

// Routes accessible to all authenticated users
router.get("/", getSurveys);
router.get("/:id", getSurveyById);
router.post("/:id/respond", submitSurveyResponse);

// Admin/Creator routes
router.post("/", requireAdminAuth, createSurvey);
router.put("/:id", updateSurvey);
router.delete("/:id", deleteSurvey);
router.patch("/:id/status", updateSurveyStatus);
router.get("/:id/analytics", getSurveyAnalytics);

module.exports = router;