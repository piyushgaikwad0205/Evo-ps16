const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        headOfDepartment: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        building: {
            type: String,
            trim: true,
            default: "",
        },
        floor: {
            type: String,
            trim: true,
            default: "",
        },
        totalStudents: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalFaculty: {
            type: Number,
            default: 0,
            min: 0,
        },
        establishedYear: {
            type: Number,
            min: 1900,
            max: new Date().getFullYear(),
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        programs: [
            {
                type: String,
                trim: true,
            },
        ],
        website: {
            type: String,
            trim: true,
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
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model("Department", departmentSchema);
