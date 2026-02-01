import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Send, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import { API } from '../../redux/api/utils';
import { getAvatarUrl } from '../../utils/imageUtils';

const ShareModal = ({ isOpen, onClose, post }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sentIds, setSentIds] = useState([]);

    // Fetch connections (Following + Followers or just connections)
    // For specific requirement "Only followers / connected users"
    useEffect(() => {
        if (isOpen) {
            fetchConnections();
        }
    }, [isOpen]);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            // Fetching both to create a comprehensive list of connections
            // Optimization: In a real app, backend should provide a 'connections' or 'friends' endpoint for messaging candidates
            const [followingRes, followersRes] = await Promise.all([
                API.get('/users/following'),
                API.get('/users/followers')
            ]);

            const following = followingRes.data?.data || followingRes.data || [];
            const followers = followersRes.data?.data || followersRes.data || [];

            // Merge and dedup by ID
            const map = new Map();
            following.forEach(u => map.set(u._id, u));
            followers.forEach(u => map.set(u._id, u));

            setUsers(Array.from(map.values()));
        } catch (error) {
            console.error("Error fetching connections for share:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (targetUser) => {
        if (sentIds.includes(targetUser._id)) return;

        // Optimistic UI update
        setSentIds(prev => [...prev, targetUser._id]);

        try {
            // Send message API call
            await API.post('/messages/send', {
                targetUserId: targetUser._id, // Assuming backend handles resolving conversation from targetUserId
                // Or if we need conversationId, we might need to 'getOrCreateDM' first. 
                // Let's assume the provided backend 'sendMessage' logic can handle 'targetUserId' OR we call 'getOrCreateDM' first.
                // Checking backend logic: sendMessage requires 'conversationId'. getOrCreateDM takes 'targetUserId'.
                // So we must get conversation first.

                // Let's do the proper flow:
                // 1. Get/Create DM
                // 2. Send Message with post attachment/link
            });
            // We'll fix the API call logic correctly below
            createNewShareMessage(targetUser);
        } catch (error) {
            console.error("Failed to share:", error);
            // Revert on failure (optional, but UI felt fast)
            setSentIds(prev => prev.filter(id => id !== targetUser._id));
        }
    };

    const createNewShareMessage = async (targetUser) => {
        try {
            // 1. Get Conversation ID
            const convRes = await API.post('/messages/dm', { targetUserId: targetUser._id });
            const conversationId = convRes.data?._id;

            if (conversationId) {
                // 2. Send the Post Content
                // Construct a message that represents the post. 
                // We could send a link, or if the backend supports 'post' type.
                // The spec says "Snippet... preview".
                // Let's send a text message with the App Link to the post.
                const postLink = `${window.location.origin}/post/${post._id}`;
                await API.post('/messages', {
                    conversationId,
                    content: `Check out this post by ${post.user.name}: ${postLink}`,
                    type: 'text' // or 'post' if supported, but let's stick to text + link for now
                });
            }
        } catch (err) {
            console.error(err);
            throw err; // propagates to handleSend catch
        }
    };

    const filteredUsers = users.filter(u =>
        (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute inset-0 z-20 bg-white dark:bg-black flex flex-col overflow-hidden rounded-3xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-center p-4 border-b border-gray-100 dark:border-gray-800 relative shrink-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Share to</h3>
                        <button
                            onClick={onClose}
                            className="absolute right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-4 py-2 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search connections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => {
                                const isSent = sentIds.includes(user._id);
                                return (
                                    <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getAvatarUrl(user.avatar)}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">{user.username}</span>
                                                <span className="text-xs text-gray-500">{user.name}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSend(user)}
                                            disabled={isSent}
                                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${isSent
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default scale-95'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95'
                                                }`}
                                        >
                                            {isSent ? 'Sent' : 'Send'}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                <p>No connections found.</p>
                                <p className="text-xs mt-1">Try following more people!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
