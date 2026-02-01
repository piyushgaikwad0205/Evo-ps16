const User = require("../models/user.model");
const Relationship = require("../models/relationship.model");
const FollowRequest = require("../models/followRequest.model");
const UserNotification = require("../models/userNotification.model");
const { saveLogInfo } = require("../middlewares/logger/logInfo");

/**
 * Follow a user
 */
const followUser = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.userId;

        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        const existingRelationship = await Relationship.findOne({
            follower: currentUserId,
            following: targetUserId
        });

        if (existingRelationship) {
            return res.status(400).json({ message: "Already following this user" });
        }

        // Check if pending request exists
        const existingRequest = await FollowRequest.findOne({
            requester: currentUserId,
            recipient: targetUserId
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Follow request already pending" });
        }

        // Check if user is private
        if (targetUser.isPrivate) {
            const newRequest = new FollowRequest({
                requester: currentUserId,
                recipient: targetUserId
            });
            await newRequest.save();

            // Create Notification for Request
            await UserNotification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow', // utilizing 'follow' type for request notification as well or distinction? 'follow' usually means "started following". Let's use 'follow' and content determines.
                content: 'requested to follow you.',
                isRead: false
            });

            return res.status(200).json({
                message: "Follow request sent",
                status: "requested"
            });
        } else {
            // Public profile - Follow immediately
            const newRelationship = new Relationship({
                follower: currentUserId,
                following: targetUserId
            });
            await newRelationship.save();

            // Create Notification for Follow
            await UserNotification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow',
                content: 'started following you.',
                isRead: false
            });

            // Update counts
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });

            return res.status(200).json({
                message: "You are now following this user",
                status: "following"
            });
        }

    } catch (error) {
        console.error("Follow User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.userId;

        // Check relationship
        const relationship = await Relationship.findOneAndDelete({
            follower: currentUserId,
            following: targetUserId
        });

        if (relationship) {
            // Update counts
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });

            return res.status(200).json({ message: "Unfollowed successfully" });
        }

        // Check pending request (Cancel request)
        const request = await FollowRequest.findOneAndDelete({
            requester: currentUserId,
            recipient: targetUserId
        });

        if (request) {
            return res.status(200).json({ message: "Follow request cancelled" });
        }

        return res.status(400).json({ message: "You are not following this user" });

    } catch (error) {
        console.error("Unfollow User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get pending received requests
 */
const getFollowRequests = async (req, res) => {
    try {
        const requests = await FollowRequest.find({ recipient: req.userId })
            .populate("requester", "name username avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (error) {
        console.error("Get Requests Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Accept/Reject Follow Request
 */
const respondToFollowRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        const currentUserId = req.userId;

        const request = await FollowRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.recipient.toString() !== currentUserId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (action === 'accept') {
            // Create relationship
            const newRelationship = new Relationship({
                follower: request.requester,
                following: currentUserId
            });
            await newRelationship.save();

            // Update counts
            await User.findByIdAndUpdate(request.requester, { $addToSet: { following: currentUserId } });
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { followers: request.requester } });

            // Delete request
            await FollowRequest.findByIdAndDelete(requestId);

            return res.status(200).json({ message: "Request accepted" });
        } else if (action === 'reject') {
            await FollowRequest.findByIdAndDelete(requestId);
            return res.status(200).json({ message: "Request rejected" });
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

    } catch (error) {
        console.error("Respond Request Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Check Relationship Status
 */
const checkFollowStatus = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.userId;

        const relationship = await Relationship.findOne({
            follower: currentUserId,
            following: targetUserId
        });

        if (relationship) {
            return res.status(200).json({ status: "following" });
        }

        const request = await FollowRequest.findOne({
            requester: currentUserId,
            recipient: targetUserId
        });

        if (request) {
            return res.status(200).json({ status: "requested" });
        }

        // Check if they follow me (Follow Back)
        const followsMe = await Relationship.findOne({
            follower: targetUserId,
            following: currentUserId
        });

        return res.status(200).json({
            status: "none",
            followsMe: !!followsMe
        });

    } catch (error) {
        console.error("Check Status Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get Followers
 */
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, skip = 0 } = req.query;

        const relationships = await Relationship.find({ following: userId })
            .populate("follower", "name username avatar")
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const followers = relationships.map(r => r.follower);

        // Enrich with "Am I following them?"
        // This optimization might be needed for UI buttons

        res.status(200).json({ followers });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

/**
 * Get Following
 */
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, skip = 0 } = req.query;

        const relationships = await Relationship.find({ follower: userId })
            .populate("following", "name username avatar")
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const following = relationships.map(r => r.following);

        res.status(200).json({ following });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

/**
 * Remove a follower (make them unfollow me)
 */
const removeFollower = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.userId;

        // Remove relationship where they follow me
        const relationship = await Relationship.findOneAndDelete({
            follower: targetUserId,
            following: currentUserId
        });

        if (relationship) {
            // Update counts
            await User.findByIdAndUpdate(currentUserId, { $pull: { followers: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { following: currentUserId } });

            return res.status(200).json({ message: "Follower removed" });
        }

        return res.status(404).json({ message: "Relationship not found" });

    } catch (error) {
        console.error("Remove Follower Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowRequests,
    respondToFollowRequest,
    checkFollowStatus,
    getFollowers,
    getFollowing,
    removeFollower
};
