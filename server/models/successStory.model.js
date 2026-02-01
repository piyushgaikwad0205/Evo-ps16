const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const successStorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "career_achievement",
        "entrepreneurship",
        "social_impact",
        "academic_excellence",
        "innovation",
        "leadership",
        "other"
      ],
      default: "career_achievement",
    },

    media: [
      {
        type: String, // URLs for images/documents
        default: [],
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    tags: {
      type: [String],
      default: [],
    },

    companyName: {
      type: String,
      default: "",
    },

    achievementYear: {
      type: Number,
      default: null,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

successStorySchema.index({ title: "text", description: "text" });
successStorySchema.index({ author: 1, createdAt: -1 });
successStorySchema.index({ featured: 1, status: 1 });

module.exports = mongoose.model("SuccessStory", successStorySchema);