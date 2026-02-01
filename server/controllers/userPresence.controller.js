const User = require("../models/user.model");

// POST /users/me/presence/heartbeat
const heartbeat = async (req, res) => {
  try {
    const { userId } = req;
    await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
    // Broadcast to SSE role/user streams if needed
    try {
      const clients = req.app.get('sseClients');
      clients?.broadcastAll?.({ type: 'presence_heartbeat', userId });
    } catch {}
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Error updating presence' });
  }
};

// GET /users/me/presence/stream
const presenceStream = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clients = req.app.get('sseClients');
    // Reuse role-based broadcast mapping if available
    const { userRole } = req;
    clients.add(null, userRole, res);
    res.write(`data: ${JSON.stringify({ type: 'sse_ready', ts: Date.now() })}\n\n`);
    const hb = setInterval(() => { try { res.write(':\n\n'); } catch {} }, 25000);
    req.on('close', () => { clearInterval(hb); clients.remove(res); try { res.end(); } catch {} });
  } catch {
    try { res.status(500).end(); } catch {}
  }
};

module.exports = { heartbeat, presenceStream };

