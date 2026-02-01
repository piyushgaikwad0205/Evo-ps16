const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        academicYear: {
            type: String,
            trim: true,
            default: "",
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
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

classSchema.index({ department: 1 });
classSchema.index({ name: 1 });

module.exports = mongoose.model("Class", classSchema);
