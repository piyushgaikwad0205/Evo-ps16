const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_\.]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
      sparse: true,
      match: /^[0-9]{10}$/,
    },
    btid: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    // Academic Details for Student Categorization
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    department: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 5,
    },
    academicClass: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 10,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
    },
    enrollmentNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    branchSpecification: {
      type: String,
      trim: true,
    },
    admissionType: {
      type: String,
      enum: ['Regular', 'Lateral Entry', 'Diploma to Degree', 'Other'],
      default: 'Regular',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    password: {
      type: String,
      required: true,
    },
    // 2FA/OTP fields
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorMethod: {
      type: String,
      enum: ['email', 'sms', 'phone', 'both'],
      default: 'email',
    },
    otpCode: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    otpMethod: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email',
    },
    // Firebase Phone Authentication fields
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: /^\+[1-9]\d{1,14}$/, // E.164 format
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    interests: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["general", "moderator", "admin", "alumni"],
      default: "general",
    },

    // Alumni-specific fields
    graduationYear: {
      type: Number,
      default: null,
    },

    department: {
      type: String,
      default: "",
    },

    currentEmployer: {
      type: String,
      default: "",
    },

    position: {
      type: String,
      default: "",
    },

    linkedinUrl: {
      type: String,
      default: "",
    },

    githubUrl: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    industry: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    alumniVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    isAlumniProfilePublic: {
      type: Boolean,
      default: true,
    },

    uploadPermission: {
      type: Boolean,
      default: false,
    },

    // User Status Management (for Super Admin)
    isSuspended: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    suspensionExpiresAt: {
      type: Date,
      default: null,
    },

    savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Moderation fields
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bannedUntil: { type: Date, default: null },

    // Academic fields
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      default: null,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ name: "text" });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
/**
 * Additional indexes can be added here as we introduce new fields.
 */

// Extend the schema with push notifications and streak tracking
if (!userSchema.path("fcmTokens")) {
  userSchema.add({
    fcmTokens: {
      type: [String],
      default: [],
    },
  });
}

if (!userSchema.path("loginStreakCount")) {
  userSchema.add({
    loginStreakCount: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  });
}

if (!userSchema.path("messageStreaks")) {
  userSchema.add({
    // Array of per-peer streaks for disappearing message exchanges
    messageStreaks: [
      {
        peer: { type: Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
        lastInteractionAt: { type: Date },
      },
    ],
  });
}

module.exports = mongoose.model("User", userSchema);
