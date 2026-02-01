import { memo, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFollowingUsersPostsAction } from "../../redux/actions/postActions";
import CommonLoading from "../loader/CommonLoading";
import Post from "../post/Post";
import NoPost from "../../assets/nopost.jpg";
import { useTheme } from "../../contexts/ThemeContext";
import { Users } from "lucide-react";

const MemoizedPost = memo(Post);

const FollowingUsersPosts = ({ communityData }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();

  const followingUsersPosts = useSelector(
    (state) => state.posts?.followingUsersPosts
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setIsLoading(true);
      if (communityData?._id) {
        await dispatch(getFollowingUsersPostsAction(communityData._id));
      }
      setIsLoading(false);
    };
    fetchInitialPosts();
  }, [dispatch, communityData]);

  const memoizedFollowingUsersPost = useMemo(() => {
    return followingUsersPosts?.map((post) => (
      <MemoizedPost key={post._id} post={post} />
    ));
  }, [followingUsersPosts]);

  return (
    <div className="main-section">
      {isLoading || !communityData ? (
        <div className="flex items-center justify-center pt-8">
          <CommonLoading />
        </div>
      ) : (
        <>
          {followingUsersPosts && followingUsersPosts.length > 0 ? (
            <div className="space-y-4">{memoizedFollowingUsersPost}</div>
          ) : (
            <div className={`flex flex-col items-center justify-center p-8 rounded-xl border text-center ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-100"}`}>
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                No following posts
              </h3>
              <p className={`max-w-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-6`}>
                None of your following users have posted anything here yet.
              </p>
              {/* Fallback Image with Blend Mode for Dark Mode */}
              <div className="relative max-w-sm mx-auto">
                <img
                  loading="lazy"
                  src={NoPost}
                  alt="no posts"
                  className={`w-full h-auto object-contain ${isDarkMode ? "opacity-75 mix-blend-overlay grayscale contrast-125" : ""}`}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FollowingUsersPosts;
