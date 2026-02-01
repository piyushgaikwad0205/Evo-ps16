const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userNotificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        type: {
            type: String,
            enum: ["like", "comment", "reply", "follow", "mention", "system", "message", "post"],
            required: true
        },
        content: {
            type: String,
            default: ""
        },
        relatedId: { // ID of post, comment, etc.
            type: Schema.Types.ObjectId
        },
        relatedModel: {
            type: String, // 'Post', 'Comment', etc.
            enum: ['Post', 'Comment', 'User', 'Community']
        },
        isRead: {
            type: Boolean,
            default: false
        },
        link: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("UserNotification", userNotificationSchema);
