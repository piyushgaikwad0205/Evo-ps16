const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },
        classTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            default: null,
        },
        maxStudents: {
            type: Number,
            default: 60,
            min: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
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

sectionSchema.index({ class: 1 });
sectionSchema.index({ name: 1 });

module.exports = mongoose.model("Section", sectionSchema);
