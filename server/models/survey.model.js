const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
  },

  type: {
    type: String,
    enum: ["text", "multiple_choice", "rating", "yes_no", "long_text"],
    required: true,
  },

  options: {
    type: [String], // For multiple choice questions
    default: [],
  },

  required: {
    type: Boolean,
    default: true,
  },

  order: {
    type: Number,
    required: true,
  },
});

const responseSchema = new Schema({
  respondent: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      const doc = this && typeof this.ownerDocument === "function" ? this.ownerDocument() : null;
      return doc ? !doc.isAnonymous : true;
    },
  },

  answers: [
    {
      questionId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      answer: {
        type: Schema.Types.Mixed, // Can be String, Number, or Array
        required: true,
      },
    },
  ],

  submittedAt: {
    type: Date,
    default: Date.now,
  },

  ipAddress: {
    type: String,
    default: "",
  },
});

const surveySchema = new Schema(
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
      maxlength: 1000,
    },

    questions: [questionSchema],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    targetAudience: {
      type: String,
      enum: ["all", "alumni", "students", "faculty", "specific_year", "specific_department"],
      default: "alumni",
    },

    targetCriteria: {
      graduationYears: [Number],
      departments: [String],
      roles: [String],
    },

    status: {
      type: String,
      enum: ["draft", "active", "paused", "closed"],
      default: "draft",
    },

    responses: [responseSchema],

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    maxResponses: {
      type: Number,
      default: null, // null means unlimited
    },

    allowMultipleResponses: {
      type: Boolean,
      default: false,
    },

    sendEmailNotification: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
surveySchema.index({ createdBy: 1, status: 1 });
surveySchema.index({ status: 1, endDate: 1 });
surveySchema.index({ targetAudience: 1 });
surveySchema.index({ "responses.respondent": 1 });

// Virtual for response count
surveySchema.virtual("responseCount").get(function () {
  return this.responses.length;
});

// Method to check if user can respond
surveySchema.methods.canUserRespond = function (userId) {
  if (this.status !== "active") return false;
  if (this.endDate < new Date()) return false;
  if (this.maxResponses && this.responses && this.responses.length >= this.maxResponses) return false;

  if (!this.allowMultipleResponses && this.responses && userId) {
    const hasResponded = this.responses.some(
      response => response.respondent && response.respondent.toString() === userId.toString()
    );
    if (hasResponded) return false;
  }

  return true;
};

module.exports = mongoose.model("Survey", surveySchema);