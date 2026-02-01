const mongoose = require("mongoose");

const globalSettingsSchema = new mongoose.Schema(
    {
        platformName: {
            type: String,
            default: "Campus Connects",
        },
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
        allowNewRegistrations: {
            type: Boolean,
            default: true,
        },
        defaultTheme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "light",
        },
        emailSettings: {
            provider: { type: String, default: "smtp" },
            host: String,
            port: Number,
            secure: Boolean,
            user: String,
            pass: String,
        },
        security: {
            maxLoginAttempts: { type: Number, default: 5 },
            passwordPolicy: {
                minLength: { type: Number, default: 8 },
                requireSpecialChar: { type: Boolean, default: true },
            },
        },
        features: {
            aiModeration: { type: Boolean, default: true },
            globalEvents: { type: Boolean, default: true },
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("GlobalSettings", globalSettingsSchema);
