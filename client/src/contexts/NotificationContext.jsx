import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onForegroundMessage } from '../config/firebase.config';
import notificationService from '../services/notificationService';
import NotificationToast from '../components/notifications/NotificationToast';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [permission, setPermission] = useState('default');

    // Initialize notifications on mount
    useEffect(() => {
        initializeNotifications();
        checkPermission();
    }, []);

    // Listen for foreground messages
    useEffect(() => {
        const unsubscribe = onForegroundMessage((payload) => {
            console.log('Foreground notification received:', payload);
            showNotification(payload);

            // Play notification sound (optional)
            playNotificationSound();
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    const checkPermission = () => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    };

    const initializeNotifications = async () => {
        try {
            const profile = localStorage.getItem('profile');
            if (!profile) {
                console.log('No user profile found, skipping notification initialization');
                return;
            }

            const { accessToken } = JSON.parse(profile);
            if (!accessToken) {
                console.log('No access token found');
                return;
            }

            // Check if already initialized
            const fcmToken = localStorage.getItem('fcm_token');
            if (fcmToken) {
                setIsInitialized(true);
                console.log('Notifications already initialized');
                return;
            }

            // Initialize
            const success = await notificationService.initialize(accessToken);
            setIsInitialized(success);

            if (success) {
                checkPermission();
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    };

    const requestPermission = async () => {
        try {
            const profile = localStorage.getItem('profile');
            if (!profile) {
                throw new Error('User not authenticated');
            }

            const { accessToken } = JSON.parse(profile);
            const success = await notificationService.initialize(accessToken);

            setIsInitialized(success);
            checkPermission();

            return success;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    const showNotification = useCallback((notification) => {
        const id = Date.now();
        const newNotification = {
            id,
            ...notification,
            timestamp: new Date()
        };

        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const playNotificationSound = () => {
        try {
            // Create a simple notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };

    const sendTestNotification = async () => {
        try {
            const profile = localStorage.getItem('profile');
            if (!profile) {
                throw new Error('User not authenticated');
            }

            const { accessToken } = JSON.parse(profile);
            return await notificationService.sendTestNotification(accessToken);
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    };

    const value = {
        isInitialized,
        permission,
        requestPermission,
        showNotification,
        sendTestNotification,
        isEnabled: notificationService.isEnabled()
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Render notification toasts */}
            <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
                <div className="pointer-events-auto">
                    {notifications.map(notification => (
                        <NotificationToast
                            key={notification.id}
                            notification={notification}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </div>
            </div>
        </NotificationContext.Provider>
    );
};
