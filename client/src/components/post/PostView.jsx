import { useEffect, useState } from "react";
import { HiOutlineArchiveBox, HiOutlineChatBubbleOvalLeft, HiOutlineHeart, HiHeart } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getCommunityAction } from "../../redux/actions/communityActions";
import Save from "./Save";
import Like from "./Like";
import CommentForm from "../form/CommentForm";
import DeleteModal from "../modals/DeleteModal";
import { IoIosArrowBack } from "react-icons/io";
import CommonLoading from "../loader/CommonLoading";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import ReportPostModal from "../modals/ReportPostModal";
import { VscReport } from "react-icons/vsc";
import Tooltip from "../shared/Tooltip";
import { useTheme } from "../../contexts/ThemeContext";

const PostView = ({ post, userData }) => {
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    content,
    fileUrl,
    fileType,
    user,
    community,
    dateTime,
    comments,
    savedByCount,
    isReported,
  } = post;

  useEffect(() => {
    dispatch(getCommunityAction(community.name)).then(() => setLoading(false));
  }, [dispatch, community.name, loading]);

  const [showModal, setShowModal] = useState(false);
  const toggleModal = (value) => {
    setShowModal(value);
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportedPost, setIsReportedPost] = useState(isReported);

  const handleReportClick = () => {
    setIsReportModalOpen(true);
  };

  const handleReportClose = () => {
    setIsReportModalOpen(false);
  };

  if (loading) {
    return (
      <div className={`main-section flex justify-center items-center min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className={`main-section ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"} border rounded-xl shadow-lg overflow-hidden transition-all`}>
      {/* Header with Back Button */}
      <div className={`px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 border-b ${isDarkMode ? "border-white/10 bg-dark-bg/50" : "border-gray-100 bg-gray-50/50"} backdrop-blur-sm`}>
        <button
          onClick={() => navigate(location.state?.from || "/")}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[10px] transition-all ${isDarkMode
            ? "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-orange-500/40"
            : "bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-300"
            }`}
        >
          <IoIosArrowBack className="text-xs" />
          Back
        </button>
      </div>

      {/* Post Content */}
      <div className="p-1.5 sm:p-2 md:p-2.5">
        {/* User Info */}
        <div className="flex justify-between items-start mb-1 sm:mb-1.5 md:mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="relative">
              <img
                className="rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-cover shadow-sm ring-1 ring-offset-1 ring-offset-white dark:ring-offset-dark-bg-secondary ring-orange-500/30"
                src={user.avatar}
                alt="user avatar"
                loading="lazy"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border border-white dark:border-dark-bg-secondary"></div>
            </div>
            <div className="flex flex-col">
              {userData._id === user._id ? (
                <Link
                  to="/profile"
                  className={`text-xs sm:text-sm md:text-base font-bold ${isDarkMode ? "text-white hover:text-orange-400" : "text-gray-900 hover:text-orange-600"} transition-colors`}
                >
                  {user.name}
                </Link>
              ) : (
                <Link
                  to={`/user/${user._id}`}
                  className={`text-xs sm:text-sm md:text-base font-bold ${isDarkMode ? "text-white hover:text-orange-400" : "text-gray-900 hover:text-orange-600"} transition-colors`}
                >
                  {user.name}
                </Link>
              )}
              <Link
                to={`/community/${community.name}`}
                className={`text-[10px] sm:text-xs ${isDarkMode ? "text-gray-400 hover:text-orange-400" : "text-gray-600 hover:text-orange-600"} transition-colors flex items-center gap-1`}
              >
                <span className="inline-block w-1 h-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></span>
                {community.name}
              </Link>
            </div>
          </div>

          <div className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded-md ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
            <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {dateTime}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-1 sm:mb-1.5 md:mb-2">
          <p className={`text-[11px] sm:text-xs md:text-sm leading-tight mb-0.5 sm:mb-1 md:mb-1.5 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            {content}
          </p>

          {/* Media */}
          <div className="flex justify-center">
            {fileUrl && fileType === "image" ? (
              <PhotoProvider
                overlayRender={() => (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white px-6 py-4">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-300">{community.name}</p>
                    <p className="text-xs text-gray-400">{dateTime}</p>
                  </div>
                )}
              >
                <PhotoView src={fileUrl}>
                  <div className="w-full rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-orange-500/20 transition-all">
                    <img
                      src={fileUrl}
                      alt={content}
                      loading="lazy"
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </PhotoView>
              </PhotoProvider>
            ) : (
              fileUrl && (
                <div className="w-full rounded-xl overflow-hidden shadow-lg">
                  <video
                    className="w-full h-auto rounded-xl focus:outline-none"
                    src={fileUrl}
                    controls
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className={`flex items-center justify-between py-0.5 sm:py-1 md:py-1.5 border-y ${isDarkMode ? "border-white/10" : "border-gray-100"} mb-0.5 sm:mb-1 md:mb-1.5`}>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <Like post={post} />
            <button className={`flex items-center gap-1 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-md transition-all ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
              <HiOutlineChatBubbleOvalLeft className={`text-base sm:text-lg md:text-xl ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              <span className={`text-xs sm:text-sm md:text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {comments.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <Save postId={post._id} />
            <Tooltip text="Saved by" className="items-center">
              <div className={`flex items-center gap-1 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-md ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
                <HiOutlineArchiveBox className={`text-sm sm:text-base md:text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                <span className={`text-[10px] sm:text-xs md:text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {savedByCount}
                </span>
              </div>
            </Tooltip>

            {isReportedPost ? (
              <Tooltip text="Reported" className="items-center">
                <button disabled className="text-green-500 px-1.5 py-0.5 rounded-md bg-green-500/10 border border-green-500/20">
                  <VscReport className="text-sm" />
                </button>
              </Tooltip>
            ) : (
              <Tooltip text="Report">
                <button
                  onClick={handleReportClick}
                  className={`px-1.5 py-0.5 rounded-md transition-all ${isDarkMode ? "hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/40" : "hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-300"}`}
                >
                  <VscReport className="text-sm" />
                </button>
              </Tooltip>
            )}

            {userData?._id === post.user._id && (
              <Tooltip text="Delete">
                <button
                  onClick={() => toggleModal(true)}
                  className="px-1.5 py-0.5 rounded-md transition-all bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 border border-red-500/20 hover:border-red-500/40"
                >
                  <HiOutlineArchiveBox className="text-sm" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Comment Form */}
        <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-md sm:rounded-lg ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
          <h3 className={`text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1 md:mb-1.5 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Add a Comment
          </h3>
          <CommentForm communityId={community._id} postId={post._id} />
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        showModal={showModal}
        postId={post._id}
        onClose={() => toggleModal(false)}
        prevPath={location.state?.from || "/"}
      />

      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={handleReportClose}
        postId={post._id}
        communityId={community._id}
        setReportedPost={setIsReportedPost}
      />
    </div>
  );
};

export default PostView;
