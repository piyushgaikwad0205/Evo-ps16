const User = require("../models/user.model");
const Log = require("../models/log.model");

const ensureNotSelf = (req, res, next) => {
  if (String(req.params.userId) === String(req.userId)) {
    return res.status(400).json({ message: "Cannot perform this action on yourself" });
  }
  next();
};

const blockUser = [ensureNotSelf, async (req, res) => {
  try {
    await User.updateOne({ _id: req.userId }, { $addToSet: { blockedUsers: req.params.userId } });
    res.status(200).json({ message: "User blocked" });
  } catch {
    res.status(500).json({ message: "Error blocking user" });
  }
}];

const unblockUser = [ensureNotSelf, async (req, res) => {
  try {
    await User.updateOne({ _id: req.userId }, { $pull: { blockedUsers: req.params.userId } });
    res.status(200).json({ message: "User unblocked" });
  } catch {
    res.status(500).json({ message: "Error unblocking user" });
  }
}];

const reportUser = async (req, res) => {
  try {
    const { reason = "", details = "" } = req.body || {};
    await Log.create({ level: "warn", type: "user_report", message: `Report on user ${req.params.userId} by ${req.userId}: ${reason} ${details}` });
    res.status(201).json({ message: "Report submitted" });
  } catch {
    res.status(500).json({ message: "Error reporting user" });
  }
};

const adminBanUser = async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { id } = req.params;
    const { days = 1 } = req.body || {};
    const until = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
    await User.updateOne({ _id: id }, { $set: { bannedUntil: until } });
    res.status(200).json({ message: `User banned until ${until.toISOString()}`, bannedUntil: until });
  } catch {
    res.status(500).json({ message: "Error banning user" });
  }
};

module.exports = { blockUser, unblockUser, reportUser, adminBanUser };

