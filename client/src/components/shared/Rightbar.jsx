import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getNotJoinedCommunitiesAction } from "../../redux/actions/communityActions";
import {
  getPublicUsersAction,
  followUserAndFetchData,
} from "../../redux/actions/userActions";
import { Link, useLocation, useNavigate } from "react-router-dom";
import JoinModal from "../modals/JoinModal";
import { BsPersonPlusFill } from "react-icons/bs";
import { IoIosPeople, IoMdPeople } from "react-icons/io";
import placeholder from "../../assets/placeholder.png";
import { useTheme } from "../../contexts/ThemeContext";
import { HiOutlineSparkles, HiOutlineUserGroup, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { MESSAGES_API } from "../../redux/api/utils";

const Rightbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [joinModalVisibility, setJoinModalVisibility] = useState({});
  const [notJoinedCommunitiesFetched, setNotJoinedCommunitiesFetched] =
    useState(false);
  const [publicUsersFetched, setPublicUsersFetched] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [conversationsWithUnread, setConversationsWithUnread] = useState([]);

  const currentUser = useSelector((state) => state.auth?.userData);
  const recommendedUsers = useSelector((state) => state.user?.publicUsers);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getNotJoinedCommunitiesAction());
      setNotJoinedCommunitiesFetched(true);
      await dispatch(getPublicUsersAction());
    };

    fetchData().then(() => {
      setPublicUsersFetched(true);
    });
  }, [dispatch]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const { data } = await MESSAGES_API.get('/conversations');
        const conversations = data || [];

        // Calculate total unread count
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setTotalUnreadMessages(totalUnread);

        // Store conversations with unread messages for avatar indicators
        const unreadConvs = conversations
          .filter(conv => conv.unreadCount > 0)
          .map(conv => {
            // Get the other participant
            const otherParticipant = conv.participants?.find(p => p._id !== currentUser?._id);
            return otherParticipant?._id;
          })
          .filter(Boolean);

        setConversationsWithUnread(unreadConvs);
      } catch (error) {
        console.error('Failed to fetch unread messages:', error);
      }
    };

    if (currentUser) {
      fetchUnreadMessages();
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchUnreadMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const notJoinedCommunities = useSelector(
    (state) => state.community?.notJoinedCommunities
  );

  const [visibleCommunities, remainingCount] = useMemo(() => {
    const visibleCommunities = notJoinedCommunities?.slice(0, 3) || [];
    const remainingCount = Math.max((notJoinedCommunities?.length || 0) - 3, 0);
    return [visibleCommunities, remainingCount];
  }, [notJoinedCommunities]);

  const [followLoading, setFollowLoadingState] = useState({});

  const followUserHandler = useCallback(
    async (toFollowId) => {
      setFollowLoadingState((prevState) => ({
        ...prevState,
        [toFollowId]: true,
      }));

      await dispatch(followUserAndFetchData(toFollowId, currentUser));

      setFollowLoadingState((prevState) => ({
        ...prevState,
        [toFollowId]: false,
      }));

      navigate(`/user/${toFollowId}`);
    },
    [dispatch, currentUser, navigate]
  );

  const toggleJoinModal = useCallback((communityId, visible) => {
    setJoinModalVisibility((prev) => ({
      ...prev,
      [communityId]: visible,
    }));
  }, []);

  const currentLocation = useLocation().pathname;

  return (
    <div className="hidden xl:block w-80 h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto custom-scrollbar pr-2 bg-white dark:bg-transparent">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <HiOutlineUserGroup className="text-blue-500" />
            <h5 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Suggested Communities
            </h5>
          </div>
          {remainingCount > 0 && (
            <Link
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              to="/communities"
            >
              See all ({remainingCount})
            </Link>
          )}
        </div>

        {notJoinedCommunitiesFetched && visibleCommunities.length === 0 && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-center text-sm text-gray-500 dark:text-gray-400 italic">
            No communities to join right now.
          </div>
        )}

        <ul className="space-y-2">
          {visibleCommunities?.map((community) => (
            <li
              key={community._id}
              className="group bg-[#F9F9F9] dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={community.banner || placeholder}
                    className="h-10 w-10 rounded-lg object-cover ring-1 ring-gray-100 dark:ring-white/10"
                    alt="community"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {community.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <IoMdPeople className="text-gray-400" />
                      {community.members.length} members
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleJoinModal(community._id, true)}
                  className="p-2 rounded-full text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  title="Join Community"
                >
                  <IoIosPeople className="text-lg" />
                </button>
              </div>

              <JoinModal
                show={joinModalVisibility[community._id] || false}
                onClose={() => toggleJoinModal(community._id, false)}
                community={community}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="text-yellow-500" />
            <h5 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Who to Follow
            </h5>
          </div>
          {recommendedUsers?.length > 3 && (
            <Link
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              to="/users/discover"
            >
              See all ({recommendedUsers.length - 3})
            </Link>
          )}
        </div>

        {publicUsersFetched && recommendedUsers?.length === 0 && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-center text-sm text-gray-500 dark:text-gray-400 italic">
            No suggestions available.
          </div>
        )}

        <ul className="space-y-2">
          {recommendedUsers?.length > 0 &&
            recommendedUsers.slice(0, 3).map((user) => (
              <li
                key={user._id}
                className="bg-[#F9F9F9] dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-dark-bg"
                      src={user.avatar}
                      alt={user.name}
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/user/${user._id}`}
                        className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:underline decoration-blue-500"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.followerCount} followers
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={followLoading[user._id]}
                    onClick={() => followUserHandler(user._id)}
                    className="p-2 rounded-full text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                    title="Follow"
                  >
                    {followLoading[user._id] ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <BsPersonPlusFill className="text-lg" />
                    )}
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-auto mb-5">
        <button
          onClick={() => navigate('/messages')}
          className="w-full bg-white dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-between group relative"
        >
          {/* Unread Badge - Top Right */}
          {totalUnreadMessages > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-black animate-pulse">
              {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="relative">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Text */}
            <span className="font-semibold text-gray-900 dark:text-white">
              Messages
            </span>
          </div>

          {/* Avatar Stack with Unread Indicators */}
          <div className="flex -space-x-2">
            {[0, 1, 2].map((index) => {
              const user = recommendedUsers?.[index];
              const hasUnread = user && conversationsWithUnread.includes(user._id);

              return (
                <div key={index} className="relative">
                  <img
                    src={user?.avatar || placeholder}
                    alt={`User ${index + 1}`}
                    className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-black object-cover"
                  />
                  {/* Unread Dot Indicator */}
                  {hasUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-black shadow-sm"></div>
                  )}
                </div>
              );
            })}
          </div>
        </button>
      </div>

    </div>
  );
};

export default Rightbar;