import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationToast = ({ notification, onClose }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleClick = () => {
        const clickAction = notification.data?.clickAction || notification.fcmOptions?.link || '/';
        navigate(clickAction);
        handleClose();
    };

    const title = notification.notification?.title || notification.title || 'Notification';
    const body = notification.notification?.body || notification.body || '';
    const icon = notification.notification?.icon || notification.icon || '/icons/icon-96.png';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-20 right-4 z-[9999] max-w-sm w-full"
                >
                    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-white" />
                                <span className="text-sm font-semibold text-white">New Notification</span>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div
                            onClick={handleClick}
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={icon}
                                        alt="Notification"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                                        onError={(e) => {
                                            e.target.src = '/icons/icon-96.png';
                                        }}
                                    />
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                                        {title}
                                    </h4>
                                    {body && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {body}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Just now
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                            className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
