import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
// Get these from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let messaging = null;

try {
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Cloud Messaging
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null
 */
export const requestNotificationPermission = async () => {
    try {
        if (!messaging) {
            console.warn('Firebase messaging not initialized');
            return null;
        }

        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('Notification permission granted');

            // Get FCM token
            // VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
            const token = await getToken(messaging, {
                vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
            });

            if (token) {
                console.log('FCM Token:', token);
                return token;
            } else {
                console.warn('No registration token available');
                return null;
            }
        } else if (permission === 'denied') {
            console.warn('Notification permission denied');
            return null;
        } else {
            console.warn('Notification permission dismissed');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export const onForegroundMessage = (callback) => {
    if (!messaging) {
        console.warn('Firebase messaging not initialized');
        return () => { };
    }

    return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
};

/**
 * Get current FCM token
 * @returns {Promise<string|null>} FCM token or null
 */
export const getCurrentToken = async () => {
    try {
        if (!messaging) {
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });

        return token || null;
    } catch (error) {
        console.error('Error getting current token:', error);
        return null;
    }
};

/**
 * Check if notifications are supported and permission is granted
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Get notification permission status
 * @returns {string} 'granted', 'denied', or 'default'
 */
export const getNotificationPermission = () => {
    if ('Notification' in window) {
        return Notification.permission;
    }
    return 'default';
};

export { messaging };
export default app;
