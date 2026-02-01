const router = require("express").Router();
const passport = require("passport");
const decodeToken = require("../middlewares/auth/decodeToken");
const fileUpload = require("../middlewares/post/fileUpload");

const {
  createTextStory,
  createMediaStory,
  getFollowingStories,
  markViewed,
  deleteStory,
  createHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
} = require("../controllers/story.controller");

const requireAuth = passport.authenticate("jwt", { session: false }, null);

router.use(requireAuth, decodeToken);

// Stories
router.get("/feed", getFollowingStories);
router.post("/text", createTextStory);
router.post("/media", fileUpload, createMediaStory);
router.post("/:id/view", markViewed);
router.delete("/:id", deleteStory);
router.post("/:id/react", require("../controllers/story.controller").reactToStory);
router.post("/:id/vote", require("../controllers/story.controller").votePoll);

// Highlights
router.get("/highlights/:userId", getHighlights);
router.post("/highlights", createHighlight);
router.put("/highlights/:id", updateHighlight);
router.delete("/highlights/:id", deleteHighlight);

module.exports = router;

