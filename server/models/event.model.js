const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        bannerUrl: {
            type: String,
            required: true,
        },
        helpContact: {
            type: String,
            required: true,
        },
        totalSlots: {
            type: Number,
            required: true,
        },
        filledSlots: {
            type: Number,
            default: 0,
        },
        maxTeamSize: {
            type: Number,
            default: 5,
        },
        qrCodeUrl: {
            type: String,
            required: true,
        },
        eventDate: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "College",
            required: true,
        },
    },
    { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
