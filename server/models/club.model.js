const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    banner: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    head: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    coHead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

clubSchema.index({ name: "text" });

module.exports = mongoose.model("Club", clubSchema);

