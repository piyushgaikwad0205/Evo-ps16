const router = require("express").Router();
const express = require("express");
const passport = require("passport");
const decodeToken = require("../middlewares/auth/decodeToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getOrCreateDM,
  createGroup,
  createBroadcast,
  sendMessage,
  listMyConversations,
  getMessages,
  viewMessage,
  deleteExpiredEphemeral,
  getMessageStreakWithPeer,
  addReaction,
  pinMessage,
  unpinMessage,
  deleteMessage,
  deleteConversation,
  getPinnedMessages,
  markConversationAsRead,
  clearChat,
} = require("../controllers/message.controller");

router.use(passport.authenticate("jwt", { session: false }, null), decodeToken);

// Conversations
router.get("/conversations", listMyConversations);
router.delete("/conversations/:conversationId", deleteConversation);
router.post("/conversations/:conversationId/clear", clearChat);
router.post("/dm", getOrCreateDM);
router.post("/group", createGroup);
router.post("/broadcast", createBroadcast);

// Messages
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/messages", express.json(), sendMessage);
router.post("/conversations/:conversationId/messages", (req, res, next) => {
  // forward to sendMessage expecting conversationId in body as well
  req.body = req.body || {};
  req.body.conversationId = req.params.conversationId;
  next();
}, sendMessage);

// Attachment upload (images/videos)
const mediaFolder = path.join(__dirname, "../assets/userFiles/messages");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder, { recursive: true });
    cb(null, mediaFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) return cb(null, true);
    const ok = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"].includes(file.mimetype);
    cb(null, ok);
  }
});

router.post("/conversations/:conversationId/attachments", upload.single('file'), (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  console.log('File uploaded:', {
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  const url = `${req.protocol}://${req.get("host")}/assets/userFiles/messages/${req.file.filename}`;
  let type = 'file';
  if (req.file.mimetype.startsWith('image')) type = 'image';
  else if (req.file.mimetype.startsWith('video')) type = 'video';
  else if (req.file.mimetype.startsWith('audio')) type = 'audio';

  req.body = {
    conversationId: req.params.conversationId,
    type,
    mediaUrl: url,
    mediaMime: req.file.mimetype,
    content: ''
  };

  console.log('Request body set to:', req.body);
  next();
}, sendMessage);

// SSE: stream new messages for a conversation
router.get('/conversations/:conversationId/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const clients = req.app.get('sseClients');
  clients.addConversation(String(req.params.conversationId), res);
  res.write(`data: ${JSON.stringify({ type: 'sse_ready', ts: Date.now() })}\n\n`);
  const hb = setInterval(() => { try { res.write(':\n\n'); } catch { } }, 25000);
  req.on('close', () => { clearInterval(hb); clients.remove(res); try { res.end(); } catch { } });
});
router.post("/messages/:messageId/view", viewMessage);
router.post("/conversations/:conversationId/read", markConversationAsRead);

// Delete a message
router.delete("/messages/:messageId", deleteMessage);

// Message reactions
router.post("/messages/:messageId/reactions", express.json(), addReaction);

// Pin / Unpin messages
router.post("/messages/:messageId/pin", pinMessage);
router.delete("/messages/:messageId/pin", unpinMessage);

// Pinned messages list per conversation
router.get("/conversations/:conversationId/pinned", getPinnedMessages);

// Maintenance: cleanup expired ephemeral messages (admin or cron can hit this)
router.delete("/messages/ephemeral/cleanup", deleteExpiredEphemeral);

// Streaks
router.get("/streak/:peerUserId", getMessageStreakWithPeer);

module.exports = router;

