const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["dm", "group", "broadcast"],
      default: "dm",
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    hiddenFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    clearedHistory: {
      type: Map,
      of: Date,
      default: {}
    }
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);

