import { memo, useMemo, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import Post from "../post/Post";
import CommonLoading from "../loader/CommonLoading";
import Home from "../../assets/home.jpg";
import StoryFeed from "../story/StoryFeed";
import eventService from "../../services/eventService";
import { Plus } from "lucide-react";
import EventRegistrationModal from "../events/EventRegistrationModal";
import { useTheme } from "../../contexts/ThemeContext";
import SuggestedUsers from "./SuggestedUsers";
import { useFeed, useColleges } from "../../hooks/useApi";
import useAppStore from "../../store/useAppStore";
import { Filter } from "lucide-react";

const MemoizedPost = memo(Post);

const LoadMoreButton = ({ onClick, isLoading, isDarkMode }) => (
  <button
    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isDarkMode
      ? "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white hover:opacity-90"
      : "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white hover:opacity-90"
      }`}
    onClick={onClick}
    disabled={isLoading}
  >
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Loading...
      </span>
    ) : (
      "Load More Posts"
    )}
  </button>
);

const MainSection = ({ userData }) => {
  const { accessToken } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const { isDarkMode } = useTheme();

  // Feed Tabs
  const [activeTab, setActiveTab] = useState("following"); // 'following' | 'all' | 'college'
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);

  // Zustand Store
  const { feedPosts, setFeedPosts } = useAppStore();

  const { data: colleges } = useColleges();

  // React Query Hook
  const {
    data,
    isLoading: isFeedLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useFeed(activeTab, activeTab === 'college' ? selectedCollegeId : null);

  // Sync React Query data to Zustand store
  useEffect(() => {
    if (data?.pages) {
      const allPosts = data.pages.flatMap(page => page?.posts || []);
      setFeedPosts(allPosts);
    }
  }, [data, setFeedPosts]);

  // Combine cached data with fresh data
  const posts = useMemo(() => {
    if (data?.pages) {
      return data.pages.flatMap(page => page?.posts || []);
    }
    return feedPosts;
  }, [data, feedPosts]);

  useEffect(() => {
    if (userData && accessToken) {
      // Fetch user's registrations and events in parallel
      Promise.all([
        eventService.getUserRegistrations(accessToken),
        eventService.getEvents()
      ])
        .then(([registrations, allEvents]) => {
          const registeredIds = new Set(registrations.map(r => r.event?._id || r.event));
          setRegisteredEventIds(registeredIds);

          // Filter out events user has already registered for
          const unregisteredEvents = allEvents.filter(event => !registeredIds.has(event._id));
          setEvents(unregisteredEvents);
        })
        .catch(err => console.error("Failed to fetch events", err));
    }
  }, [userData, accessToken]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const memoizedPosts = useMemo(() => {
    const items = [];
    posts.forEach((post, index) => {
      items.push(<MemoizedPost key={post._id} post={post} />);

      // Insert SuggestedUsers after every 10 posts (index 9, 19, 29...)
      if ((index + 1) % 10 === 0 && index !== posts.length - 1) {
        items.push(<SuggestedUsers key={`suggested-${index}`} userData={userData} />);
      }
    });
    return items;
  }, [posts, userData]);

  const handleRegistrationSuccess = () => {
    // Refresh events after successful registration
    if (accessToken) {
      Promise.all([
        eventService.getUserRegistrations(accessToken),
        eventService.getEvents()
      ])
        .then(([registrations, allEvents]) => {
          const registeredIds = new Set(registrations.map(r => r.event?._id || r.event));
          setRegisteredEventIds(registeredIds);
          const unregisteredEvents = allEvents.filter(event => !registeredIds.has(event._id));
          setEvents(unregisteredEvents);
        })
        .catch(err => console.error("Failed to refresh events", err));
    }
  };

  // Only show loading if we have NO posts and are loading
  if (isFeedLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0">
      {/* Story Feed */}
      <div>
        <StoryFeed />
      </div>

      {/* Featured Events Section - Flat Instagram Style */}
      {events.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Suggested Events
            </h3>
            <button
              onClick={() => setEvents([])}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Dismiss
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex flex-col items-center space-y-1 cursor-pointer min-w-[70px]"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="w-16 h-16 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500">
                  <div className="bg-white dark:bg-black rounded-xl p-[2px] w-full h-full">
                    <img
                      src={event.bannerUrl || "https://via.placeholder.com/150"}
                      alt={event.title}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium text-center w-20 truncate ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Success Story button for alumni */}
      {userData?.role === "alumni" && (
        <div className="mb-6 px-2">
          <Link
            to="/success-stories/create"
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${isDarkMode
              ? "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white"
              : "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white"
              }`}
          >
            <Plus size={18} />
            Share Your Success Story
          </Link>
        </div>
      )}

      {/* Feed Tabs */}
      <div className="sticky top-[60px] z-10 bg-white dark:bg-black pt-2 pb-0">
        <div className="flex border-b mb-2 dark:border-white/10">
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors relative ${activeTab === "following"
              ? isDarkMode ? "text-white" : "text-gray-900"
              : isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            My Feed
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("college")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors relative ${activeTab === "college"
              ? isDarkMode ? "text-white" : "text-gray-900"
              : isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            College
            {activeTab === "college" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500" />
            )}
          </button>
        </div>

        {/* College Filter Dropdown */}
        {activeTab === "college" && (
          <div className="px-2 mb-4">
            <div className={`relative flex items-center rounded-xl overflow-hidden border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="pl-3 pr-2 text-gray-500">
                <Filter size={16} />
              </div>
              <select
                value={selectedCollegeId || ""}
                onChange={(e) => setSelectedCollegeId(e.target.value || null)}
                className={`w-full py-2.5 bg-transparent text-sm font-medium outline-none cursor-pointer appearance-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                <option value="" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>My College</option>
                {colleges && colleges.map(college => (
                  <option key={college._id} value={college._id} className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {memoizedPosts}
      </div>

      {hasNextPage && (
        <div className="mt-4 px-2">
          <LoadMoreButton
            onClick={handleLoadMore}
            isLoading={isFetchingNextPage}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {posts.length === 0 && !isFeedLoading && (
        <div className="text-center flex justify-center items-center flex-col py-12">
          <img loading="lazy" src={Home} alt="no post" className="w-48 h-48 object-cover rounded-full mb-6 opacity-80" />
          <p className={`font-semibold text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            No posts yet
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
            Join a community and start the conversation!
          </p>
        </div>
      )}

      <AnimatePresence>
        {selectedEvent && (
          <EventRegistrationModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainSection;
