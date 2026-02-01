const mongoose = require("mongoose");

const hodSchema = new mongoose.Schema(
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
        experience: {
            type: Number,
            default: 0,
            min: 0,
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
hodSchema.index({ email: 1 });
hodSchema.index({ employeeId: 1 });
hodSchema.index({ department: 1 });

module.exports = mongoose.model("HOD", hodSchema);
