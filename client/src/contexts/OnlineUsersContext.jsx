import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const OnlineUsersContext = createContext();

export const useOnlineUsers = () => {
    const context = useContext(OnlineUsersContext);
    if (!context) {
        throw new Error('useOnlineUsers must be used within OnlineUsersProvider');
    }
    return context;
};

export const OnlineUsersProvider = ({ children }) => {
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Get socket URL and token
        const base = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const socketUrl = base.replace(/\/$/, '');

        const stored = localStorage.getItem('profile');
        const token = stored ? JSON.parse(stored).accessToken : null;

        if (!token) return; // Don't connect if not authenticated

        // Create socket connection
        const newSocket = io(socketUrl, {
            path: '/socket.io',
            withCredentials: true,
            auth: { token }
        });

        // Set socket state
        setSocket(newSocket);
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('[OnlineUsers] Socket connected');
            // Request current online users
            newSocket.emit('request:online-users');
        });

        newSocket.on('connect_error', (err) => {
            console.error('[OnlineUsers] Socket connection error:', err);
        });

        // Receive initial online users list
        newSocket.on('online:users', ({ userIds }) => {
            console.log('[OnlineUsers] Online users received:', userIds);
            setOnlineUsers(new Set(userIds || []));
        });

        // User comes online
        newSocket.on('user:online', ({ userId }) => {
            console.log('[OnlineUsers] User came online:', userId);
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        // User goes offline
        newSocket.on('user:offline', ({ userId }) => {
            console.log('[OnlineUsers] User went offline:', userId);
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    const isUserOnline = (userId) => {
        return onlineUsers.has(userId);
    };

    return (
        <OnlineUsersContext.Provider value={{ onlineUsers, isUserOnline, socket }}>
            {children}
        </OnlineUsersContext.Provider>
    );
};
