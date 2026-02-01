const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        deviceFingerprint: {
            type: String,
            required: true,
        },
        deviceInfo: {
            userAgent: String,
            ip: String,
            browser: String,
            os: String,
            device: String,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
        revokedAt: {
            type: Date,
        },
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Index for faster queries
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens

// Static method to clean up expired tokens
refreshTokenSchema.statics.cleanupExpired = async function () {
    const now = new Date();
    await this.deleteMany({ expiresAt: { $lt: now } });
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = async function (userId) {
    await this.updateMany(
        { user: userId, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
    );
};

// Static method to revoke specific device
refreshTokenSchema.statics.revokeDevice = async function (userId, deviceFingerprint) {
    await this.updateMany(
        { user: userId, deviceFingerprint, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
    );
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
