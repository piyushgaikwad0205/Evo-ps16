/**
 * Project Name: Campus Connects
 * Description: A social networking platform with automated content moderation and context-based authentication system.
 *
 * Author: Neaz Mahmud
 * Email: neaz6160@gmail.com
 * Date: 19th June 2023
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const adminRoutes = require("./routes/admin.route");
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const communityRoutes = require("./routes/community.route");
const aiRoutes = require("./routes/ai.route");
const adminAIRoutes = require("./routes/admin.ai.route");
const contextAuthRoutes = require("./routes/context-auth.route");
const alumniRoutes = require("./routes/alumni.route");
const successStoryRoutes = require("./routes/successStory.route");
const storyRoutes = require("./routes/story.route");
const surveyRoutes = require("./routes/survey.route");
const connectionRoutes = require("./routes/connection.route");

const collegeRoutes = require("./routes/college.route");
const clubRoutes = require("./routes/club.route");
const messageRoutes = require("./routes/message.route");
const introRoutes = require("./routes/intro.route");
const collabRoutes = require("./routes/collab.route");
const eventRoutes = require("./routes/event.route");
const facultyRoutes = require("./routes/faculty.route");
const notificationRoutes = require("./routes/notification.route");
const search = require("./controllers/search.controller");
const Database = require("./config/database");
const decodeToken = require("./middlewares/auth/decodeToken");

const app = express();
const server = http.createServer(app);
let io = null;

const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const helmet = require("helmet");
const compression = require("compression");
const useragent = require("express-useragent");
const requestIp = require("request-ip");

const PORT = process.env.PORT || 4000;

const db = new Database(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression());

db.connect()
  .then(() => {
    // Initialize story cleanup cron job after DB connection
    const { setupStoryCronJobs } = require('./cron/storyCron');
    setupStoryCronJobs();

    // Initialize keep-alive cron job to prevent server sleep
    const { setupKeepAliveCron } = require('./cron/keepAliveCron');
    setupKeepAliveCron();

    // Initialize Firebase Admin SDK for phone authentication
    try {
      const { initializeFirebase } = require('./config/firebase.config');
      initializeFirebase();
      console.log('✅ Firebase Admin SDK initialized');
    } catch (error) {
      console.warn('⚠️  Firebase Admin SDK initialization skipped:', error.message);
    }
  })
  .catch((err) => console.error("Error connecting to database:", err));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://campus-connects-final.vercel.app',
  'https://campus-connects-final.vercel.app/',
  'https://campus-connects-final-1.onrender.com',
  'https://*.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Allow any localhost origin for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    const ok = allowedOrigins.some((o) => {
      if (o.includes('*')) {
        const re = new RegExp('^' + o.replace('*', '.*') + '$');
        return re.test(origin);
      }
      return o === origin || o.replace(/\/$/, '') === origin.replace(/\/$/, '');
    });
    if (ok) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(morgan("dev"));
app.use(useragent.express());
app.use(requestIp.mw());

// Serve static files for uploaded images
app.use("/assets/userFiles", express.static(__dirname + "/assets/userFiles"));
app.use(
  "/assets/userAvatars",
  express.static(__dirname + "/assets/userAvatars")
);
app.use(
  "/assets/clubBanners",
  express.static(__dirname + "/assets/clubBanners")
);
app.use(
  "/assets/eventFiles",
  express.static(__dirname + "/assets/eventFiles")
);

// Log static file serving setup
console.log('Static file serving configured:');
console.log('- User files:', __dirname + "/assets/userFiles");
console.log('- User avatars:', __dirname + "/assets/userAvatars");
console.log('- Club banners:', __dirname + "/assets/clubBanners");
console.log('- Event files:', __dirname + "/assets/eventFiles");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
require("./config/passport.js");

// Simple in-memory SSE client registry keyed by userId and role for push notifications
const sseClients = {
  byUser: new Map(), // userId -> Set(res)
  byRole: new Map(), // role -> Set(res)
  byConversation: new Map(), // conversationId -> Set(res)
  add(userId, role, res) {
    if (userId) {
      if (!this.byUser.has(userId)) this.byUser.set(userId, new Set());
      this.byUser.get(userId).add(res);
    }
    if (role) {
      if (!this.byRole.has(role)) this.byRole.set(role, new Set());
      this.byRole.get(role).add(res);
    }
  },
  addConversation(conversationId, res) {
    if (!this.byConversation.has(conversationId)) this.byConversation.set(conversationId, new Set());
    this.byConversation.get(conversationId).add(res);
  },
  remove(res) {
    for (const set of this.byUser.values()) set.delete(res);
    for (const set of this.byRole.values()) set.delete(res);
    for (const set of this.byConversation.values()) set.delete(res);
  },
  broadcastToRole(role, payload) {
    const set = this.byRole.get(role);
    if (!set) return;
    for (const res of set) {
      try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch { }
    }
  },
  broadcastToConversation(conversationId, payload) {
    const set = this.byConversation.get(String(conversationId));
    if (!set) return;
    for (const res of set) {
      try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch { }
    }
  },
  broadcastAll(payload) {
    const sent = new Set();
    for (const set of this.byRole.values()) {
      for (const res of set) {
        if (sent.has(res)) continue;
        try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch { }
        sent.add(res);
      }
    }
    for (const set of this.byUser.values()) {
      for (const res of set) {
        if (sent.has(res)) continue;
        try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch { }
        sent.add(res);
      }
    }
  }
};
// Helper broadcasts
sseClients.broadcastToUser = function (userId, payload) {
  const set = this.byUser.get(String(userId));
  if (!set) return;
  for (const res of set) {
    try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch { }
  }
};
sseClients.broadcastToUsers = function (userIds, payload) {
  (userIds || []).forEach((id) => this.broadcastToUser(String(id), payload));
};
app.set('sseClients', sseClients);

app.get("/server-status", (req, res) => {
  res.status(200).json({ message: "Server is up and running!" });
});

// Health check endpoint for monitoring and keep-alive
app.get("/health", async (req, res) => {
  try {
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      database: {
        connected: db.isConnected(),
        status: db.isConnected() ? 'connected' : 'disconnected'
      }
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// SSE endpoint for real-time user notifications
app.get('/users/me/notifications/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  // Accept JWT via query (?token=) or Authorization header for EventSource
  let userId = null;
  try {
    const jwt = require('jsonwebtoken');
    const token = req.query.token || (req.headers.authorization?.split(' ')[1] || null);
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET || 'dev_secret_change_me');
      userId = decoded?.id || null;
    }
  } catch { }
  if (!userId) { try { res.write(`data: ${JSON.stringify({ type: 'error', message: 'unauthorized' })}\n\n`); } catch { } }
  // Determine role for this connection
  let role = null;
  try {
    const User = require('./models/user.model');
    const u = await User.findById(userId).select('role').lean();
    role = u?.role || null;
  } catch { }

  const clients = req.app.get('sseClients');
  clients.add(String(userId), role, res);
  // Initial hello
  res.write(`data: ${JSON.stringify({ type: 'sse_ready', ts: Date.now() })}\n\n`);
  // Heartbeat
  const hb = setInterval(() => {
    try { res.write(':\n\n'); } catch { }
  }, 25000);

  req.on('close', () => {
    clearInterval(hb);
    clients.remove(res);
    try { res.end(); } catch { }
  });
});

app.get("/search", decodeToken, search);

app.use("/auth", contextAuthRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/communities", communityRoutes);
app.use("/admin", adminRoutes);
app.use("/alumni", alumniRoutes);
app.use("/success-stories", successStoryRoutes);
app.use("/stories", storyRoutes);
app.use("/surveys", surveyRoutes);
app.use("/connections", connectionRoutes);
app.use("/connections", connectionRoutes);
app.use("/colleges", collegeRoutes);
app.use("/clubs", clubRoutes);
app.use("/messages", messageRoutes);
app.use("/intro", introRoutes);
app.use("/collabs", collabRoutes);
app.use("/events", eventRoutes);
app.use("/ai", aiRoutes);
app.use("/admin/ai", adminAIRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/notifications", notificationRoutes);
app.use("/follows", require("./routes/follow.route"));

process.on("SIGINT", async () => {
  try {
    await db.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

// Initialize Socket.IO for typing and presence
try {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
    path: "/socket.io",
  });
  app.set('io', io);

  // Basic JWT auth off handshake headers
  const jwt = require("jsonwebtoken");
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('unauthorized'));
      const decoded = jwt.verify(token, process.env.SECRET || 'dev_secret_change_me');
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  // Rooms: conversation:<id>
  // Rooms: conversation:<id>
  io.on('connection', (socket) => {
    const userId = socket.userId;
    if (userId) socket.join(`user:${userId}`);

    // Notify others that user is online
    socket.broadcast.emit('user:online', { userId });

    // Handle request for online users list
    socket.on('request:online-users', () => {
      // Get all connected user IDs
      const onlineUserIds = Array.from(io.sockets.sockets.values())
        .map(s => s.userId)
        .filter(id => !!id);
      const uniqueIds = [...new Set(onlineUserIds)];
      socket.emit('online:users', { userIds: uniqueIds });
    });

    socket.on('conversation:join', ({ conversationId }) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });
    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    // Typing events
    socket.on('typing:start', ({ conversationId }) => {
      if (conversationId) socket.to(`conversation:${conversationId}`).emit('typing:update', { conversationId, userId: socket.userId, typing: true });
    });
    socket.on('typing:stop', ({ conversationId }) => {
      if (conversationId) socket.to(`conversation:${conversationId}`).emit('typing:update', { conversationId, userId: socket.userId, typing: false });
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('user:offline', { userId });
    });
  });
} catch (e) {
  console.warn('Socket.IO init failed:', e?.message);
}

server.listen(PORT, () => console.log(`Server up and running on port ${PORT}!`));
