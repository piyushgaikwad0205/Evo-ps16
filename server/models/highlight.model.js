const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const highlightSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    stories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
    coverStory: { type: Schema.Types.ObjectId, ref: "Story", default: null },
  },
  { timestamps: true }
);

highlightSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Highlight", highlightSchema);

