import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicUsers, followUser } from '../../redux/api/userAPI';
import { useTheme } from '../../contexts/ThemeContext';
import { X } from 'lucide-react';

const SuggestedUsers = ({ userData }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await getPublicUsers();
                // Filter out current user and already followed users if logic permits
                // For now, just shuffle or take first few that aren't me
                if (data) {
                    const filtered = data.filter(u => u._id !== userData?._id && !userData?.following?.includes(u._id));
                    setUsers(filtered.slice(0, 10)); // Show top 10 suggestions
                }
            } catch (error) {
                console.error("Failed to fetch suggested users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [userData]);

    const handleFollow = async (userId) => {
        try {
            await followUser(userId);
            // Remove user from suggestions after follow
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error) {
            console.error("Failed to follow user", error);
        }
    };

    if (loading || users.length === 0) return null;

    return (
        <div className={`py-4 mb-4 ${isDarkMode ? 'bg-transparent' : 'bg-transparent'}`}>
            <div className="flex items-center justify-between px-4 mb-3">
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Suggested for you
                </h3>
                <Link to="/network" className="text-xs font-medium text-blue-500 hover:text-blue-600">
                    See All
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x">
                {users.map(user => (
                    <div
                        key={user._id}
                        className={`min-w-[140px] w-[140px] snap-center flex flex-col items-center p-3 rounded-lg border ${isDarkMode
                                ? 'bg-dark-bg-secondary border-gray-800'
                                : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="relative mb-2">
                            <button
                                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-transparent text-gray-400 hover:text-gray-600"
                                onClick={() => setUsers(prev => prev.filter(u => u._id !== user._id))}
                            >
                                <X size={12} />
                            </button>
                            <img
                                src={user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                                alt={user.name}
                                className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                        </div>

                        <Link to={`/user/${user._id}`} className="text-center mb-1">
                            <h4 className={`text-sm font-semibold truncate w-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.name}
                            </h4>
                            <p className={`text-xs truncate w-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {user.username || "Suggested"}
                            </p>
                        </Link>

                        <button
                            onClick={() => handleFollow(user._id)}
                            className={`w-full mt-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${isDarkMode
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            Follow
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedUsers;
