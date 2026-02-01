const express = require("express");
const router = express.Router();
const passport = require("passport");
const decodeToken = require("../middlewares/auth/decodeToken");
const optionalDecodeToken = require("../middlewares/auth/optionalDecodeToken");

const {
  createSuccessStory,
  getSuccessStories,
  getPendingStories,
  getUserStories,
  getSuccessStoryById,
  updateSuccessStory,
  deleteSuccessStory,
  toggleLikeStory,
  addComment,
  moderateStory,
  getStoriesForModeration
} = require("../controllers/successStory.controller");

const fileUpload = require("../middlewares/post/fileUpload");
const requireAdminAuth = require("../middlewares/auth/adminAuth");

// Public routes
router.get("/", optionalDecodeToken, getSuccessStories);
router.get("/:id", optionalDecodeToken, getSuccessStoryById);

// Protected routes (require authentication)
router.use(passport.authenticate("jwt", { session: false }));
router.use(decodeToken);

// Alumni routes
router.post("/", fileUpload, createSuccessStory);
router.get("/user/stories", getUserStories);
router.put("/:id", fileUpload, updateSuccessStory);
router.delete("/:id", deleteSuccessStory);
router.post("/:id/like", toggleLikeStory);
router.post("/:id/comment", addComment);

// Admin only routes
router.get("/admin/pending", requireAdminAuth, getPendingStories);
router.get("/admin/moderation", requireAdminAuth, getStoriesForModeration);
router.put("/admin/moderate/:id", requireAdminAuth, moderateStory);

module.exports = router;