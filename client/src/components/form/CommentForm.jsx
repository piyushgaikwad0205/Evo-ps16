import { useState, useEffect } from "react";
import {
  addCommentAction,
  getPostAction,
  getComPostsAction,
  getOwnPostAction,
  clearCommentFailAction,
} from "../../redux/actions/postActions";
import { useDispatch, useSelector } from "react-redux";
import InappropriatePost from "../modals/InappropriatePostModal";
import { Link } from "react-router-dom";

const CommentForm = ({ communityId, postId }) => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth?.userData);
  const [showInappropriateContentModal, setShowInappropriateContentModal] =
    useState(false);

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emojis = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];

  const handleEmojiClick = (emoji) => {
    setContent((prev) => prev + emoji);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newComment = {
      content,
      postId,
    };
    try {
      setIsLoading(true);
      await dispatch(addCommentAction(postId, newComment));
      await dispatch(getPostAction(postId));
      await dispatch(getOwnPostAction(postId));

      setIsLoading(false);
      setContent("");

      if (communityId) {
        await dispatch(getComPostsAction(communityId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isCommentInappropriate = useSelector(
    (state) => state.posts?.isCommentInappropriate
  );

  useEffect(() => {
    if (isCommentInappropriate) {
      setShowInappropriateContentModal(true);
    }
  }, [isCommentInappropriate]);

  return (
    <div>
      <InappropriatePost
        closeInappropriateContentModal={() => {
          setShowInappropriateContentModal(false);
          dispatch(clearCommentFailAction());
        }}
        showInappropriateContentModal={showInappropriateContentModal}
        contentType={"comment"}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Emoji Bar */}
        <div className="flex justify-between items-center px-1 overflow-x-auto no-scrollbar gap-2 pb-2">
          {emojis.map((emoji) => (
            <button
              type="button"
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl hover:scale-125 transition-transform active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-3">
          <img
            src={userData?.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you think of this?"
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all placeholder:text-gray-500"
              disabled={isLoading}
              maxLength={500}
            />
            {content.trim() && (
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors disabled:opacity-50 px-2"
              >
                Post
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
