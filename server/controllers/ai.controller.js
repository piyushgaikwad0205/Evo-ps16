const AIThread = require("../models/aiThread.model");
const { getOpenAIReply } = require("../utils/openai.util");

const getOwnerFilter = (req) => ({ owner: req.ownerId, ownerModel: req.ownerModel });

const listThreads = async (req, res) => {
  try {
    const threads = await AIThread.find(getOwnerFilter(req))
      .sort({ updatedAt: -1 })
      .select({ threadId: 1, title: 1, updatedAt: 1, _id: 0 });
    return res.json(threads);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch threads" });
  }
};

const getThreadMessages = async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await AIThread.findOne({ ...getOwnerFilter(req), threadId });
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }
    return res.json(thread.messages || []);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch chat" });
  }
};

const deleteThread = async (req, res) => {
  const { threadId } = req.params;
  try {
    const deleted = await AIThread.findOneAndDelete({ ...getOwnerFilter(req), threadId });
    if (!deleted) {
      return res.status(404).json({ message: "Thread not found" });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete thread" });
  }
};

const chatCompletion = async (req, res) => {
  const { threadId, message } = req.body || {};
  if (!threadId || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let thread = await AIThread.findOne({ ...getOwnerFilter(req), threadId });
    if (!thread) {
      thread = new AIThread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
        owner: req.ownerId,
        ownerModel: req.ownerModel,
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getOpenAIReply(message);

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();

    return res.json({ reply: assistantReply });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { listThreads, getThreadMessages, deleteThread, chatCompletion };

