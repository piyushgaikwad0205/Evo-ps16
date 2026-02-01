import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { API } from '../redux/api/utils';
import { isUserAuthenticated } from '../utils/authUtils';

const usePushNotifications = () => {
    useEffect(() => {
        // Only run if user is authenticated
        if (!isUserAuthenticated()) {
            return;
        }

        // Check if messaging is available
        if (!messaging) {
            console.log('Firebase messaging not initialized');
            return;
        }

        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    // Generate Token - VAPID key is optional in some configurations
                    const tokenOptions = {};
                    if (process.env.REACT_APP_VAPID_KEY) {
                        tokenOptions.vapidKey = process.env.REACT_APP_VAPID_KEY;
                    }

                    const token = await getToken(messaging, tokenOptions);

                    if (token) {
                        // Send to backend
                        await API.post('/users/fcm-token', { token });
                        console.log('FCM token registered successfully');
                    }
                }
            } catch (error) {
                console.warn('Push notifications not available:', error.message);
                // Don't throw - gracefully degrade if push notifications aren't available
            }
        };

        requestPermission();

        // Listen for foreground messages
        let unsubscribe;
        try {
            unsubscribe = onMessage(messaging, (payload) => {
                console.log('Foreground message:', payload);

                // Show browser notification
                if (payload.notification) {
                    new Notification(payload.notification.title || 'New Message', {
                        body: payload.notification.body || '',
                        icon: payload.notification.icon || '/logo192.png',
                        badge: '/logo192.png'
                    });
                }
            });
        } catch (error) {
            console.warn('Could not set up message listener:', error.message);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);
};

export default usePushNotifications;
