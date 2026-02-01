import { useSelector, useDispatch } from "react-redux";
import { useEffect, lazy, useMemo, Suspense } from "react";
import { getPostAction, clearPostAction } from "../redux/actions/postActions";
import { useParams, useNavigate } from "react-router-dom";
import CommonLoading from "../components/loader/CommonLoading";
import FallbackLoading from "../components/loader/FallbackLoading";
import { useTheme } from "../contexts/ThemeContext";

const PostView = lazy(() => import("../components/post/PostView"));
const CommentSidebar = lazy(() => import("../components/post/CommentSidebar"));

const Post = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const userData = useSelector((state) => state.auth?.userData);

  const joinedCommunities = useSelector((state) =>
    state.community?.joinedCommunities?.map(({ _id }) => _id)
  );

  useEffect(() => {
    dispatch(getPostAction(postId));

    return () => {
      dispatch(clearPostAction());
    };
  }, [dispatch, postId]);

  const post = useSelector((state) => state.posts?.post);

  const isAuthorized = useMemo(() => {
    return post && joinedCommunities?.includes(post.community._id);
  }, [post, joinedCommunities]);

  useEffect(() => {
    if (isAuthorized === false) {
      navigate("/access-denied");
    }
  }, [isAuthorized, navigate]);

  if (!post || !joinedCommunities) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<FallbackLoading />}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Post Content - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <PostView post={post} userData={userData} />
            </div>

            {/* Comments Sidebar - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <CommentSidebar comments={post.comments} />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default Post;
