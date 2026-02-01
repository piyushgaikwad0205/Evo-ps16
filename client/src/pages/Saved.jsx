import { getSavedPostsAction } from "../redux/actions/postActions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SavedPost from "../components/post/SavedPost";
import NoSavedPost from "../assets/nopost.jpg";
import { useTheme } from "../contexts/ThemeContext";
import { Bookmark, ArrowLeft } from "lucide-react";
import AppLoader from "../components/loader/AppLoader";

const Saved = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const savedPosts = useSelector((state) => state.posts?.savedPosts);
  // Initial loading state based on whether we have data
  const [isLoading, setIsLoading] = useState(!savedPosts || savedPosts.length === 0);

  useEffect(() => {
    // Always fetch latest to ensure sync, but show loading only if empty
    if (!savedPosts) setIsLoading(true);
    dispatch(getSavedPostsAction()).finally(() => setIsLoading(false));
  }, [dispatch]);

  /* Removed SkeletonCard in favor of AppLoader for consistency per previous tasks */

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : ""}`}>
      <div className="max-w-7xl mx-auto pt-4">
        {isLoading && (!savedPosts || savedPosts.length === 0) ? (
          <div className="flex justify-center pt-20">
            <AppLoader />
          </div>
        ) : savedPosts && savedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-4">
            {savedPosts.reverse().map((post) => (
              <SavedPost key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center flex justify-center items-center flex-col py-12 px-4">
            <div className="mb-6 p-4 rounded-full bg-gray-100 dark:bg-white/5">
              <Bookmark size={48} className={`${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
            </div>
            <p className={`font-semibold text-lg mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              No saved posts yet
            </p>
            <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              Posts you save will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
