import { useState } from "react";
import { Link } from "react-router-dom";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTheme } from "../../contexts/ThemeContext";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

dayjs.extend(relativeTime);

const CommentSidebar = ({ comments }) => {
  const { isDarkMode } = useTheme();
  const currentPage = 1;
  const [commentsPerPage, setCommentsPerPage] = useState(10);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const handleLoadMore = () => {
    setCommentsPerPage(commentsPerPage + 10);
  };

  return (
    <div className={`col-span-1 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"} border-2 rounded-2xl shadow-xl sticky top-20 h-[85vh] overflow-hidden flex flex-col transition-all`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b-2 ${isDarkMode ? "border-white/10 bg-dark-bg/50" : "border-gray-100 bg-gray-50/50"} backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDarkMode ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 border border-orange-500/30" : "bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300"}`}>
            <HiOutlineChatBubbleOvalLeft className={`text-2xl ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Comments
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {currentComments.length > 0 ? (
          <>
            {currentComments.map((comment) => (
              <div
                key={comment._id}
                className={`p-4 rounded-xl transition-all hover:shadow-lg ${isDarkMode
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/40"
                    : "bg-gray-50 hover:bg-white border border-gray-200 hover:border-orange-300"
                  }`}
              >
                <div className="flex gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={comment.user.avatar}
                      alt="User Avatar"
                      className="rounded-full w-10 h-10 object-cover shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dark-bg-secondary ring-orange-500/30"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg-secondary"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/user/${comment.user._id}`}
                      className={`text-sm font-bold ${isDarkMode ? "text-white hover:text-orange-400" : "text-gray-900 hover:text-orange-600"} transition-colors block truncate`}
                    >
                      {comment.user.name}
                    </Link>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {dayjs(comment.createdAt).fromNow()}
                    </p>
                  </div>
                </div>

                <p className={`text-sm leading-relaxed whitespace-normal break-words ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {comment.content}
                </p>
              </div>
            ))}

            {currentComments.length < comments.length && (
              <button
                className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                    ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                    : "bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 text-orange-700 border-2 border-orange-300 hover:border-orange-400"
                  }`}
                onClick={handleLoadMore}
              >
                Load More Comments
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className={`p-6 rounded-full mb-4 ${isDarkMode ? "bg-gradient-to-r from-orange-600/10 via-red-500/10 to-yellow-500/10" : "bg-gradient-to-r from-orange-100 to-yellow-100"}`}>
              <HiOutlineChatBubbleOvalLeft className={`text-5xl ${isDarkMode ? "text-orange-400/50" : "text-orange-500/50"}`} />
            </div>
            <p className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              No Comments Yet
            </p>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSidebar;
