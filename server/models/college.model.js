const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
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
        address: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        zipCode: {
            type: String,
            trim: true,
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        contactPhone: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        logo: {
            type: String, // URL to logo
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "suspended"],
            default: "approved",
        },
        subscriptionPlan: {
            type: String,
            enum: ["free", "basic", "premium", "enterprise"],
            default: "free",
        },
        settings: {
            theme: { type: String, default: "light" },
            allowExternalSignups: { type: Boolean, default: true },
            features: {
                events: { type: Boolean, default: true },
                clubs: { type: Boolean, default: true },
                alumni: { type: Boolean, default: true },
            }
        },
        establishedYear: {
            type: Number,
        },
        university: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("College", collegeSchema);
