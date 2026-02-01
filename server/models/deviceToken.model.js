const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    deviceInfo: {
        browser: String,
        os: String,
        device: String,
        userAgent: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
deviceTokenSchema.index({ user: 1, isActive: 1 });
deviceTokenSchema.index({ lastUsed: 1 }); // For cleanup of old tokens

// Update lastUsed timestamp
deviceTokenSchema.methods.updateLastUsed = function () {
    this.lastUsed = new Date();
    return this.save();
};

// Static method to cleanup old/inactive tokens
deviceTokenSchema.statics.cleanupOldTokens = async function (daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.deleteMany({
        lastUsed: { $lt: cutoffDate },
        isActive: false
    });
};

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
