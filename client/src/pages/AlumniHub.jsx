import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sendConnectionRequest, removeConnection } from '../redux/api/connectionAPI';
import { API } from '../redux/api/utils';
import { useAlumniDirectory, useSuccessStories } from '../hooks/useApi';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiSearch,
    HiCheckCircle,
    HiUserAdd
} from 'react-icons/hi';
import {
    Search,
    Star,
    ThumbsUp,
    MessageCircle,
    Plus
} from 'lucide-react';
import AppLoader from '../components/loader/AppLoader';

// --- Tab Bar Component ---
const TabBar = ({ activeTab, setActiveTab, isDarkMode }) => {
    const tabs = [
        { id: 'directory', label: 'Directory' },
        { id: 'connections', label: 'My Connections' },
        { id: 'stories', label: 'Stories' }
    ];

    return (
        <div className={`sticky top-16 z-30 w-full border-b ${isDarkMode ? 'bg-dark-bg border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative py-4 text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
                                ? (isDarkMode ? 'text-white' : 'text-gray-900')
                                : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                                }`}
                        >
                            <span className={activeTab === tab.id ? 'font-bold' : ''}>{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-black'}`}
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Directory Section ---
const DirectorySection = ({ isDarkMode, user, showConnections }) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [connectionStates, setConnectionStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: alumni = [], isLoading } = useAlumniDirectory(debouncedSearch);

    // Fetch connection status for all alumni
    useEffect(() => {
        const fetchConnectionStatuses = async () => {
            if (!alumni.length || !user) return;

            const statuses = {};
            await Promise.all(
                alumni.map(async (person) => {
                    if (person._id === user._id) return;
                    try {
                        const response = await API.get(`/connections/status/${person._id}`);
                        statuses[person._id] = {
                            status: response.data.status,
                            connectionId: response.data.connectionId
                        };
                    } catch (err) {
                        statuses[person._id] = { status: 'none', connectionId: null };
                    }
                })
            );
            setConnectionStates(statuses);
        };

        fetchConnectionStatuses();
    }, [alumni, user]);

    const handleToggleConnection = async (person) => {
        if (!user) {
            alert('Please sign in to connect.');
            return;
        }

        const personId = person._id;
        const currentState = connectionStates[personId] || { status: 'none' };

        setLoadingStates(prev => ({ ...prev, [personId]: true }));

        try {
            if (currentState.status === 'connected' || currentState.status === 'accepted') {
                // Disconnect
                const { error } = await removeConnection(currentState.connectionId);
                if (!error) {
                    setConnectionStates(prev => ({
                        ...prev,
                        [personId]: { status: 'none', connectionId: null }
                    }));
                    alert(`Disconnected from ${person.name}`);
                }
            } else {
                // Connect
                const { error, data } = await sendConnectionRequest({ recipientId: personId });
                if (!error && data) {
                    setConnectionStates(prev => ({
                        ...prev,
                        [personId]: {
                            status: data.connection.status,
                            connectionId: data.connection._id
                        }
                    }));
                    alert(`Connection request sent to ${person.name}`);
                }
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update connection');
        } finally {
            setLoadingStates(prev => ({ ...prev, [personId]: false }));
        }
    };

    // Filter out current user from the list
    let filteredAlumni = alumni.filter(a => a._id !== user?._id);

    // Filter by connections if 'My Connections' tab is active
    if (showConnections) {
        filteredAlumni = filteredAlumni.filter(person => {
            const status = connectionStates[person._id]?.status;
            return status === 'connected' || status === 'accepted';
        });
    }

    return (
        <div className="py-6">
            {/* Header with Count (Like Followers/Following) */}
            <div className="text-center mb-6">
                <h2 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    {showConnections ? 'Your Connections' : 'Alumni Directory'}
                    <span className="ml-2 opacity-80">({filteredAlumni.length})</span>
                </h2>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md mx-auto sm:mx-0">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search alumni by name, company, or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode
                        ? 'bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                />
            </div>

            {/* Grid */}
            {isLoading && filteredAlumni.length === 0 ? (
                <AppLoader />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAlumni.map((person) => {
                        const connectionState = connectionStates[person._id] || { status: 'none' };
                        const isLoadingBtn = loadingStates[person._id];
                        const isConnected = connectionState.status === 'connected' || connectionState.status === 'accepted';
                        const isPending = connectionState.status === 'pending';

                        return (
                            <div
                                key={person._id}
                                className={`group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${isDarkMode
                                    ? 'bg-dark-bg-secondary hover:bg-dark-bg-tertiary border border-white/5 hover:border-white/10 shadow-lg'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-lg'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <img
                                        src={person.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                                        alt={person.name}
                                        className={`w-20 h-20 rounded-full object-cover mb-4 ring-4 ${isDarkMode ? 'ring-dark-bg' : 'ring-white'} shadow-md`}
                                    />
                                    <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {person.name}
                                    </h3>
                                    {person.position && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                                            {person.position}
                                        </p>
                                    )}
                                    {person.currentEmployer && (
                                        <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            at {person.currentEmployer}
                                        </p>
                                    )}

                                    <div className="mt-auto w-full pt-4 border-t border-gray-100 dark:border-white/5 flex gap-2">
                                        <Link
                                            to={`/alumni/profile/${person._id}`}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium text-center transition-colors ${isDarkMode
                                                ? 'bg-white/5 text-white hover:bg-white/10'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => handleToggleConnection(person)}
                                            disabled={isLoadingBtn || isPending}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${isConnected
                                                ? isDarkMode
                                                    ? 'bg-white/10 text-white hover:bg-white/15 border border-white/20'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'
                                                : isPending
                                                    ? isDarkMode
                                                        ? 'bg-white/5 text-gray-400 border border-white/10'
                                                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isLoadingBtn ? (
                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                            ) : isPending ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                                    Pending
                                                </>
                                            ) : isConnected ? (
                                                <>
                                                    <HiCheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                    Connected
                                                </>
                                            ) : (
                                                <>
                                                    <HiUserAdd className="w-3.5 h-3.5" />
                                                    Connect
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- Stories Section ---
// Similar refactor
const StoriesSection = ({ isDarkMode, user }) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedStory, setSelectedStory] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: stories = [], isLoading } = useSuccessStories(debouncedSearch);

    return (
        <div className="py-6">
            {/* Search & Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search stories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode
                            ? 'bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                            }`}
                    />
                </div>
                {user && user.role === 'alumni' && (
                    <Link
                        to="/success-stories/create"
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span>Share Story</span>
                    </Link>
                )}
            </div>

            {/* Stories Grid */}
            {isLoading && stories.length === 0 ? (
                <AppLoader />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stories.map((story) => (
                        <div
                            key={story._id}
                            onClick={() => setSelectedStory(story)}
                            className={`cursor-pointer group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${isDarkMode
                                ? 'bg-dark-bg-secondary hover:bg-dark-bg-tertiary border border-white/5 hover:border-white/10'
                                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={story.author?.avatar || "https://via.placeholder.com/48x48"}
                                    alt={story.author?.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {story.author?.name}
                                            </h3>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {new Date(story.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {story.featured && (
                                            <Star size={16} className="text-yellow-400 fill-current" />
                                        )}
                                    </div>

                                    <h4 className={`mt-3 text-lg font-bold line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {story.title}
                                    </h4>
                                    <p className={`mt-1 text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {story.content}
                                    </p>

                                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp size={14} /> {story.likes?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle size={14} /> {story.comments?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Story Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedStory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl ${isDarkMode ? 'bg-dark-bg border border-white/10' : 'bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={selectedStory.author?.avatar}
                                    alt={selectedStory.author?.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedStory.title}
                                    </h2>
                                    <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        by {selectedStory.author?.name}
                                    </p>
                                </div>
                            </div>

                            <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                                <p className={`whitespace-pre-wrap text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {selectedStory.content}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                                <button
                                    onClick={() => setSelectedStory(null)}
                                    className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Page Component ---
const AlumniHub = () => {
    const [activeTab, setActiveTab] = useState('directory');
    const { isDarkMode } = useTheme();
    const { userData: user } = useSelector((state) => state.auth);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'directory' || activeTab === 'connections' ? (
                            <DirectorySection
                                isDarkMode={isDarkMode}
                                user={user}
                                showConnections={activeTab === 'connections'}
                            />
                        ) : (
                            <StoriesSection isDarkMode={isDarkMode} user={user} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AlumniHub;
