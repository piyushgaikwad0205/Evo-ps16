const IntroThread = require("../models/introThread.model");
const { getOpenAIReply } = require("../utils/openai.util");

const chatPublic = async (req, res) => {
  const { threadId, message } = req.body || {};
  if (!threadId || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let thread = await IntroThread.findOne({ threadId });
    if (!thread) {
      thread = new IntroThread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const reply = await getOpenAIReply(message);
    thread.messages.push({ role: "assistant", content: reply });
    thread.updatedAt = new Date();
    await thread.save();

    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { chatPublic };

