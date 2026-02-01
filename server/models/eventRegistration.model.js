const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        teamName: {
            type: String,
            required: true,
        },
        teamSize: {
            type: Number,
            required: true,
        },
        members: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
                name: { type: String, required: true },
                contact: { type: String, required: true },
            },
        ],
        paymentProofUrl: {
            type: String,
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        rejectionReason: {
            type: String,
            default: "",
        },
        primaryContactNumber: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const EventRegistration = mongoose.model(
    "EventRegistration",
    eventRegistrationSchema
);

module.exports = EventRegistration;
