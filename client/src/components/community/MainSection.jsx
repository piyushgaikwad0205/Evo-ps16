import { memo, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getComPostsAction,
  clearCommunityPostsAction,
} from "../../redux/actions/postActions";
import PostForm from "../form/PostForm";
import Post from "../post/Post";
import FollowingUsersPosts from "./FollowingUsersPosts";
import CommonLoading from "../loader/CommonLoading";
import { useTheme } from "../../contexts/ThemeContext";
import { Grid3x3, Users } from "lucide-react";

const MemoizedPost = memo(Post);

const MainSection = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();

  const communityData = useSelector((state) => state.community?.communityData);
  const communityPosts = useSelector((state) => state.posts?.communityPosts);

  const totalCommunityPosts = useSelector(
    (state) => state.posts?.totalCommunityPosts
  );

  const [activeTab, setActiveTab] = useState("All posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);
  const LIMIT = 10;

  const postError = useSelector((state) => state.posts?.postError);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      if (communityData?._id) {
        dispatch(getComPostsAction(communityData._id, LIMIT, 0)).finally(() => {
          setIsLoading(false);
        });
      }
    };

    fetchInitialPosts();

    return () => {
      dispatch(clearCommunityPostsAction());
    };
  }, [dispatch, communityData]);

  const handleLoadMore = () => {
    if (
      !isLoadMoreLoading &&
      communityPosts.length > 0 &&
      communityPosts.length < totalCommunityPosts
    ) {
      setIsLoadMoreLoading(true);
      dispatch(
        getComPostsAction(communityData._id, LIMIT, communityPosts.length)
      ).finally(() => {
        setIsLoadMoreLoading(false);
      });
    }
  };

  const memoizedCommunityPosts = useMemo(() => {
    return communityPosts?.map((post) => (
      <MemoizedPost key={post._id} post={post} />
    ));
  }, [communityPosts]);

  if (isLoading || !communityData || !communityPosts) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Modern Tab Navigation */}
      <div className={`flex gap-2 p-1 rounded-xl mb-6 ${isDarkMode ? "bg-dark-bg-secondary border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
        <button
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${activeTab === "All posts"
            ? isDarkMode
              ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 text-orange-400 border-2 border-orange-500/40"
              : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
            : isDarkMode
              ? "text-gray-400 hover:text-white hover:bg-white/5"
              : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          onClick={() => setActiveTab("All posts")}
        >
          <div className="flex items-center justify-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            All Posts
          </div>
        </button>
        <button
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${activeTab === "You're following"
            ? isDarkMode
              ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 text-orange-400 border-2 border-orange-500/40"
              : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
            : isDarkMode
              ? "text-gray-400 hover:text-white hover:bg-white/5"
              : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          onClick={() => setActiveTab("You're following")}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Following
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {activeTab === "All posts" && (
          <>
            <div className="mb-2">
              <PostForm
                communityId={communityData._id}
                communityName={communityData.name}
              />
            </div>
            {postError && (
              <div className={`p-4 rounded-xl border-2 text-center ${isDarkMode ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-red-50 border-red-300 text-red-600"}`}>
                {postError}
              </div>
            )}

            {memoizedCommunityPosts.length > 0 ? (
              <div className="space-y-4">{memoizedCommunityPosts}</div>
            ) : (
              <div className={`flex flex-col items-center justify-center p-8 rounded-xl border text-center ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-100"}`}>
                <div className="w-16 h-16 mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Grid3x3 className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  No posts yet
                </h3>
                <p className={`max-w-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Be the first to share something with the community! Start a conversation or share an update.
                </p>
              </div>
            )}

            {communityPosts.length < totalCommunityPosts && (
              <button
                className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all ${isDarkMode
                  ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleLoadMore}
                disabled={isLoadMoreLoading}
              >
                {isLoadMoreLoading ? "Loading..." : "Load More Posts"}
              </button>
            )}
          </>
        )}
        {activeTab === "You're following" && (
          <FollowingUsersPosts communityData={communityData} />
        )}
      </div>
    </div>
  );
};

export default MainSection;
