const express = require("express");
const router = express.Router();
const passport = require("passport");
const decodeToken = require("../middlewares/auth/decodeToken");

const {
  sendConnectionRequest,
  respondToConnectionRequest,
  getUserConnections,
  getPendingRequests,
  removeConnection,
  checkConnectionStatus,
} = require("../controllers/connection.controller");

// All routes require authentication
router.use(passport.authenticate("jwt", { session: false }));
router.use(decodeToken);

// Connection management routes
router.post("/request", sendConnectionRequest);
router.put("/:connectionId/respond", respondToConnectionRequest);
router.get("/my-connections", getUserConnections);
router.get("/pending-requests", getPendingRequests);
router.delete("/:connectionId", removeConnection);
router.get("/status/:userId", checkConnectionStatus);

module.exports = router; 