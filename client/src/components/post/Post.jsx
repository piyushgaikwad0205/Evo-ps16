import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PrefetchLink from "../shared/PrefetchLink";
import { PhotoProvider, PhotoView } from "react-photo-view";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share2,
  Maximize,
  Flag,
  Trash2,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DeleteModal from "../modals/DeleteModal";
import CommentsModal from "../modals/CommentsModal";
import ShareModal from "../modals/ShareModal";
import { likePostAction, unlikePostAction, savePostAction, unsavePostAction } from "../../redux/actions/postActions";
import "react-photo-view/dist/react-photo-view.css";
import { useTheme } from "../../contexts/ThemeContext";
import OnlineIndicator from "../shared/OnlineIndicator";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Post = ({ post }) => {
  // Destructure post properties
  const { _id, user, content, fileUrl, fileType, likes, comments, createdAt, community } = post;

  // Debug logging
  console.log('Post component - createdAt:', createdAt, 'type:', typeof createdAt, 'postId:', _id);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth?.userData);
  const { isDarkMode } = useTheme();

  // State declarations
  const savedPosts = useSelector((state) => state.posts?.savedPosts);

  const checkIsSaved = () => {
    // 1. Check in posts slice (most up-to-date if available)
    if (savedPosts && savedPosts.length > 0) {
      return savedPosts.some(p => (p._id || p) === _id);
    }
    // 2. Fallback to auth slice (initial load)
    if (userData?.savedPosts) {
      return userData.savedPosts.some(p => (typeof p === 'object' ? p._id : p) === _id);
    }
    return false;
  };

  const [isLiked, setIsLiked] = useState(likes?.includes(userData?._id));
  const [likeCount, setLikeCount] = useState(likes?.length || 0);
  const [isSaved, setIsSaved] = useState(checkIsSaved());

  // Sync isSaved with store updates
  useEffect(() => {
    setIsSaved(checkIsSaved());
  }, [savedPosts, userData, _id]);

  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const lastTap = useRef(0);
  const videoRef = useRef(null);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      if (newLikedState) {
        await dispatch(likePostAction(_id));
      } else {
        await dispatch(unlikePostAction(_id));
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikeCount(prev => !newLikedState ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      if (newSavedState) {
        await dispatch(savePostAction(_id));
      } else {
        await dispatch(unsavePostAction(_id));
      }
    } catch (error) {
      // Revert on error
      setIsSaved(!newSavedState);
    }
  };

  const enterFullscreen = () => {
    if (fileType === 'image') {
      const img = document.getElementById(`post-img-${_id}`);
      if (img) {
        if (img.requestFullscreen) img.requestFullscreen();
        else if (img.webkitRequestFullscreen) img.webkitRequestFullscreen();
        else if (img.msRequestFullscreen) img.msRequestFullscreen();
      }
    } else if (fileUrl) {
      const video = videoRef.current;
      if (video) {
        // Change to object-contain for fullscreen to show actual dimensions
        video.style.objectFit = 'contain';

        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }

        // Listen for fullscreen exit to restore object-cover
        const handleFullscreenChange = () => {
          if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            video.style.objectFit = 'cover';
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
          }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      }
    }
  };

  const handleMediaInteraction = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    const isDoubleTap = now - lastTap.current < DOUBLE_TAP_DELAY;
    lastTap.current = now;

    if (fileType === 'image') {
      if (isDoubleTap) {
        if (!isLiked) {
          handleLike();
        }
        setShowHeartOverlay(true);
        setTimeout(() => setShowHeartOverlay(false), 1000);
      }
    } else if (fileUrl) {
      // Video Logic
      if (isDoubleTap) {
        enterFullscreen();
      } else {
        // Toggle mute and show icon
        setIsMuted(prev => !prev);
        setShowMuteIcon(true);
        setTimeout(() => setShowMuteIcon(false), 800);
      }
    }
  };

  const toggleModal = (value) => {
    setShowModal(value);
  };

  return (
    <div className="w-full mb-6 relative group rounded-3xl overflow-hidden shadow-lg bg-black">
      {/* Media Layer */}
      <div
        className="relative w-full aspect-[4/5] md:aspect-square overflow-hidden bg-black"
        onClick={handleMediaInteraction}
      >
        {fileUrl && fileType === "image" ? (
          <div className="relative w-full h-full">
            <img
              id={`post-img-${_id}`}
              src={fileUrl}
              alt={content}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <AnimatePresence>
              {showHeartOverlay && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <Heart size={100} className="fill-white text-white drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : fileUrl ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={fileUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              crossOrigin="anonymous"
              preload="metadata"
            />

            {/* Mute/Unmute Icon Overlay */}
            <AnimatePresence>
              {showMuteIcon && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-full p-6">
                    {isMuted ? (
                      <VolumeX size={60} className="text-white drop-shadow-lg" />
                    ) : (
                      <Volume2 size={60} className="text-white drop-shadow-lg" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white p-8 text-center">
            <p className="text-lg">{content}</p>
          </div>
        )}

        {/* Top Overlay - User Info */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 via-black/20 to-transparent z-10 backdrop-blur-[2px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PrefetchLink
                to={userData._id === user._id ? "/profile" : `/user/${user._id}`}
                prefetchType="user"
                prefetchId={user._id}
              >
                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600">
                  <img
                    className="rounded-full w-9 h-9 object-cover border-2 border-black"
                    src={user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                    alt={user.name}
                    loading="lazy"
                  />
                  <OnlineIndicator userId={user._id} size="sm" />
                </div>
              </PrefetchLink>
              <div className="flex flex-col text-white drop-shadow-md">
                <div className="flex items-center gap-1">
                  <PrefetchLink
                    to={userData._id === user._id ? "/profile" : `/user/${user._id}`}
                    prefetchType="user"
                    prefetchId={user._id}
                    className="font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    {user.name}
                  </PrefetchLink>
                  {community && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <PrefetchLink
                        to={`/communities/${community._id || community}`}
                        prefetchType="community"
                        prefetchId={community._id || community}
                        className="text-xs text-gray-200 hover:text-white transition-colors truncate max-w-[120px]"
                      >
                        {community.name || 'Community'}
                      </PrefetchLink>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-200 opacity-90">
                  {(() => {
                    if (!createdAt) return 'Date unavailable';
                    try {
                      const date = dayjs(createdAt);
                      if (date.isValid()) {
                        return date.fromNow();
                      }
                      // Try parsing as a regular Date object
                      const jsDate = new Date(createdAt);
                      if (!isNaN(jsDate.getTime())) {
                        return dayjs(jsDate).fromNow();
                      }
                      return 'Date unavailable';
                    } catch (e) {
                      console.error('Date parsing error:', e, createdAt);
                      return 'Date unavailable';
                    }
                  })()}
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <MoreHorizontal size={20} />
              </button>

              {showOptions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowOptions(false); }} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100 dark:border-gray-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enterFullscreen();
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <Maximize size={16} />
                      View Full Screen
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle report logic here
                        alert("Reported");
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 flex items-center gap-2"
                    >
                      <Flag size={16} />
                      Report
                    </button>

                    {userData?._id === post.user._id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModal(true);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Overlay - Actions & Details */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 backdrop-blur-[2px]">
          <div className="flex flex-col gap-3">
            {/* Caption */}
            {content && (fileUrl) && (
              <div className="mb-1">
                <p className="text-sm text-white/95 line-clamp-2 drop-shadow-md">
                  <span className="font-bold mr-2">{user.name}</span>
                  {content}
                </p>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLike(); }}
                  className="flex items-center gap-2 group"
                >
                  <Heart
                    size={26}
                    className={`transition-all duration-200 ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white group-hover:scale-110"}`}
                  />
                  <span className="text-white font-medium text-sm drop-shadow-md">{likeCount}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommentsModal(true);
                  }}
                  className="flex items-center gap-2 group"
                >
                  <MessageCircle size={26} className="text-white group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-white font-medium text-sm drop-shadow-md">{comments.length}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareModal(true);
                  }}
                  className="flex items-center gap-2 group"
                >
                  <Share2 size={26} className="text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleSave(); }}
                className="group"
              >
                <Bookmark
                  size={26}
                  className={`transition-all duration-200 ${isSaved ? "fill-white text-white" : "text-white group-hover:scale-110"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <DeleteModal
          showModal={showModal}
          postId={post._id}
          onClose={() => toggleModal(false)}
          prevPath={location.pathname}
        />
      )}

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        post={post}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />
    </div>
  );
};

export default Post;
