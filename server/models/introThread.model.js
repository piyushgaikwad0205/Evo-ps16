const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const IntroThreadSchema = new Schema(
  {
    threadId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("IntroThread", IntroThreadSchema);

