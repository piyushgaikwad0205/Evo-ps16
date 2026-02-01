
const router = require("express").Router();
const express = require("express");
const passport = require("passport");
const userController = require("../controllers/user.controller");
const { addUserValidator, addUserValidatorHandler } = require("../middlewares/users/usersValidator");
const decodeToken = require("../middlewares/auth/decodeToken");
const { sendVerificationEmail } = require("../middlewares/users/verifyEmail");
const avatarUpload = require("../middlewares/users/avatarUpload");
const userModerationController = require("../controllers/userModeration.controller");
const userPushController = require("../controllers/userPush.controller");
const passwordResetController = require("../controllers/passwordReset.controller");
const notificationController = require("../controllers/notification.controller");

// Non-authenticated routes
router.post("/register", avatarUpload, addUserValidator, addUserValidatorHandler, userController.addUser, sendVerificationEmail);
router.post("/signup", avatarUpload, addUserValidator, addUserValidatorHandler, userController.addUser, sendVerificationEmail);
router.post("/login", userController.signin);
router.post("/signin", userController.signin);
router.post("/forgot-password", passwordResetController.forgotPassword);
router.post("/reset-password", passwordResetController.resetPassword);

// All subsequent routes should be authenticated
router.use(passport.authenticate("jwt", { session: false }), decodeToken);

router.get("/me/notifications", notificationController.getUserNotifications);
router.patch("/me/notifications/read-all", notificationController.markAllAsRead);
router.delete("/me/notifications/:id", notificationController.deleteNotification);
router.patch("/me/notifications/:id/read", notificationController.markAsRead);
router.get("/public-users", userController.getPublicUsers);
router.get("/followers", userController.getFollowers);
router.get("/following", userController.getFollowing);
router.get("/search", userController.searchUsers);

// User Push Notifications
router.post("/fcm-token", userPushController.registerFcmToken);

// User Profile
router.get("/:id", userController.getUser); // Direct user fetch by ID
router.get("/profile/:id", userController.getUser);
router.get("/:id/posts", (req, res) => {
    // Return empty array for now - posts feature can be implemented later
    res.json([]);
});
router.put("/profile", avatarUpload, userController.updateInfo);


// User Connections - TODO: Implement these features

// User Moderation
router.post("/:userId/block", userModerationController.blockUser);
router.post("/:userId/unblock", userModerationController.unblockUser);
router.post("/:userId/report", express.json(), userModerationController.reportUser);

// Search


module.exports = router;
