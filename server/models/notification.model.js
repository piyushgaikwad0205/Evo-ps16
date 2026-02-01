const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    targetAudience: {
      type: String,
      enum: ["all", "alumni", "general", "moderator", "college", "admins", "college_admins"],
      default: "all",
    },
    targetCollege: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);