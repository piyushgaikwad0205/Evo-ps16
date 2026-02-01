import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { followUserAndFetchData } from "../../redux/actions/userActions";
import { useTheme } from "../../contexts/ThemeContext";
import { Users, UserPlus, UserCheck, MessageCircle } from "lucide-react";

const UserCard = ({ user }) => {
    const [followLoading, setFollowLoading] = useState(false);
    const { isDarkMode } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector((state) => state.auth?.userData);

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setFollowLoading(true);
        await dispatch(followUserAndFetchData(user._id, currentUser));
        setFollowLoading(false);
    };

    const handleMessage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/messages', { state: { selectedUser: user } });
    };

    return (
        <Link
            to={`/user/${user._id}`}
            className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isDarkMode
                    ? "bg-dark-bg-secondary border-white/10 hover:border-orange-500/40 hover:shadow-orange-500/10"
                    : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-orange-500/10"
                }`}
        >
            {/* Avatar Section with Gradient Background */}
            <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500">
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        className="w-20 h-20 rounded-full object-cover shadow-2xl ring-4 ring-white dark:ring-dark-bg-secondary group-hover:scale-110 transition-transform duration-500"
                        src={user.avatar}
                        alt={user.name}
                        loading="lazy"
                    />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                {/* User Name */}
                <h4 className={`text-lg font-bold mb-1 text-center line-clamp-1 ${isDarkMode
                        ? "text-white group-hover:text-orange-400"
                        : "text-gray-900 group-hover:text-orange-600"
                    } transition-colors`}>
                    {user.name}
                </h4>

                {/* User Role/Department */}
                {(user.role || user.department) && (
                    <p className={`text-xs text-center mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {user.role && <span className="capitalize">{user.role}</span>}
                        {user.role && user.department && <span> • </span>}
                        {user.department && <span>{user.department}</span>}
                    </p>
                )}

                {/* Followers Count */}
                <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg mb-3 ${isDarkMode
                        ? "bg-white/5 border border-white/10"
                        : "bg-gray-100 border border-gray-200"
                    }`}>
                    <Users className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                    <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {user.followerCount || 0}
                    </span>
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {user.followerCount === 1 ? 'follower' : 'followers'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${isDarkMode
                                ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 border-2 border-orange-500/30 hover:border-orange-500/50 text-orange-400"
                                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {followLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Follow
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleMessage}
                        className={`p-2.5 rounded-lg transition-all ${isDarkMode
                                ? "bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-orange-500/40 text-gray-400 hover:text-orange-400"
                                : "bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 hover:border-orange-300 text-gray-600 hover:text-orange-600"
                            }`}
                        title="Send Message"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
    );
};

export default UserCard;
