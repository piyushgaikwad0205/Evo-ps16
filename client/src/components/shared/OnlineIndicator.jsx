import React from 'react';
import { useOnlineUsers } from '../../contexts/OnlineUsersContext';

/**
 * OnlineIndicator - Shows a green dot if user is online
 * @param {string} userId - The user ID to check
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} position - Position: 'absolute' or 'relative' (default: 'absolute')
 * @param {boolean} showOffline - Show gray dot when offline (default: false)
 */
const OnlineIndicator = ({ userId, size = 'md', position = 'absolute', showOffline = false }) => {
    const { isUserOnline } = useOnlineUsers();
    const online = isUserOnline(userId);

    if (!online && !showOffline) return null;

    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5'
    };

    const positionClasses = position === 'absolute'
        ? 'absolute bottom-0 right-0'
        : 'relative';

    const colorClass = online ? 'bg-green-500' : 'bg-gray-400';

    return (
        <div
            className={`${sizeClasses[size]} ${colorClass} ${positionClasses} rounded-full ring-2 ring-white dark:ring-gray-900`}
            title={online ? 'Online' : 'Offline'}
        />
    );
};

export default OnlineIndicator;
