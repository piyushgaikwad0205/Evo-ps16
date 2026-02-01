const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectionSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
      default: "",
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique connections between users
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Indexes for better performance
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

module.exports = mongoose.model("Connection", connectionSchema); 