const User = require("../models/user.model");

const registerFcmToken = async (req, res) => {
  try {
    const userId = req.userId;
    const { token } = req.body || {};
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "token is required" });
    }
    const user = await User.findById(userId).select("fcmTokens");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      // Cap tokens to last 10 to avoid unbounded growth
      if (user.fcmTokens.length > 10) user.fcmTokens = user.fcmTokens.slice(-10);
      await user.save();
    }
    return res.status(200).json({ message: "Registered" });
  } catch (err) {
    return res.status(500).json({ message: "Error registering token" });
  }
};

module.exports = { registerFcmToken };

