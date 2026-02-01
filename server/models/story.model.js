const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storyViewerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const storySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["image", "video", "text"], required: true },
    text: { type: String, default: "" },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    background: { type: String, default: "#000000" },
    expiresAt: { type: Date, required: true },
    viewers: [storyViewerSchema],
    privacy: {
      type: String,
      enum: ["public", "followers", "close_friends", "club_members"],
      default: "public",
    },
    allowedViewers: [{ type: Schema.Types.ObjectId, ref: "User" }], // For specific hide/show logic
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    poll: {
      question: { type: String },
      options: [{ text: String, votes: [{ type: Schema.Types.ObjectId, ref: "User" }] }],
    },
    link: { type: String, default: null },
    tags: [{ type: String }], // e.g., ["#event", "#club"]
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    location: { type: String, default: null },
  },
  { timestamps: true }
);

storySchema.index({ user: 1, expiresAt: -1 });

module.exports = mongoose.model("Story", storySchema);

