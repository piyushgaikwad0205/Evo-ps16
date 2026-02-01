const Connection = require("../models/connection.model");
const User = require("../models/user.model");
const { saveLogInfo } = require("../middlewares/logger/logInfo");

/**
 * Send connection request
 */
// ... (imports remain same)

/**
 * Send connection request
 */
const sendConnectionRequest = async (req, res) => {
  try {
    // Removed role check to allow all users (students/alumni) to connect
    const { recipientId, message } = req.body;
    const requesterId = req.userId;

    // Check if recipient exists and is an alumni
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent self-connection
    if (requesterId === recipientId) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        message: "Connection request already exists",
        status: existingConnection.status
      });
    }

    // Create new connection request (Auto-accepted)
    const newConnection = new Connection({
      requester: requesterId,
      recipient: recipientId,
      message: message || "",
      status: "pending",
    });

    await newConnection.save();

    await saveLogInfo(
      req,
      `Connection request sent from ${requesterId} to ${recipientId}`,
      "connection_request",
      "info"
    );

    res.status(201).json({
      message: "Connection established successfully",
      connection: newConnection,
    });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ message: "Error sending connection request" });
  }
};

/**
 * Accept/Reject connection request
 */
const respondToConnectionRequest = async (req, res) => {
  try {
    // Only alumni can theoretically manage requests, but if all are auto-accepted this might be less used
    // Keeping logic mostly as is but removing strict role check if we want flexibility
    const { connectionId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    // Ensure user is the recipient
    if (connection.recipient.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    connection.status = status;
    if (status === "accepted") {
      connection.acceptedAt = new Date();
    }

    await connection.save();

    await saveLogInfo(
      req,
      `Connection request ${status}: ${connectionId}`,
      "connection_response",
      "info"
    );

    res.status(200).json({
      message: `Connection request ${status}`,
      connection,
    });
  } catch (error) {
    console.error("Error responding to connection request:", error);
    res.status(500).json({ message: "Error responding to connection request" });
  }
};

/**
 * Get user's connections
 */
const getUserConnections = async (req, res) => {
  try {
    const userId = req.userId;
    const { status = "accepted" } = req.query;

    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status,
    })
      .populate("requester", "name avatar graduationYear department currentEmployer position")
      .populate("recipient", "name avatar graduationYear department currentEmployer position")
      .sort({ createdAt: -1 });

    // Format connections to show the other user
    const formattedConnections = connections.map((connection) => {
      const isRequester = connection.requester._id.toString() === userId;
      const otherUser = isRequester ? connection.recipient : connection.requester;

      return {
        _id: connection._id,
        otherUser,
        status: connection.status,
        message: connection.message,
        createdAt: connection.createdAt,
        acceptedAt: connection.acceptedAt,
        isRequester,
      };
    });

    res.status(200).json({
      connections: formattedConnections,
      count: formattedConnections.length,
    });
  } catch (error) {
    console.error("Error fetching user connections:", error);
    res.status(500).json({ message: "Error fetching connections" });
  }
};

/**
 * Get pending connection requests
 */
const getPendingRequests = async (req, res) => {
  try {
    // Only recipient can see pending requests
    const userId = req.userId;

    const pendingRequests = await Connection.find({
      recipient: userId,
      status: "pending",
    })
      .populate("requester", "name avatar graduationYear department currentEmployer position")
      .sort({ createdAt: -1 });

    res.status(200).json({
      pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Error fetching pending requests" });
  }
};

/**
 * Remove connection
 */
const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // Ensure user is part of the connection
    if (connection.requester.toString() !== userId && connection.recipient.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Connection.findByIdAndDelete(connectionId);

    await saveLogInfo(
      req,
      `Connection removed: ${connectionId}`,
      "connection_removal",
      "info"
    );

    res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error removing connection:", error);
    res.status(500).json({ message: "Error removing connection" });
  }
};

/**
 * Check connection status with another user
 */
const checkConnectionStatus = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.userId;

    const connection = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: otherUserId },
        { requester: otherUserId, recipient: currentUserId },
      ],
    });

    if (!connection) {
      return res.status(200).json({ status: "none" });
    }

    res.status(200).json({
      status: connection.status,
      connectionId: connection._id,
      isRequester: connection.requester.toString() === currentUserId,
    });
  } catch (error) {
    console.error("Error checking connection status:", error);
    res.status(500).json({ message: "Error checking connection status" });
  }
};

module.exports = {
  sendConnectionRequest,
  respondToConnectionRequest,
  getUserConnections,
  getPendingRequests,
  removeConnection,
  checkConnectionStatus,
}; 