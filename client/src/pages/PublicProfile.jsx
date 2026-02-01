import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  getPublicUserAction,
  getPublicUsersAction,
  unfollowUserAction,
  followUserAction,
} from "../redux/actions/userActions";
import PublicPost from "../components/profile/PublicPost";
import { MapPin, Calendar, FileText, Users, User, UserPlus, UserMinus, MessageCircle, Grid, BookOpen } from "lucide-react";
import CommonLoading from "../components/loader/CommonLoading";
import { API } from "../redux/api/utils";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { checkConnectionStatus, sendConnectionRequest, removeConnection } from "../redux/api/connectionAPI";
import FollowButton from "../components/shared/FollowButton";

const PublicProfile = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [followLoading, setFollowLoading] = useState(false);
  const [unfollowLoading, setUnfollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const [connectionStatus, setConnectionStatus] = useState("none"); // none, pending, accepted
  const [connectionId, setConnectionId] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);

  const userData = useSelector((state) => state.auth?.userData);
  const userProfile = useSelector((state) => state.user?.publicUserProfile);
  const isUserFollowing = useSelector((state) => state.user?.isFollowing);
  const isModerator = useSelector(
    (state) => state.auth?.userData?.role === "moderator"
  );

  const publicUserId = location.pathname.split("/")[2];
  const [clubs, setClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(true);

  useEffect(() => {
    dispatch(getPublicUserAction(publicUserId));
  }, [dispatch, isUserFollowing, publicUserId]);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (publicUserId && userData?._id && publicUserId !== userData?._id) {
        const { error, data } = await checkConnectionStatus(publicUserId);
        if (!error) {
          setConnectionStatus(data.status);
          setConnectionId(data.connectionId);
        }
      }
    };
    fetchConnectionStatus();
  }, [publicUserId, userData]);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const res = await API.get("/clubs");
        setClubs(res.data || []);
      } catch { }
      setClubsLoading(false);
    };
    loadClubs();
  }, [publicUserId]);

  useEffect(() => {
    if (publicUserId === userData?._id) {
      navigate("/profile", { replace: true });
    }
  }, [publicUserId, userData, navigate]);

  const handleUnfollow = async (publicUserId) => {
    setUnfollowLoading(true);
    await dispatch(unfollowUserAction(publicUserId));
    await dispatch(getPublicUsersAction());
    setUnfollowLoading(false);
  };

  const handleFollow = async (publicUserId) => {
    setFollowLoading(true);
    await dispatch(followUserAction(publicUserId));
    await dispatch(getPublicUsersAction());
    setFollowLoading(false);
  };

  const handleConnect = async () => {
    setConnectionLoading(true);
    const { error, data } = await sendConnectionRequest({ recipientId: publicUserId });
    if (!error) {
      setConnectionStatus("pending");
      setConnectionId(data.connection._id);
    }
    setConnectionLoading(false);
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to remove this connection?")) return;
    setConnectionLoading(true);
    const { error } = await removeConnection(connectionId);
    if (!error) {
      setConnectionStatus("none");
      setConnectionId(null);
    }
    setConnectionLoading(false);
  };

  const handleMessage = () => {
    navigate("/messages", { state: { selectedUser: userProfile } });
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CommonLoading />
      </div>
    );
  }

  const {
    name,
    avatar,
    location: userLocation,
    bio,
    role,
    interests,
    totalPosts,
    totalCommunities,
    joinedOn,
    totalFollowers,
    totalFollowing,
    isFollowing,
    followingSince,
    postsLast30Days,
    commonCommunities,
  } = userProfile;

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`rounded-2xl overflow-hidden mb-6 ${isDarkMode
            ? "bg-dark-bg-secondary border border-white/10"
            : "bg-white border border-gray-200"
            } shadow-lg`}
        >
          {/* Cover/Header Section */}
          <div className={`h-32 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 relative`}>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Info Section */}
          <div className="px-6 pb-6">
            {/* Avatar & Action Buttons */}
            <div className="flex items-end justify-between -mt-16 mb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-bg-secondary overflow-hidden bg-white dark:bg-dark-bg shadow-xl">
                  <img
                    className="w-full h-full object-cover"
                    src={avatar}
                    alt={name}
                    loading="lazy"
                  />
                </div>
                {role === "moderator" && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    MOD
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}


              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex gap-2 mb-2"
              >
                {!isModerator && (
                  <>
                    <FollowButton targetUserId={publicUserId} />

                    <button
                      onClick={handleMessage}
                      disabled={connectionStatus !== "accepted"}
                      title={connectionStatus !== "accepted" ? "Connect to message" : ""}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${isDarkMode
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                        } ${connectionStatus !== "accepted" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <MessageCircle size={18} />
                      <span>Message</span>
                    </button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Name & Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mb-4"
            >
              <h1 className={`text-2xl font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {name}
              </h1>
              {userLocation && (
                <p className={`flex items-center gap-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <MapPin size={16} />
                  {userLocation}
                </p>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-white/10"
            >
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {totalPosts}
                </div>
                <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Posts
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {totalFollowers}
                </div>
                <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Followers
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {totalFollowing}
                </div>
                <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Following
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {totalCommunities}
                </div>
                <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Communities
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            {bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="mb-6"
              >
                <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {bio}
                </p>
              </motion.div>
            )}

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="space-y-3 mb-6"
            >
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <Calendar size={16} />
                <span>Joined {joinedOn}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <FileText size={16} />
                <span>{postsLast30Days} {postsLast30Days === 1 ? "post" : "posts"} in last 30 days</span>
              </div>
              {isFollowing && followingSince && (
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <Users size={16} />
                  <span>Following since {followingSince}</span>
                </div>
              )}
            </motion.div>

            {/* Common Communities */}
            {commonCommunities?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                className={`p-4 rounded-xl mb-6 ${isDarkMode ? "bg-white/5" : "bg-gray-50"
                  }`}
              >
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Users size={16} className="inline mr-2" />
                  You both are members of{" "}
                  {commonCommunities.slice(0, 1).map((c) => (
                    <Fragment key={c._id}>
                      <Link
                        className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                        to={`/community/${c.name}`}
                      >
                        {c.name}
                      </Link>
                    </Fragment>
                  ))}
                  {commonCommunities.length > 1 && (
                    <span className="text-gray-500">
                      {" "}and {commonCommunities.length - 1} other{" "}
                      {commonCommunities.length - 1 === 1 ? "community" : "communities"}
                    </span>
                  )}
                </p>
              </motion.div>
            )}

            {/* Interests */}
            {interests && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <BookOpen size={16} className="inline mr-2" />
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interests.split(",").map((interest, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${isDarkMode
                        ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-gradient-to-r from-orange-100 via-red-50 to-yellow-100 text-orange-700 border border-orange-200"
                        }`}
                    >
                      {interest.trim()}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`rounded-2xl overflow-hidden mb-6 ${isDarkMode
            ? "bg-dark-bg-secondary border border-white/10"
            : "bg-white border border-gray-200"
            } shadow-lg`}
        >
          <div className="flex border-b border-gray-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-300 ${activeTab === "posts"
                ? isDarkMode
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-orange-600 border-b-2 border-orange-600"
                : isDarkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <Grid size={18} />
              <span>Posts</span>
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-300 ${activeTab === "clubs"
                ? isDarkMode
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-orange-600 border-b-2 border-orange-600"
                : isDarkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <Users size={18} />
              <span>Clubs</span>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isUserFollowing ? (
                <PublicPost publicUserId={publicUserId} />
              ) : (
                <div className={`rounded-2xl p-12 text-center ${isDarkMode
                  ? "bg-dark-bg-secondary border border-white/10"
                  : "bg-white border border-gray-200"
                  } shadow-lg`}>
                  <User size={48} className={`mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Follow to see posts
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Follow {name} to see their posts and updates
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "clubs" && (
            <motion.div
              key="clubs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-6 ${isDarkMode
                ? "bg-dark-bg-secondary border border-white/10"
                : "bg-white border border-gray-200"
                } shadow-lg`}
            >
              {clubsLoading ? (
                <div className="flex justify-center py-12">
                  <CommonLoading />
                </div>
              ) : clubs.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className={`mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    No clubs available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clubs.slice(0, 6).map((club) => (
                    <motion.div
                      key={club._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:scale-105 ${isDarkMode
                        ? "bg-white/5 hover:bg-white/10"
                        : "bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex-shrink-0">
                        {club.banner ? (
                          <img
                            src={club.banner}
                            alt={club.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Users size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {club.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {club.members?.length || 0} members
                        </p>
                      </div>
                      <Link
                        to={`/clubs/${club._id}`}
                        className="text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors"
                      >
                        View
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
              {clubs.length > 6 && (
                <div className="mt-6 text-center">
                  <Link
                    to="/clubs"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white hover:opacity-90"
                  >
                    View All Clubs
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PublicProfile;
