import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiMagnifyingGlass, HiChatBubbleLeftRight, HiXMark, HiUser } from 'react-icons/hi2';
import Search from '../shared/Search';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MESSAGES_API } from '../../redux/api/utils';
import { useOnlineUsers } from '../../contexts/OnlineUsersContext';

const MobileBottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // React Query Client for invalidation
    const queryClient = useQueryClient();
    const { socket } = useOnlineUsers();

    // Fetch conversations to get unread count
    const { data: conversations, refetch } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await MESSAGES_API.get('/conversations');
            return response.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const unreadCount = conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

    // Listen for new messages to update unread count instantly
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            console.log('[MobileNav] New message received, updating unread count');
            // Invalidate query to trigger refetch
            queryClient.invalidateQueries(['conversations']);
            // Also force refetch just in case
            refetch();
        };

        socket.on('message:received', handleNewMessage);

        return () => {
            socket.off('message:received', handleNewMessage);
        };
    }, [socket, queryClient, refetch]);

    // Scroll detection - hide on scroll down, show on scroll up
    useEffect(() => {
        if (location.pathname !== '/home') return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                // At the top, always show
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY) {
                // Scrolling down - hide nav
                setIsVisible(false);
            } else {
                // Scrolling up - show nav
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY, location.pathname]);




    const handleNavClick = (path, action) => {
        if (action === 'search') {
            setShowSearch(true);
        } else if (action === 'scanner') {
            setShowScanner(true);
        } else if (action === 'poll') {
            setShowPollModal(true);
        } else if (path) {
            if (path === '/home' && location.pathname === '/home') {
                window.location.reload();
            } else {
                navigate(path);
            }
        }
    };

    const navItems = [
        { path: '/home', icon: HiHome, label: 'Home' },
        { action: 'search', icon: HiMagnifyingGlass, label: 'Search' },
        { path: '/messages', icon: HiChatBubbleLeftRight, label: 'Messages' },
        { path: '/ai', icon: HiChatBubbleLeftRight, label: 'AI Chat' },
        { path: '/profile', icon: HiUser, label: 'Profile' },
    ];

    const isActive = (item) => {
        if (item.path) return location.pathname === item.path;
        return false;
    };

    // Only show bottom nav on home page
    if (location.pathname !== '/home') {
        return (
            <>
                {/* Search Modal */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/50 z-[60] flex items-start pt-4"
                            onClick={() => setShowSearch(false)}
                        >
                            <motion.div
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -100, opacity: 0 }}
                                className="w-full px-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white/90 dark:bg-black/90 border border-white/20 dark:border-gray-700 rounded-2xl shadow-2xl p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search</h3>
                                        <button
                                            onClick={() => setShowSearch(false)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        >
                                            <HiXMark className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                    <Search />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scanner Modal */}
                <AnimatePresence>
                    {showScanner && (
                        <ScannerModal onClose={() => setShowScanner(false)} />
                    )}
                </AnimatePresence>

                {/* Poll Modal */}
                <AnimatePresence>
                    {showPollModal && (
                        <PollModal onClose={() => setShowPollModal(false)} />
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <>
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : 100 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                }}
                className="mobile-bottom-nav md:hidden fixed bottom-4 left-4 right-4 bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/10 z-50 rounded-full shadow-lg shadow-black/10 dark:shadow-black/30"
            >
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);

                        return (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item.path, item.action)}
                                className="relative flex flex-col items-center justify-center flex-1 py-2 px-1 group"
                            >
                                {/* Active indicator background */}
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-orange-50 dark:bg-orange-900/20 rounded-2xl"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 35,
                                            mass: 0.8
                                        }}
                                    />
                                )}

                                {/* Icon */}
                                <div className="relative z-10">
                                    <motion.div
                                        animate={{
                                            scale: active ? 1.1 : 1,
                                            y: active ? -2 : 0
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 20,
                                            mass: 0.5
                                        }}
                                    >
                                        <Icon
                                            className={`w-6 h-6 transition-colors duration-300 ${active
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                                                }`}
                                        />
                                    </motion.div>

                                    {/* Unread Badge for Messages */}
                                    {item.label === 'Messages' && unreadCount > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm border-[1.5px] border-white dark:border-black z-20">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}

                                    {/* Active dot indicator */}
                                    {active && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`relative z-10 text-[10px] mt-1 font-medium transition-colors duration-300 ${active
                                        ? 'text-orange-600 dark:text-orange-400'
                                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </motion.nav>

            {/* Search Modal */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/50 z-[60] flex items-start pt-4"
                        onClick={() => setShowSearch(false)}
                    >
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            className="w-full px-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white/90 dark:bg-black/90 border border-white/20 dark:border-gray-700 rounded-2xl shadow-2xl p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search</h3>
                                    <button
                                        onClick={() => setShowSearch(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <HiXMark className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                                <Search />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanner Modal */}
            <AnimatePresence>
                {showScanner && (
                    <ScannerModal onClose={() => setShowScanner(false)} />
                )}
            </AnimatePresence>

            {/* Poll Modal */}
            <AnimatePresence>
                {showPollModal && (
                    <PollModal onClose={() => setShowPollModal(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

// Scanner Modal Component
const ScannerModal = ({ onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [cameraError, setCameraError] = useState('');
    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);

    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setScanning(true);
            setCameraError('');
        } catch (err) {
            console.error("Camera error:", err);
            setCameraError('Unable to access camera. Please ensure you have granted permission.');
            setScanning(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanning(false);
    };

    const handleScan = () => {
        // In a real app with a QR library, this would happen automatically when a code is detected.
        // Here we simulate a successful scan after a user action or timeout.
        setScanning(false);
        stopCamera();
        setScannedData('https://campus-connects.com/event/123');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60] flex flex-col"
            onClick={onClose}
        >
            <div className="relative flex-1 bg-black" onClick={(e) => e.stopPropagation()}>
                {/* Camera View */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 border-2 border-white/30">
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10">
                        <h3 className="text-white font-bold text-lg">Scan QR Code</h3>
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/30 rounded-full text-white hover:bg-black/50"
                        >
                            <HiXMark className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Scanning Frame */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-transparent -mt-1 -ml-1" style={{ borderImage: 'linear-gradient(to bottom right, #f97316, #ef4444, #eab308) 1' }}></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-transparent -mt-1 -mr-1" style={{ borderImage: 'linear-gradient(to bottom left, #f97316, #ef4444, #eab308) 1' }}></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-transparent -mb-1 -ml-1" style={{ borderImage: 'linear-gradient(to top right, #f97316, #ef4444, #eab308) 1' }}></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-transparent -mb-1 -mr-1" style={{ borderImage: 'linear-gradient(to top left, #f97316, #ef4444, #eab308) 1' }}></div>

                            {scanning && (
                                <motion.div
                                    animate={{ y: [0, 250, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-full h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                                />
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent">
                        {cameraError ? (
                            <div className="text-red-400 text-center mb-4 bg-black/50 p-3 rounded-lg">
                                {cameraError}
                            </div>
                        ) : (
                            <p className="text-white/80 text-sm mb-6 text-center">
                                Point camera at a QR code to scan
                            </p>
                        )}

                        {scannedData ? (
                            <div className="bg-white p-4 rounded-xl w-full max-w-sm mx-auto mb-4">
                                <p className="text-green-600 font-bold mb-1">Scanned Successfully!</p>
                                <p className="text-gray-800 break-all font-mono text-sm bg-gray-100 p-2 rounded">
                                    {scannedData}
                                </p>
                                <button
                                    onClick={() => { setScannedData(''); startCamera(); }}
                                    className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg font-medium"
                                >
                                    Scan Another
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleScan}
                                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center mb-4"
                            >
                                <div className="w-12 h-12 bg-white rounded-full"></div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Poll Modal Component
const PollModal = ({ onClose }) => {
    const [question, setQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setSubmitting(true);
        // TODO: Implement poll creation API call
        setTimeout(() => {
            setSubmitting(false);
            onClose();
            alert('Poll created successfully!');
        }, 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Poll</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <HiXMark className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Poll Question
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a yes/no question..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Poll Options:</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <span className="text-gray-900 dark:text-white font-medium">Yes</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                <span className="text-gray-900 dark:text-white font-medium">No</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !question.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Creating...' : 'Create Poll'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default MobileBottomNav;
