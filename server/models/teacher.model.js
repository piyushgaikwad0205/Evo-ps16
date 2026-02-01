const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
    {
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
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        password: {
            type: String,
            required: false, // Optional - admin can add later
            select: false,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        qualification: {
            type: String,
            trim: true,
            default: "",
        },
        specialization: {
            type: String,
            trim: true,
            default: "",
        },
        subjects: [
            {
                type: String,
                trim: true,
            },
        ],
        experience: {
            type: Number,
            default: 0,
            min: 0,
        },
        joiningDate: {
            type: Date,
            default: Date.now,
        },
        designation: {
            type: String,
            enum: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", ""],
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other", ""],
            default: "",
        },
        salary: {
            type: Number,
            default: 0,
            min: 0,
        },
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "College",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster searches
teacherSchema.index({ email: 1 });
teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ department: 1 });

module.exports = mongoose.model("Teacher", teacherSchema);
