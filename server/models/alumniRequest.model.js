const mongoose = require("mongoose");

const alumniRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    graduationYear: { type: Number, default: null },
    department: { type: String, default: "" },
    currentEmployer: { type: String, default: "" },
    position: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    skills: { type: [String], default: [] },
    industry: { type: String, default: "" },
    experience: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    interests: { type: String, default: "" },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlumniRequest", alumniRequestSchema);