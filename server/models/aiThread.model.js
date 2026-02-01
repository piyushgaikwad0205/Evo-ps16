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

const AIThreadSchema = new Schema(
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
    owner: {
      type: Schema.Types.ObjectId,
      refPath: "ownerModel",
      required: true,
    },
    ownerModel: {
      type: String,
      enum: ["User", "Admin"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AIThread", AIThreadSchema);

