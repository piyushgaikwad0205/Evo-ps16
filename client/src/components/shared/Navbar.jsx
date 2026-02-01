import React, { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAction } from "../../redux/actions/authActions";
import { useTheme } from "../../contexts/ThemeContext";
import { getAvatarUrl, handleImageError } from "../../utils/imageUtils";
import Search from "./Search";
import { Transition } from "@headlessui/react";
import { AiOutlineBars } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { HiOutlineSun, HiOutlineMoon, HiOutlineFire, HiOutlineChatBubbleLeftRight, HiOutlineBell, HiOutlineUser, HiArrowRightOnRectangle, HiOutlineSparkles, HiOutlineTrash, HiOutlineCheck, HiOutlineHeart } from "react-icons/hi2";
import CampusLogo from "../../assets/Campus-Connects.png";
import { API, MESSAGES_API } from "../../redux/api/utils";
import { getMyNotifications } from "../../redux/api/userAPI";
import { useFollowRequests, useRespondToRequest } from "../../hooks/useFollow";
import FollowButton from "./FollowButton";

const Navbar = ({ userData, toggleLeftbar, showLeftbar }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false); // Can likely deprecate this if replacing with Heart icon, but keeping for safety
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showStreakTooltip, setShowStreakTooltip] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [messageUnread, setMessageUnread] = useState(0);

  // Follow Requests
  const { data: followRequests } = useFollowRequests();
  const respondMutation = useRespondToRequest();

  const handleRespond = async (requestId, action, e) => {
    e.stopPropagation();
    try {
      await respondMutation.mutateAsync({ requestId, action });
    } catch (error) {
      console.error(error);
    }
  };

  const sseRef = useRef(null);
  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const activityDropdownRef = useRef(null);
  const streakTooltipRef = useRef(null);

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/users/me/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (notifUnread > 0) setNotifUnread(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleReadNotif = async (notif, e) => {
    e.stopPropagation();
    if (!notif.isRead) {
      try {
        await API.patch(`/users/me/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setNotifUnread(prev => Math.max(0, prev - 1));
      } catch (err) { }
    }
    // Navigate if link exists (e.g. to post) - logic can be added here
    setShowNotifDropdown(false);
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const logout = async () => {
    setLoggingOut(true);
    await dispatch(logoutAction());
    setLoggingOut(false);
  };

  // Close all dropdowns/tooltips on navigation
  useEffect(() => {
    setShowDropdown(false);
    setShowStreakTooltip(false);
    setShowActivityDropdown(false);
  }, [location.pathname]);

  // Close dropdown and streak tooltip on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const outsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const outsideNotifDropdown = notifDropdownRef.current && !notifDropdownRef.current.contains(event.target);
      const outsideActivityDropdown = activityDropdownRef.current && !activityDropdownRef.current.contains(event.target);
      const outsideStreakTooltip = streakTooltipRef.current && !streakTooltipRef.current.contains(event.target);

      if (outsideDropdown) setShowDropdown(false);
      if (outsideNotifDropdown) setShowNotifDropdown(false);
      if (outsideActivityDropdown) setShowActivityDropdown(false);
      if (outsideStreakTooltip) setShowStreakTooltip(false);
    };

    const handleScroll = () => {
      if (showDropdown) setShowDropdown(false);
      if (showNotifDropdown) setShowNotifDropdown(false);
      if (showActivityDropdown) setShowActivityDropdown(false);
      if (showStreakTooltip) setShowStreakTooltip(false);
    };

    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showDropdown, showNotifDropdown, showActivityDropdown, showStreakTooltip]);

  // Subscribe to notifications/events stream for live updates
  useEffect(() => {
    try {
      if (sseRef.current) { try { sseRef.current.close(); } catch { } }
      const base = process.env.REACT_APP_API_URL || '';
      const token = JSON.parse(localStorage.getItem('profile') || '{}')?.accessToken;
      const url = `${base}/users/me/notifications/stream?token=${encodeURIComponent(token || '')}`;
      const es = new EventSource(url, { withCredentials: true });
      sseRef.current = es;
      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data || '{}');
          if (payload?.type === 'story_like') {
            setNotifications(prev => [{ _id: `${payload.storyId}:${Date.now()}`, message: `Your story received a ${payload.liked ? 'like' : 'unlike'}.`, createdAt: new Date().toISOString() }, ...prev].slice(0, 20));
            setNotifUnread((n) => n + 1);
          }
          if (payload?.type === 'admin_announcement') {
            setNotifications(prev => [{ _id: `admin:${Date.now()}`, message: payload.message || 'Admin announcement', createdAt: new Date().toISOString() }, ...prev].slice(0, 20));
            setNotifUnread((n) => n + 1);
          }
          if (payload?.type === 'message' && payload.message) {
            const msg = payload.message;
            setConversations(prev => {
              const next = prev.map(c => c._id === String(msg.conversation) ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt } : c);
              return next;
            });
            setMessageUnread((n) => n + 1);
          }
        } catch { }
      };
      es.onerror = () => { };
    } catch { }
    return () => { if (sseRef.current) { try { sseRef.current.close(); } catch { } sseRef.current = null; } };
  }, []);

  // Preload notifications and messages on mount
  useEffect(() => {
    let intervalId;
    const loadData = async () => {
      try {
        const { data } = await getMyNotifications();
        let notifs = [];
        // Ensure notifications is always an array
        if (data) {
          if (Array.isArray(data)) {
            notifs = data;
          } else if (data.notifications && Array.isArray(data.notifications)) {
            notifs = data.notifications;
          } else if (data.data && Array.isArray(data.data)) {
            notifs = data.data;
          }
        }
        setNotifications(notifs);

        // Calculate unread count manually to be safe
        const unread = notifs.filter(n => !n.isRead).length;
        setNotifUnread(unread);

        const res = await MESSAGES_API.get("/conversations");
        setConversations(res.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setNotifications([]);
      }
    };
    loadData();
    intervalId = setInterval(loadData, 5000); // 5 seconds for near real-time feel
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white/5 dark:border-white/5 shadow-sm transition-colors duration-200 rounded-b-3xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
              onClick={toggleLeftbar}
            >
              {showLeftbar ? <RxCross1 size={20} /> : <AiOutlineBars size={20} />}
            </button>

            <Link to="/home" className="ml-2 lg:ml-0">
              <img className="h-10 sm:h-12 w-auto" src={CampusLogo} alt="Campus Connects" />
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-5xl mx-8">
            <Search />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 flex-nowrap whitespace-nowrap">
            {/* Login Streak */}
            <div className="relative" ref={streakTooltipRef}>
              <button
                type="button"
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStreakTooltip(!showStreakTooltip);
                }}
              >
                <HiOutlineFire size={20} className={`${(userData?.loginStreakCount || 0) > 0 ? 'text-orange-500' : ''}`} />
                {Number(userData?.loginStreakCount || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-orange-500 text-white text-[10px] leading-4 rounded-full flex items-center justify-center">
                    {userData?.loginStreakCount}
                  </span>
                )}
              </button>

              {/* Streak Tooltip */}
              <Transition
                show={showStreakTooltip}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                className="absolute right-0 mt-2 w-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-white/20 dark:border-gray-700 p-2"
              >
                <div className="text-center">
                  <p className="text-[9px] text-gray-600 dark:text-gray-400 font-medium mb-0.5">Next streak in</p>
                  <p className="text-[10px] font-bold text-orange-500">
                    {(() => {
                      const now = new Date();
                      const midnight = new Date();
                      midnight.setHours(24, 0, 0, 0);
                      const diff = midnight - now;
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      return `${hours}h ${minutes}m`;
                    })()}
                  </p>
                </div>
              </Transition>
            </div>


            {/* Activity Feed */}
            <div className="relative" ref={activityDropdownRef}>
              <button
                type="button"
                className={`p-2 rounded-full transition-all duration-300 relative ${(notifUnread + (followRequests?.length || 0)) > 0
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-lg shadow-red-500/30"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  const isOpening = !showActivityDropdown;
                  setShowActivityDropdown(isOpening);

                  if (isOpening) {
                    setShowDropdown(false);
                    setShowStreakTooltip(false);

                    // Optimistically clear count
                    setNotifUnread(0);
                    // Optional: Mark all as read on backend if you want the count to stay 0 permanently
                    if (notifUnread > 0) {
                      API.patch('/users/me/notifications/read-all').catch(() => { });
                      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    }
                  }
                }}
              >
                <HiOutlineHeart
                  size={24}
                  className={`transition-transform duration-300 ${(notifUnread + (followRequests?.length || 0)) > 0 ? "scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : ""}`}
                />
                {(notifUnread + (followRequests?.length || 0)) > 0 && (
                  <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-red-600 text-white text-[10px] font-bold leading-4 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-pulse">
                    {notifUnread + (followRequests?.length || 0)}
                  </span>
                )}
              </button>

              <Transition
                show={showActivityDropdown}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 translate-y-2"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-2"
                className="absolute right-0 mt-3 w-96 bg-white dark:bg-black/95 backdrop-blur-3xl rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden"
              >
                <div className="flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Activity</h3>
                    {followRequests?.length > 0 && (
                      <Link to="/follow-requests" onClick={() => setShowActivityDropdown(false)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        View all requests
                      </Link>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
                    {/* Follow Requests Section */}
                    {followRequests?.length > 0 && (
                      <div className="p-4 border-b border-gray-100 dark:border-white/10">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Follow requests</h4>
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{followRequests.length}</span>
                        </div>
                        <div className="space-y-4">
                          {followRequests.slice(0, 3).map(req => (
                            <div key={req._id} className="flex items-center justify-between gap-3">
                              <Link to={`/user/${req.requester._id}`} onClick={() => setShowActivityDropdown(false)} className="flex items-center gap-3 flex-1 min-w-0 group">
                                <img src={getAvatarUrl(req.requester.avatar)} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-white/10 shadow-sm" alt="" />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                                    {req.requester.username}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{req.requester.name}</p>
                                </div>
                              </Link>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={(e) => handleRespond(req._id, 'accept', e)}
                                  disabled={respondMutation.isLoading}
                                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={(e) => handleRespond(req._id, 'reject', e)}
                                  disabled={respondMutation.isLoading}
                                  className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 text-xs rounded-full font-semibold transition-all active:scale-95"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notifications Feed */}
                    <div className="p-2">
                      {/* Filter: Exclude 'request' type notifications (handled in top section) AND show only unread or recent? 
                           User said "clear ho jaye" (clear on view), so let's show only Unread for a clean "New Activity" view.
                           Or maybe show recent ones? 
                           Let's filter out 'request' content and rely on 'isRead' for highlighting, 
                           but if user wants "clear", maybe we hide read ones? 
                           Let's try showing only Unread + recent (last 24h)? 
                           Actually, standard UX is detailed history. 
                           But user asked "view hone pr activit clear ho jaye". 
                           I will filter to show ONLY !isRead items. This is aggressive but matches requests.
                           Wait, if I mark all read on Open, they will disappear instantly?
                           That's bad. 
                           I should mark them read *on Close* or *on Click*.
                           I am strictly marking read on Open.
                           So if I filter !isRead, they vanish.
                           Let's reverts to: Show all, but remove duplicate "Requests".
                           And for "Clear", maybe just the *badge* clear (which I did).
                           Let's assume "Clear" = Badge clear.
                           Remove the "Duplicate Request" Notification.
                       */}
                      {notifications.some(n => ['like', 'follow', 'post'].includes(n.type) && !n.content?.includes('requested')) ? (
                        <div className="space-y-1">
                          {notifications
                            .filter(n => ['like', 'follow', 'post'].includes(n.type))
                            .filter(n => !n.content?.includes('requested')) // Remove duplicates of pending requests
                            .map(notif => (
                              <div key={notif._id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors group relative cursor-pointer ${notif.isRead ? 'opacity-70 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-white/5' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`} onClick={(e) => !notif.isRead ? handleReadNotif(notif, e) : null}>
                                {/* Avatar */}
                                <div className="shrink-0 relative pt-1">
                                  <Link to={notif.sender?._id ? `/user/${notif.sender._id}` : '#'} onClick={(e) => { e.stopPropagation(); setShowActivityDropdown(false); }}>
                                    <img
                                      src={getAvatarUrl(notif.sender?.avatar || notif.senderAvatar)}
                                      className="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-white/10"
                                      alt=""
                                    />
                                  </Link>
                                  {(notif.type === 'like') && (
                                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-red-500 to-pink-500 text-white rounded-full p-1 border-2 border-white dark:border-black shadow-sm">
                                      <HiOutlineHeart size={10} className="fill-current" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <div className="text-sm leading-snug">
                                    <Link to={notif.sender?._id ? `/user/${notif.sender._id}` : '#'} className="font-bold text-gray-900 dark:text-white hover:underline mr-1" onClick={(e) => { e.stopPropagation(); setShowActivityDropdown(false); }}>
                                      {notif.sender?.username || "Someone"}
                                    </Link>
                                    <span className="text-gray-600 dark:text-gray-300">
                                      {notif.type === 'like' && 'liked your post.'}
                                      {notif.type === 'follow' && 'started following you.'}
                                      {notif.type === 'post' && 'posted something new.'}
                                      {!['like', 'follow', 'post'].includes(notif.type) && (notif.content || 'interacted with you.')}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                    {new Date(notif.createdAt) > new Date(Date.now() - 86400000)
                                      ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      : new Date(notif.createdAt).toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Action - Right Aligned */}
                                <div className="shrink-0 flex items-center self-center pl-2">
                                  {notif.type === 'post' && notif.image && (
                                    <img src={notif.image} className="w-11 h-11 rounded-lg object-cover shadow-sm" alt="Post" />
                                  )}

                                  {/* Follow Button */}
                                  {notif.type === 'follow' && notif.sender?._id && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <FollowButton
                                        targetUserId={notif.sender._id}
                                        className="h-8 px-4 text-xs font-semibold rounded-lg shadow-sm"
                                      />
                                    </div>
                                  )}

                                  {/* Unread Indicator (if no action button) */}
                                  {!notif.isRead && notif.type !== 'follow' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
                            <HiOutlineHeart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                          </div>
                          <p className="text-gray-900 dark:text-white font-semibold">Activity on your posts</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">When someone likes or follows you, you'll see it here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Transition>
            </div>


            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors relative"
              >
                <div className="relative">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={getAvatarUrl(userData?.avatar)}
                    alt="Profile"
                    loading="lazy"
                    onError={(e) => handleImageError(e, 'avatar')}
                  />
                  {/* Unread Indicator */}
                  {(messageUnread + notifUnread) > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-bg-secondary"></span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-dark-text">
                  {userData?.username ? `@${userData.username}` : (userData?.name || "User")}
                </span>
              </button>

              <Transition
                show={showDropdown}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                className="absolute right-0 mt-2 w-64 bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-white/20 dark:border-gray-700"
              >
                <div className="py-1">
                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="flex items-center">
                      <HiOutlineBell className="mr-3 h-5 w-5 text-gray-400" />
                      Notifications
                    </div>
                    {notifUnread > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">{notifUnread}</span>
                    )}
                  </Link>

                  <div className="border-t border-gray-100 dark:border-dark-border my-1"></div>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                  >
                    <div className="flex items-center">
                      {theme === 'light' ? (
                        <>
                          <HiOutlineMoon className="mr-3 h-5 w-5 text-blue-500" />
                          <span>Dark Mode</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineSun className="mr-3 h-5 w-5 text-yellow-500" />
                          <span>Light Mode</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <HiOutlineUser className="mr-3 h-5 w-5 text-gray-400" />
                    Your Profile
                  </Link>

                  <div className="border-t border-gray-100 dark:border-dark-border my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    disabled={loggingOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary disabled:opacity-50 transition-colors"
                  >
                    <HiArrowRightOnRectangle className="mr-3 h-5 w-5" />
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </nav >
  );
};

export default memo(Navbar);