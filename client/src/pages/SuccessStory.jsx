import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { API } from "../redux/api/utils";

const SuccessStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData: user } = useSelector((state) => state.auth);

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = useMemo(
    () => ({
      all: "All Categories",
      career_achievement: "Career Achievement",
      entrepreneurship: "Entrepreneurship",
      social_impact: "Social Impact",
      academic_excellence: "Academic Excellence",
      innovation: "Innovation",
      leadership: "Leadership",
      other: "Other",
    }),
    []
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/success-stories/${id}`);
        setStory(res.data);
      } catch (e) {
        setError("Failed to load story");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLike = async () => {
    if (!user || !story) return;
    setLikeLoading(true);
    try {
      const res = await API.post(`/success-stories/${story._id}/like`);
      const isLiked = res.data.isLiked;
      const currentLikes = Array.isArray(story.likes) ? story.likes : [];
      const updatedLikes = isLiked
        ? [...currentLikes, user._id || user.id]
        : currentLikes.filter((uid) => (uid === (user._id || user.id) ? false : true));
      setStory({ ...story, likes: updatedLikes });
    } catch {}
    setLikeLoading(false);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await API.post(`/success-stories/${story._id}/comment`, {
        text: commentText.trim(),
      });
      const newComment = res.data?.comment;
      if (newComment) {
        setStory((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), newComment],
        }));
        setCommentText("");
      }
    } catch (e) {}
    setCommentSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">Loading...</div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-md border">Page not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/success-stories" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Success Stories</Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {story.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-t-lg">
              <span className="text-sm font-medium">⭐ Featured Story</span>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img src={story.author?.avatar} alt={story.author?.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-gray-900">{story.author?.name}</div>
                  <div className="text-sm text-gray-600">
                    {story.author?.position && story.author?.currentEmployer && (
                      <p>
                        {story.author.position} at {story.author.currentEmployer}
                      </p>
                    )}
                    {story.author?.department && <p>{story.author.department}</p>}
                    {story.author?.graduationYear && <p>Class of {story.author.graduationYear}</p>}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{formatDate(story.createdAt)}</p>
                {story.views > 0 && <p>{story.views} views</p>}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{story.title}</h1>

            <div className="flex items-center flex-wrap gap-2 mb-4">
              {story.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {categories[story.category] || story.category}
                </span>
              )}
              {story.companyName && <span className="text-sm text-gray-600">{story.companyName}</span>}
              {story.achievementYear && <span className="text-sm text-gray-600">{story.achievementYear}</span>}
            </div>

            {Array.isArray(story.media) && story.media.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {story.media.map((mediaUrl, idx) => (
                    <div key={idx} className="relative">
                      {mediaUrl.includes(".mp4") || mediaUrl.includes(".mov") || mediaUrl.includes(".avi") ? (
                        <video src={mediaUrl} controls className="w-full h-56 object-cover rounded-md" />
                      ) : (
                        <img src={mediaUrl} alt={`Media ${idx + 1}`} className="w-full h-56 object-cover rounded-md" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-line">{story.description}</div>

            {Array.isArray(story.tags) && story.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {story.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#{tag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center space-x-1 text-sm ${
                  user && story.likes?.includes(user._id || user.id) ? "text-red-600" : "text-gray-600 hover:text-red-600"
                }`}
              >
                <span>❤️</span>
                <span>{story.likes?.length || 0}</span>
              </button>

              <div className="text-sm text-gray-600">💬 {story.comments?.length || 0}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
            {Array.isArray(story.comments) && story.comments.length > 0 ? (
              <ul className="space-y-4">
                {story.comments.map((c, idx) => (
                  <li key={`${c._id || idx}-${idx}`} className="flex items-start space-x-3">
                    <img
                      src={c.user?.avatar}
                      alt={c.user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{c.user?.name || "User"}</div>
                      <div className="text-sm text-gray-700 whitespace-pre-line">{c.text}</div>
                      <div className="text-xs text-gray-400 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No comments yet.</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-base font-medium text-gray-900 mb-3">Add a comment</h3>
            {!user ? (
              <div className="text-sm text-gray-600">
                Please <Link to="/signup" className="text-blue-600 hover:text-blue-800">sign in</Link> to comment.
              </div>
            ) : (
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Write your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={commentSubmitting || !commentText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStory;

