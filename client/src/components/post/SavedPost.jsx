import { useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import dayjs from 'dayjs';

const SavedPost = ({ post }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const { content, fileUrl, fileType, user, community, createdAt, comments, likes } = post;

  const isImageFile = useMemo(() => {
    if (!fileUrl) return false;
    const validExtensions = [".jpg", ".png", ".jpeg", ".gif", ".webp", ".svg"];
    const fileExtension = fileUrl?.slice(fileUrl.lastIndexOf("."));
    return validExtensions.includes(fileExtension);
  }, [fileUrl]);

  const handlePostClick = () => {
    navigate(`/post/${post._id}`, {
      state: { from: location.pathname },
    });
  };

  return (
    <div className="w-full mb-0 relative group rounded-2xl overflow-hidden shadow-lg bg-black">
      {/* Media Layer */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-black cursor-pointer"
        onClick={handlePostClick}
      >
        {fileUrl && isImageFile ? (
          <img
            src={fileUrl}
            alt={content}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : fileUrl ? (
          <video
            className="w-full h-full object-cover"
            src={fileUrl}
            loop
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white p-8 text-center">
            <p className="text-lg">{content}</p>
          </div>
        )}

        {/* Top Overlay - User Info */}
        <div className="absolute top-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-b from-black/70 via-black/20 to-transparent z-10 backdrop-blur-[2px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to={`/user/${user._id}`}>
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600">
                  <img
                    className="rounded-full w-7 h-7 md:w-8 md:h-8 object-cover border-2 border-black"
                    src={user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                    alt={user.name}
                    loading="lazy"
                  />
                </div>
              </Link>
              <div className="flex flex-col text-white drop-shadow-md">
                <div className="flex items-center gap-1">
                  <Link
                    to={`/user/${user._id}`}
                    className="font-bold text-xs md:text-sm hover:opacity-90 transition-opacity truncate max-w-[100px]"
                  >
                    {user.name}
                  </Link>
                  {community && (
                    <>
                      <span className="text-[10px] md:text-xs text-gray-300">•</span>
                      <Link
                        to={`/communities/${community._id || community}`}
                        className="text-[10px] md:text-xs text-gray-200 hover:text-white transition-colors truncate max-w-[80px]"
                      >
                        {community.name || 'Community'}
                      </Link>
                    </>
                  )}
                </div>
                <span className="text-[10px] md:text-xs text-gray-200 opacity-90">
                  {(() => {
                    if (!createdAt) return 'Date unavailable';
                    try {
                      const date = dayjs(createdAt);
                      if (date.isValid()) {
                        return date.format('MMM DD, YYYY');
                      }
                      // Try parsing as a regular Date object
                      const jsDate = new Date(createdAt);
                      if (!isNaN(jsDate.getTime())) {
                        return dayjs(jsDate).format('MMM DD, YYYY');
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
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Bottom Overlay - Actions & Details */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 backdrop-blur-[2px]">
          <div className="flex flex-col gap-2">
            {/* Caption */}
            {content && fileUrl && (
              <div className="mb-0.5">
                <p className="text-xs md:text-sm text-white/95 line-clamp-2 drop-shadow-md">
                  <span className="font-bold mr-1">{user.name}</span>
                  {content}
                </p>
              </div>
            )}

            {/* Action Buttons Row - Static Display Only */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Static Like Display */}
                <div className="flex items-center gap-1.5">
                  <Heart
                    size={20}
                    className="text-white"
                  />
                  <span className="text-white font-medium text-xs md:text-sm drop-shadow-md">{likes?.length || 0}</span>
                </div>

                {/* Static Comment Display */}
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={20} className="text-white" />
                  <span className="text-white font-medium text-xs md:text-sm drop-shadow-md">{comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPost;
