const admin = require('firebase-admin');
const DeviceToken = require('../models/deviceToken.model');

class NotificationService {
    /**
     * Send notification to a specific user
     * @param {String} userId - User ID to send notification to
     * @param {Object} notification - Notification payload
     * @param {Object} data - Additional data payload
     * @returns {Promise<Object>} - Send result
     */
    async sendToUser(userId, notification, data = {}) {
        try {
            // Get all active tokens for the user
            const deviceTokens = await DeviceToken.find({
                user: userId,
                isActive: true
            });

            if (deviceTokens.length === 0) {
                console.log(`No active device tokens found for user: ${userId}`);
                return { success: false, message: 'No active devices' };
            }

            const tokens = deviceTokens.map(dt => dt.token);

            // Send to all user's devices
            const result = await this.sendToTokens(tokens, notification, data);

            // Handle invalid tokens
            if (result.invalidTokens && result.invalidTokens.length > 0) {
                await this.markTokensAsInactive(result.invalidTokens);
            }

            return result;
        } catch (error) {
            console.error('Error sending notification to user:', error);
            throw error;
        }
    }

    /**
     * Send notification to multiple users
     * @param {Array<String>} userIds - Array of user IDs
     * @param {Object} notification - Notification payload
     * @param {Object} data - Additional data payload
     * @returns {Promise<Object>} - Send result
     */
    async sendToMultipleUsers(userIds, notification, data = {}) {
        try {
            const deviceTokens = await DeviceToken.find({
                user: { $in: userIds },
                isActive: true
            });

            if (deviceTokens.length === 0) {
                return { success: false, message: 'No active devices found' };
            }

            const tokens = deviceTokens.map(dt => dt.token);
            const result = await this.sendToTokens(tokens, notification, data);

            if (result.invalidTokens && result.invalidTokens.length > 0) {
                await this.markTokensAsInactive(result.invalidTokens);
            }

            return result;
        } catch (error) {
            console.error('Error sending notification to multiple users:', error);
            throw error;
        }
    }

    /**
     * Send notification to specific tokens
     * @param {Array<String>} tokens - FCM tokens
     * @param {Object} notification - Notification payload
     * @param {Object} data - Additional data payload
     * @returns {Promise<Object>} - Send result
     */
    async sendToTokens(tokens, notification, data = {}) {
        try {
            if (!tokens || tokens.length === 0) {
                return { success: false, message: 'No tokens provided' };
            }

            // Prepare the message
            const message = {
                notification: {
                    title: notification.title || 'Campus Connect',
                    body: notification.body || '',
                    ...(notification.image && { image: notification.image })
                },
                data: {
                    ...data,
                    clickAction: data.clickAction || '/',
                    timestamp: Date.now().toString()
                },
                webpush: {
                    notification: {
                        icon: notification.icon || '/icons/icon-192.png',
                        badge: '/icons/icon-96.png',
                        vibrate: [200, 100, 200],
                        requireInteraction: notification.requireInteraction || false,
                        ...(data.clickAction && {
                            data: {
                                url: data.clickAction
                            }
                        })
                    },
                    fcmOptions: {
                        link: data.clickAction || '/'
                    }
                }
            };

            // Send to multiple tokens (batch send)
            const response = await admin.messaging().sendEachForMulticast({
                tokens: tokens,
                ...message
            });

            // Collect invalid tokens
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (
                        error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered'
                    ) {
                        invalidTokens.push(tokens[idx]);
                    }
                }
            });

            return {
                success: response.successCount > 0,
                successCount: response.successCount,
                failureCount: response.failureCount,
                invalidTokens
            };
        } catch (error) {
            console.error('Error sending to tokens:', error);
            throw error;
        }
    }

    /**
     * Send notification based on topic
     * @param {String} topic - Topic name
     * @param {Object} notification - Notification payload
     * @param {Object} data - Additional data payload
     * @returns {Promise<Object>} - Send result
     */
    async sendToTopic(topic, notification, data = {}) {
        try {
            const message = {
                topic: topic,
                notification: {
                    title: notification.title || 'Campus Connect',
                    body: notification.body || ''
                },
                data: {
                    ...data,
                    timestamp: Date.now().toString()
                },
                webpush: {
                    notification: {
                        icon: notification.icon || '/icons/icon-192.png',
                        badge: '/icons/icon-96.png'
                    }
                }
            };

            const response = await admin.messaging().send(message);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('Error sending to topic:', error);
            throw error;
        }
    }

    /**
     * Mark tokens as inactive
     * @param {Array<String>} tokens - Tokens to mark as inactive
     */
    async markTokensAsInactive(tokens) {
        try {
            await DeviceToken.updateMany(
                { token: { $in: tokens } },
                { $set: { isActive: false } }
            );
            console.log(`Marked ${tokens.length} tokens as inactive`);
        } catch (error) {
            console.error('Error marking tokens as inactive:', error);
        }
    }

    /**
     * Subscribe tokens to a topic
     * @param {Array<String>} tokens - FCM tokens
     * @param {String} topic - Topic name
     */
    async subscribeToTopic(tokens, topic) {
        try {
            const response = await admin.messaging().subscribeToTopic(tokens, topic);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } catch (error) {
            console.error('Error subscribing to topic:', error);
            throw error;
        }
    }

    /**
     * Unsubscribe tokens from a topic
     * @param {Array<String>} tokens - FCM tokens
     * @param {String} topic - Topic name
     */
    async unsubscribeFromTopic(tokens, topic) {
        try {
            const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } catch (error) {
            console.error('Error unsubscribing from topic:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
