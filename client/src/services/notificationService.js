import axios from 'axios';
import { requestNotificationPermission, getCurrentToken } from '../config/firebase.config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

class NotificationService {
    /**
     * Initialize notifications for the user
     * @param {string} token - JWT auth token
     * @returns {Promise<boolean>} Success status
     */
    async initialize(token) {
        try {
            // Request permission and get FCM token
            const fcmToken = await requestNotificationPermission();

            if (!fcmToken) {
                console.warn('Failed to get FCM token');
                return false;
            }

            // Register token with backend
            const success = await this.registerToken(fcmToken, token);

            if (success) {
                // Store token locally for reference
                localStorage.setItem('fcm_token', fcmToken);
                console.log('Notifications initialized successfully');
            }

            return success;
        } catch (error) {
            console.error('Error initializing notifications:', error);
            return false;
        }
    }

    /**
     * Register FCM token with backend
     * @param {string} fcmToken - FCM device token
     * @param {string} authToken - JWT auth token
     * @returns {Promise<boolean>} Success status
     */
    async registerToken(fcmToken, authToken) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/notifications/register-token`,
                { token: fcmToken },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            return response.data.success;
        } catch (error) {
            console.error('Error registering FCM token:', error);
            return false;
        }
    }

    /**
     * Remove FCM token from backend
     * @param {string} authToken - JWT auth token
     * @returns {Promise<boolean>} Success status
     */
    async removeToken(authToken) {
        try {
            const fcmToken = localStorage.getItem('fcm_token');

            if (!fcmToken) {
                return true; // No token to remove
            }

            const response = await axios.post(
                `${API_BASE_URL}/notifications/remove-token`,
                { token: fcmToken },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            if (response.data.success) {
                localStorage.removeItem('fcm_token');
            }

            return response.data.success;
        } catch (error) {
            console.error('Error removing FCM token:', error);
            return false;
        }
    }

    /**
     * Refresh FCM token
     * @param {string} authToken - JWT auth token
     * @returns {Promise<boolean>} Success status
     */
    async refreshToken(authToken) {
        try {
            const fcmToken = await getCurrentToken();

            if (!fcmToken) {
                return false;
            }

            return await this.registerToken(fcmToken, authToken);
        } catch (error) {
            console.error('Error refreshing FCM token:', error);
            return false;
        }
    }

    /**
     * Get user's registered devices
     * @param {string} authToken - JWT auth token
     * @returns {Promise<Array>} List of devices
     */
    async getUserDevices(authToken) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/notifications/devices`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            return response.data.data.devices || [];
        } catch (error) {
            console.error('Error fetching user devices:', error);
            return [];
        }
    }

    /**
     * Send test notification
     * @param {string} authToken - JWT auth token
     * @param {Object} options - Notification options
     * @returns {Promise<boolean>} Success status
     */
    async sendTestNotification(authToken, options = {}) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/notifications/test`,
                {
                    title: options.title || 'Test Notification',
                    body: options.body || 'This is a test notification',
                    clickAction: options.clickAction || '/home'
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            return response.data.success;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }

    /**
     * Check if notifications are enabled
     * @returns {boolean}
     */
    isEnabled() {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    /**
     * Get notification permission status
     * @returns {string} 'granted', 'denied', or 'default'
     */
    getPermissionStatus() {
        if ('Notification' in window) {
            return Notification.permission;
        }
        return 'default';
    }
}

export default new NotificationService();
