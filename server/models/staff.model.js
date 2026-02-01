const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
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
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        role: {
            type: String,
            enum: [
                "Administrative",
                "Technical",
                "Support",
                "Maintenance",
                "Security",
                "Library",
                "Lab Assistant",
                "Other",
                "",
            ],
            default: "",
        },
        department: {
            type: String,
            trim: true,
            default: "",
        },
        joiningDate: {
            type: Date,
            default: Date.now,
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
        shift: {
            type: String,
            enum: ["Morning", "Evening", "Night", "Rotational", ""],
            default: "",
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
staffSchema.index({ email: 1 });
staffSchema.index({ employeeId: 1 });
staffSchema.index({ role: 1 });

module.exports = mongoose.model("Staff", staffSchema);
