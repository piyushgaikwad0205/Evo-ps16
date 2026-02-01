import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPostAction,
  clearCreatePostFail,
} from "../../redux/actions/postActions";
import InappropriatePostModal from "../modals/InappropriatePostModal";
import TopicConflictModal from "../modals/TopicConflictModal";
import EligibilityDetectionFailModal from "../modals/EligibilityDetectionFailModal";
import { useTheme } from "../../contexts/ThemeContext";

const PostForm = ({ communityId, communityName, clubId = null }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [showInappropriateContentModal, setShowInappropriateContentModal] =
    useState(false);
  const [showTopicConflictModal, setShowTopicConflictModal] = useState(false);
  const [
    showEligibilityDetectionFailModal,
    setShowEligibilityDetectionFailModal,
  ] = useState(false);

  const [formData, setFormData] = useState({
    content: "",
    file: null,
    error: "",
    loading: false,
  });

  const { isPostInappropriate, postCategory, confirmationToken } = useSelector(
    (state) => ({
      isPostInappropriate: state.posts?.isPostInappropriate,
      postCategory: state.posts?.postCategory,
      confirmationToken: state.posts?.confirmationToken,
    })
  );

  const handleContentChange = (event) => {
    setFormData({
      ...formData,
      content: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      selectedFile.size <= 50 * 1024 * 1024 // 50MB
    ) {
      setFormData({
        ...formData,
        file: selectedFile,
        error: "",
      });
    } else {
      setFormData({
        ...formData,
        file: null,
        error: "Please select an image or video file under 50MB.",
      });
    }
  };

  useEffect(() => {
    if (isPostInappropriate) setShowInappropriateContentModal(true);
    if (postCategory) setShowTopicConflictModal(true);
    if (confirmationToken) setShowEligibilityDetectionFailModal(true);
  }, [isPostInappropriate, postCategory, confirmationToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { content, file, loading } = formData;
    if (loading) return;

    if (!content && !file) {
      setFormData({
        ...formData,
        error: "Please enter a message or select a file.",
      });
      return;
    }

    const newPost = new FormData();
    newPost.append("content", content);
    newPost.append("communityId", communityId);
    newPost.append("communityName", communityName);
    newPost.append("file", file);
    if (clubId) newPost.append("clubId", clubId);

    setFormData({
      ...formData,
      loading: true,
    });

    try {
      const success = await dispatch(createPostAction(newPost));
      if (success) {
        setFormData({
          content: "",
          file: null,
          error: "",
          loading: false,
        });
        event.target.reset();
      } else {
        setFormData({
          ...formData,
          loading: false,
        });
      }
    } catch (error) {
      setFormData({
        ...formData,
        loading: false,
      });
    }
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      file: null,
      error: "",
    });
  };

  return (
    <>
      <InappropriatePostModal
        closeInappropriateContentModal={() => {
          setShowInappropriateContentModal(false);
          dispatch(clearCreatePostFail());
        }}
        showInappropriateContentModal={showInappropriateContentModal}
        contentType={"post"}
      />

      <TopicConflictModal
        closeTopicConflictModal={() => {
          setShowTopicConflictModal(false);
          dispatch(clearCreatePostFail());
        }}
        showTopicConflictModal={showTopicConflictModal}
        communityName={postCategory?.community}
        recommendedCommunity={postCategory?.recommendedCommunity}
      />

      <EligibilityDetectionFailModal
        closeEligibilityDetectionFailModal={() => {
          setShowEligibilityDetectionFailModal(false);
          dispatch(clearCreatePostFail());
        }}
        showEligibilityDetectionFailModal={showEligibilityDetectionFailModal}
        confirmationToken={confirmationToken}
      />

      <form
        onSubmit={handleSubmit}
        className={`rounded-xl p-6 border transition-colors duration-200 ${isDarkMode
          ? "bg-dark-bg-secondary border-white/10"
          : "bg-white border-gray-100"
          }`}
      >
        <div className="mb-4">
          <label
            htmlFor="content"
            className={`mb-2 block font-bold text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
          >
            Share something with your community:
          </label>
          <textarea
            className={`w-full resize-none rounded-xl border p-4 outline-none transition-all ${isDarkMode
              ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50"
              : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
              }`}
            name="content"
            id="content"
            value={formData.content}
            onChange={handleContentChange}
            maxLength={3000}
            placeholder="What's on your mind?"
            rows={2}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="file"
            className={`mx-auto mt-2 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-3 py-3 text-center transition-all ${isDarkMode
              ? "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
              : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 mr-2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Photo / Video
            </span>
            <input
              name="file"
              type="file"
              id="file"
              accept="image/*, video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {formData.file && (
            <div className={`mt-4 flex items-center justify-between p-3 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
              <p className={`text-sm truncate max-w-[80%] ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {formData.file.name}
              </p>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-600 p-1 hover:bg-red-500/10 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {formData.error && <p className="mt-2 text-sm text-red-500">{formData.error}</p>}
        </div>

        <button
          className={`w-full rounded-xl py-2.5 text-sm font-bold shadow-lg transition-all ${formData.loading || (!formData.content && !formData.file)
            ? "opacity-50 cursor-not-allowed bg-gray-400 text-white"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-[1.01]"
            }`}
          type="submit"
          disabled={formData.loading || (!formData.content && !formData.file)}
          style={{
            display: formData.content || formData.file ? "block" : "none",
          }}
        >
          {formData.loading ? "Processing..." : "Create post"}
        </button>
      </form>
    </>
  );
};

export default PostForm;
