import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { API } from '../redux/api/utils';
import { HiOutlineBell, HiOutlineTrash, HiOutlineCheck, HiOutlineSparkles } from 'react-icons/hi2';

// Custom time formatter to replace date-fns
const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
};

const Notifications = () => {
    const { isDarkMode } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/users/me/notifications');

            // Handle different response formats
            let notifArray = [];
            if (Array.isArray(data)) {
                notifArray = data;
            } else if (data.notifications && Array.isArray(data.notifications)) {
                notifArray = data.notifications;
            } else if (data.data && Array.isArray(data.data)) {
                notifArray = data.data;
            }

            setNotifications(notifArray);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await API.patch(`/users/me/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await API.delete(`/users/me/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
            await Promise.all(unreadIds.map(id => API.patch(`/users/me/notifications/${id}/read`)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) return;

        try {
            await Promise.all(notifications.map(n => API.delete(`/users/me/notifications/${n._id}`)));
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear all notifications:', error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <HiOutlineBell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Notifications
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                </p>
                            </div>
                        </div>

                        {notifications.length > 0 && (
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={handleClearAll}
                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        {['all', 'unread', 'read'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative ${filter === tab
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab}
                                {filter === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <HiOutlineSparkles className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No notifications
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter === 'unread'
                                ? "You're all caught up!"
                                : filter === 'read'
                                    ? 'No read notifications'
                                    : 'You have no notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${!notification.isRead
                                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!notification.isRead
                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        <HiOutlineBell className={`w-5 h-5 ${!notification.isRead
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-400'
                                            }`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-white mb-1">
                                            {notification.message || notification.content}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-start gap-2">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                                                title="Mark as read"
                                            >
                                                <HiOutlineCheck className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
