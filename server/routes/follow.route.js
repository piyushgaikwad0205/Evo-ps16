const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth/decodeToken");
const followController = require("../controllers/follow.controller");

// Follow/Unfollow
router.post("/follow", verifyToken, followController.followUser);
router.delete("/unfollow/:targetUserId", verifyToken, followController.unfollowUser);

// Requests
router.get("/requests", verifyToken, followController.getFollowRequests);
router.post("/requests/:requestId", verifyToken, followController.respondToFollowRequest);

// Status
router.get("/status/:targetUserId", verifyToken, followController.checkFollowStatus);

// Remove Follower
router.delete("/remove-follower/:targetUserId", verifyToken, followController.removeFollower);

// Lists
router.get("/:userId/followers", verifyToken, followController.getFollowers);
router.get("/:userId/following", verifyToken, followController.getFollowing);

module.exports = router;
