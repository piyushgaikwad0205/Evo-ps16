const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
      index: true,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaMime: {
      type: String,
      default: null,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Disappearing message support
    isEphemeral: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    seenAt: {
      type: Date,
      default: null,
    },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        reaction: { type: String, maxlength: 8 },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    // View Once support
    isViewOnce: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);

