const mongoose = require('mongoose');
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const { sendToTokens } = require("../services/fcm");
const { createUserNotification } = require("./notification.controller");

const fs = require("fs");
const path = require("path");

const logDebug = (msg) => {
  const logFile = path.join(__dirname, "../debug_messages.txt");
  fs.appendFileSync(logFile, new Date().toISOString() + ": " + msg + "\n");
};

// Create or get DM conversation between two users
const getOrCreateDM = async (req, res) => {
  try {
    const { userId: currentUserId } = req;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required" });
    }

    const target = await User.findById(targetUserId).select("_id");
    if (!target) return res.status(404).json({ message: "User not found" });

    const Connection = require("../models/connection.model");

    let convo = await Conversation.findOne({
      type: "dm",
      participants: { $all: [currentUserId, targetUserId] },
    });

    // Check for existing connection before allowing chat
    const hasConnection = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: targetUserId },
        { requester: targetUserId, recipient: currentUserId }
      ],
      status: "accepted"
    });

    if (!hasConnection) {
      return res.status(403).json({
        message: "You can only message users you are connected with."
      });
    }

    if (!convo) {
      convo = await Conversation.create({
        type: "dm",
        participants: [currentUserId, targetUserId],
        createdBy: currentUserId,
      });
    }

    return res.status(200).json(convo);
  } catch (error) {
    return res.status(500).json({ message: "Error creating conversation" });
  }
};

// Create a group conversation
const createGroup = async (req, res) => {
  try {
    const { userId } = req;
    const { name, participantIds } = req.body;
    if (!name || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: "Invalid group payload" });
    }

    const participants = Array.from(new Set([userId, ...participantIds]));
    const convo = await Conversation.create({
      type: "group",
      name,
      participants,
      createdBy: userId,
    });
    return res.status(201).json(convo);
  } catch (error) {
    return res.status(500).json({ message: "Error creating group" });
  }
};

// Broadcast: create a broadcast conversation with all users
const createBroadcast = async (req, res) => {
  try {
    const { userId } = req;
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: "topic is required" });
    }
    const users = await User.find({}).select("_id");
    const allIds = users.map((u) => u._id);
    const convo = await Conversation.create({
      type: "broadcast",
      name: topic.trim(),
      participants: allIds,
      createdBy: userId,
    });
    // seed topic as the first message
    await Message.create({
      conversation: convo._id,
      sender: userId,
      content: `[Broadcast Topic] ${topic.trim()}`,
      readBy: [userId],
    });
    return res.status(201).json(convo);
  } catch (error) {
    return res.status(500).json({ message: "Error creating broadcast" });
  }
};

// Send message to a conversation
const sendMessage = async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      console.error('[SendMessage] NO USER ID in request');
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { conversationId, content, isEphemeral, ttlHours, type, mediaUrl, mediaMime, isViewOnce } = req.body;
    console.log(`[SendMessage] User: ${userId}, Conversation: ${conversationId}`);

    const convo = await Conversation.findById(conversationId).select("participants");
    if (!convo) {
      console.error(`[SendMessage] conversation not found: ${conversationId}`);
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Log participants
    console.log(`[SendMessage] Convo participants: ${convo.participants}`);

    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) {
      console.error(`[SendMessage] Not a participant. User: ${userId}, Participants: ${convo.participants}`);
      return res.status(403).json({ message: "Not a participant" });
    }

    // Enforce block: prevent sending to blocked users
    try {
      const me = await User.findById(userId).select('blockedUsers');
      const otherIds = convo.participants.map((p) => String(p)).filter((p) => p !== String(userId));

      const isBlocked = otherIds.some((oid) => (me?.blockedUsers || []).map(String).includes(String(oid)));
      if (isBlocked) {
        console.error(`[SendMessage] User blocked target. Me: ${userId}, Blocked: ${me.blockedUsers}`);
        return res.status(403).json({ message: 'You have blocked this user' });
      }

      const others = await User.find({ _id: { $in: otherIds } }).select('blockedUsers bannedUntil');
      const theyBlocked = others.some((u) => (u.blockedUsers || []).map(String).includes(String(userId)));
      if (theyBlocked) {
        console.error(`[SendMessage] Target blocked user. Sender: ${userId}`);
        return res.status(403).json({ message: 'You are blocked by this user' });
      }

      const banned = others.some((u) => u.bannedUntil && new Date(u.bannedUntil) > new Date());
      if (banned) return res.status(403).json({ message: 'Recipient unavailable' });
    } catch (err) {
      console.error('[SendMessage] Block check error: ' + err.message);
    }

    if ((!content || !String(content).trim()) && !mediaUrl) {
      return res.status(400).json({ message: "Message content or media is required" });
    }

    const messageDoc = {
      conversation: conversationId,
      sender: userId,
      content: content || "",
      type: type || (mediaUrl ? 'image' : 'text'),
      mediaUrl: mediaUrl || null,
      mediaMime: mediaMime || null,
      readBy: [userId],
      isViewOnce: isViewOnce || false,
    };

    if (isEphemeral) {
      const hoursNum = Number(ttlHours);
      const hours = isNaN(hoursNum) ? 24 : hoursNum;
      messageDoc.isEphemeral = true;
      // If 0 hours selected, delete immediately after viewing (no pre-set expiry)
      if (hours > 0) {
        messageDoc.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      } else {
        messageDoc.expiresAt = null;
      }
    }

    const message = await Message.create(messageDoc);
    // Track latest message on conversation for recent chats and unhide
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      lastMessage: message._id,
      hiddenFor: []
    });

    // Update message streaks if ephemeral and DM
    try {
      if (message.isEphemeral && convo.participants.length === 2) {
        const [a, b] = convo.participants.map((id) => id.toString());
        const otherId = a === userId ? b : a;
        const [senderUser, otherUser] = await Promise.all([
          User.findById(userId).select("messageStreaks"),
          User.findById(otherId).select("messageStreaks"),
        ]);
        const today = new Date();
        const updateStreak = (u, peerId) => {
          const entry = (u.messageStreaks || []).find((e) => e.peer?.toString() === peerId);
          if (!entry) {
            u.messageStreaks.push({ peer: peerId, count: 1, lastInteractionAt: today });
          } else {
            const last = entry.lastInteractionAt ? new Date(entry.lastInteractionAt) : null;
            const sameDay = last && last.toDateString() === today.toDateString();
            if (!sameDay) {
              if (last) {
                const diffDays = Math.floor((today - new Date(last.toDateString())) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) entry.count = (entry.count || 0) + 1; else entry.count = 1;
              } else {
                entry.count = 1;
              }
              entry.lastInteractionAt = today;
            }
          }
        };
        updateStreak(senderUser, otherId);
        updateStreak(otherUser, userId);
        await Promise.all([senderUser.save(), otherUser.save()]);
      }
    } catch { }

    // Broadcast SSE to subscribers of this conversation
    try {
      const clients = req.app.get('sseClients');
      clients.broadcastToConversation(String(conversationId), { type: 'message', message });
    } catch { }

    // Broadcast via Socket.IO
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`conversation:${conversationId}`).emit('message', message);

        // Notify recipients for list updates
        convo.participants.forEach(p => {
          if (String(p) !== String(userId)) {
            io.to(`user:${p}`).emit('message:notify', message);
          }
        });
      }
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    // Send FCM push to other participants
    try {
      const recipientIds = convo.participants.filter((p) => p.toString() !== userId);
      const recipients = await User.find({ _id: { $in: recipientIds } }).select("fcmTokens name");

      const senderUser = await User.findById(userId).select("name");
      const senderName = senderUser ? senderUser.name : "New Message";

      const tokens = recipients.flatMap((u) => u.fcmTokens || []).filter(Boolean).slice(0, 500);

      if (tokens.length > 0) {
        await sendToTokens(
          tokens,
          { title: senderName, body: content || "Sent a media file" },
          { type: "message", conversationId: String(conversationId), clickAction: `/messages/${conversationId}` }
        );
      }

      // Create in-app notification for each recipient (optional, but requested "shows all notifications")
      for (const recipient of recipients) {
        await createUserNotification({
          recipient: recipient._id,
          sender: userId,
          type: "message",
          message: `${senderName} sent you a message`,
          link: `/messages/${conversationId}`
          // relatedModel not strictly required if we assume type='message' handles it, or we omit
        });
      }

    } catch (e) {
      console.error("Error sending message notification:", e);
    }
    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// List a user's conversations
const listMyConversations = async (req, res) => {
  try {
    const { userId } = req;
    const conversations = await Conversation.find({
      participants: userId,
      hiddenFor: { $ne: userId }
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "_id name avatar username email lastLoginAt")
      .populate({ path: 'lastMessage', select: 'content createdAt type isViewOnce isEphemeral' })
      .lean();

    // Calculate unread counts
    // Use proper ObjectId for aggregation to avoid type mismatch issues
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Per-conversation clearedHistory check logic
    const conversationConditions = conversations.map(c => {
      const history = c.clearedHistory || {};
      const clearedAt = history[userId] ? new Date(history[userId]) : new Date(0);
      return {
        conversation: c._id,
        createdAt: { $gt: clearedAt }
      };
    });

    const now = new Date();

    // If there are no conversations, skip aggregation
    let unreadMap = {};
    if (conversationConditions.length > 0) {
      const unreadCounts = await Message.aggregate([
        {
          $match: {
            $and: [
              // Must match one of the active conversations and be newer than cleared history
              { $or: conversationConditions },

              // Message is not from self
              { sender: { $ne: userObjectId } },

              // User has not read it yet
              { readBy: { $ne: userObjectId } },

              // Handle ephemeral messages (exclude if expired)
              {
                $or: [
                  { isEphemeral: { $ne: true } },
                  { isEphemeral: true, expiresAt: { $gt: now } },
                  { isEphemeral: true, expiresAt: null }
                ]
              }
            ]
          }
        },
        {
          $group: {
            _id: "$conversation",
            count: { $sum: 1 }
          }
        }
      ]);

      unreadCounts.forEach(item => {
        unreadMap[item._id.toString()] = item.count;
      });
    }

    const withUnread = conversations.map(c => ({
      ...c,
      unreadCount: unreadMap[c._id.toString()] || 0
    }));

    // Derive online presence using recent lastLoginAt (within 5 minutes)
    const withPresence = withUnread.map((c) => ({
      ...c,
      participants: (c.participants || []).map((p) => {
        const last = p.lastLoginAt ? new Date(p.lastLoginAt).getTime() : 0;
        const isOnline = last && (now - last) <= 5 * 60 * 1000;
        return { ...p, isOnline };
      })
    }));

    return res.status(200).json(withPresence);
  } catch (error) {
    console.error('List conversations error:', error);
    return res.status(500).json({ message: "Error retrieving conversations" });
  }
};

// Get messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { userId } = req;
    const { conversationId } = req.params;
    const convo = await Conversation.findById(conversationId).select("participants clearedHistory");
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    // Exclude already-viewed ephemeral messages for this user
    // AND exclude messages before the clearedHistory timestamp
    const now = new Date();

    // Check if user cleared chat
    let clearedAt = null;
    if (convo.clearedHistory && convo.clearedHistory.get(userId)) {
      clearedAt = convo.clearedHistory.get(userId);
    }

    const query = {
      conversation: conversationId,
      $or: [
        { isEphemeral: { $ne: true } },
        { isEphemeral: true, seenAt: null, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      ],
    };

    if (clearedAt) {
      query.createdAt = { $gt: clearedAt };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "_id name avatar")
      .lean();
    return res.status(200).json(messages.reverse());
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving messages" });
  }
};

// Get message streak with a peer
const getMessageStreakWithPeer = async (req, res) => {
  try {
    const { userId } = req;
    const { peerUserId } = req.params;
    const user = await User.findById(userId).select("messageStreaks").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    const entry = (user.messageStreaks || []).find((e) => String(e.peer) === String(peerUserId));
    return res.status(200).json({ count: entry?.count || 0, lastInteractionAt: entry?.lastInteractionAt || null });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving streak" });
  }
};
// Mark a message as viewed (for ephemeral behavior and seen status)
const viewMessage = async (req, res) => {
  try {
    const { userId } = req;
    const { messageId } = req.params;
    const message = await Message.findById(messageId).populate("conversation", "participants");
    if (!message) return res.status(404).json({ message: "Message not found" });
    const convo = message.conversation;
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    // Add to readBy
    if (!message.readBy.some((p) => p.toString() === userId)) {
      message.readBy.push(userId);
    }

    // If ephemeral, delete immediately after viewing
    if (message.isEphemeral) {
      await Message.deleteOne({ _id: message._id });
      return res.status(200).json({ message: "Message deleted after viewing", seen: true, ephemeral: true });
    }

    // If view once, mark as opened
    if (message.isViewOnce && !message.isOpened) {
      message.isOpened = true;
    }

    message.seenAt = new Date();
    await message.save();

    // Broadcast read receipt via Socket.IO
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`conversation:${convo._id}`).emit('message:read', {
          messageId: message._id.toString(),
          userId,
          readBy: message.readBy.map(id => id.toString()),
          isOpened: message.isOpened
        });
      }
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    return res.status(200).json({ message: "Seen", seenAt: message.seenAt, isOpened: message.isOpened });
  } catch (error) {
    return res.status(500).json({ message: "Error updating message view" });
  }
};

// Mark all messages in a conversation as read
const markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req;
    const { conversationId } = req.params;

    const convo = await Conversation.findById(conversationId).select("participants");
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    // Find unread messages not from self
    const unreadOps = await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId },
        $set: { seenAt: new Date() } // Update seenAt roughly
      }
    );

    // If any messages were updated, emit an event
    if (unreadOps.nModified > 0 || unreadOps.modifiedCount > 0) {
      // We might want to emit a bulk read event or just let clients refresh
      try {
        const io = req.app.get('io');
        if (io) {
          io.to(`conversation:${conversationId}`).emit('conversation:read', {
            conversationId,
            userId,
            readAt: new Date()
          });
        }
      } catch (e) { }
    }

    return res.status(200).json({ success: true, count: unreadOps.modifiedCount });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return res.status(500).json({ message: "Error marking conversation as read" });
  }
};

// Cleanup expired ephemeral messages (can be hooked to a cron)
const deleteExpiredEphemeral = async (req, res) => {
  try {
    const now = new Date();
    const result = await Message.deleteMany({ isEphemeral: true, expiresAt: { $lte: now } });
    return res.status(200).json({ deletedCount: result.deletedCount });
  } catch (error) {
    return res.status(500).json({ message: "Error cleaning up messages" });
  }
};

// Add a reaction to a message
const addReaction = async (req, res) => {
  try {
    const { userId } = req;
    const { messageId } = req.params;
    const { reaction } = req.body || {};
    if (!reaction || String(reaction).length > 8) {
      return res.status(400).json({ message: "Invalid reaction" });
    }
    const message = await Message.findById(messageId).populate("conversation", "participants");
    if (!message) return res.status(404).json({ message: "Message not found" });
    const convo = message.conversation;
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    // Prevent duplicate identical reaction from same user
    const exists = (message.reactions || []).some((r) => r.user?.toString() === userId && r.reaction === reaction);
    if (!exists) {
      message.reactions = message.reactions || [];
      message.reactions.push({ user: userId, reaction: String(reaction) });
      await message.save();
    }
    return res.status(200).json({ message: "Reaction added", reactions: message.reactions });
  } catch (error) {
    return res.status(500).json({ message: "Error adding reaction" });
  }
};

// Pin a message
const pinMessage = async (req, res) => {
  try {
    const { userId } = req;
    const { messageId } = req.params;
    const message = await Message.findById(messageId).populate("conversation", "participants");
    if (!message) return res.status(404).json({ message: "Message not found" });
    const convo = message.conversation;
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });
    if (!message.isPinned) {
      message.isPinned = true;
      await message.save();
    }
    return res.status(200).json({ message: "Pinned" });
  } catch (error) {
    return res.status(500).json({ message: "Error pinning message" });
  }
};

// Unpin a message
const unpinMessage = async (req, res) => {
  try {
    const { userId } = req;
    const { messageId } = req.params;
    const message = await Message.findById(messageId).populate("conversation", "participants");
    if (!message) return res.status(404).json({ message: "Message not found" });
    const convo = message.conversation;
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });
    if (message.isPinned) {
      message.isPinned = false;
      await message.save();
    }
    return res.status(200).json({ message: "Unpinned" });
  } catch (error) {
    return res.status(500).json({ message: "Error unpinning message" });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { userId } = req;
    const { messageId } = req.params;
    const message = await Message.findById(messageId).populate("conversation", "participants");
    if (!message) return res.status(404).json({ message: "Message not found" });

    const convo = message.conversation;
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    // Only allow users to delete their own messages
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.deleteOne({ _id: messageId });

    // Broadcast deletion via Socket.IO
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`conversation:${convo._id}`).emit('message:deleted', { messageId });
      }
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ message: "Error deleting message" });
  }
};

// Get pinned messages for a conversation
const getPinnedMessages = async (req, res) => {
  try {
    const { userId } = req;
    const { conversationId } = req.params;
    const convo = await Conversation.findById(conversationId).select("participants");
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    const isParticipant = convo.participants.some((p) => p.toString() === userId);
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });
    const pinned = await Message.find({ conversation: conversationId, isPinned: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.status(200).json(pinned);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching pinned messages" });
  }
};

// "Delete" a conversation (hide it from recent list)
const deleteConversation = async (req, res) => {
  try {
    const { userId } = req;
    const { conversationId } = req.params;
    await Conversation.findByIdAndUpdate(conversationId, { $addToSet: { hiddenFor: userId } });
    return res.status(200).json({ message: "Conversation hidden" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting conversation" });
  }
};

// Clear chat history for the user
const clearChat = async (req, res) => {
  try {
    const { userId } = req;
    const { conversationId } = req.params;

    // Set the cleared timestamp for this user in the conversation
    const update = {};
    update[`clearedHistory.${userId}`] = new Date();

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: update,
      // Also unhide if it was hidden, though clearing usually implies you are in it
    });

    return res.status(200).json({ message: "Chat cleared" });
  } catch (error) {
    console.error("Clear chat error:", error);
    return res.status(500).json({ message: "Error clearing chat" });
  }
};

module.exports = {
  getOrCreateDM,
  createGroup,
  createBroadcast,
  sendMessage,
  listMyConversations,
  deleteConversation,
  getMessages,
  viewMessage,
  deleteExpiredEphemeral,
  getMessageStreakWithPeer,
  addReaction,
  pinMessage,
  unpinMessage,
  deleteMessage,
  getPinnedMessages,
  markConversationAsRead,
  clearChat,
};

