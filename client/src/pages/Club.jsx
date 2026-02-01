import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../redux/api/utils";
import Post from "../components/post/Post";
import PostForm from "../components/form/PostForm";
import { useSelector } from "react-redux";
import { getBannerUrl, handleImageError, getAvatarUrl } from "../utils/imageUtils";
import { useTheme } from "../contexts/ThemeContext";
import CommonLoading from "../components/loader/CommonLoading";
import { Users, Shield, ShieldCheck, Grid3x3, Calendar, MessageSquare, TrendingUp } from "lucide-react";

const Club = () => {
  const { clubId } = useParams();
  const { isDarkMode } = useTheme();

  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const LIMIT = 10;
  const { userData: user } = useSelector((s) => s.auth);

  const loadClub = async () => {
    try {
      const res = await API.get(`/clubs/${clubId}`);
      setClub(res.data);
    } catch (error) {
      console.error("Failed to load club", error);
    }
  };

  const loadPosts = async (skip = 0) => {
    try {
      const res = await API.get(`/posts/club/${clubId}?limit=${LIMIT}&skip=${skip}`);
      if (skip === 0) setPosts(res.data.formattedPosts || []);
      else setPosts((prev) => [...prev, ...(res.data.formattedPosts || [])]);
      setTotal(res.data.totalClubPosts || 0);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadClub(), loadPosts(0)]).finally(() => setLoading(false));
  }, [clubId]);

  const handleLoadMore = async () => {
    if (loadingMore || posts.length >= total) return;
    setLoadingMore(true);
    await loadPosts(posts.length);
    setLoadingMore(false);
  };

  const isHead = useMemo(() => {
    if (!club || !user) return false;
    const userId = user._id || user.id;
    const headId = club.head?._id || club.head;
    const coHeadId = club.coHead?._id || club.coHead;
    return (headId && headId.toString() === userId.toString()) ||
      (coHeadId && coHeadId.toString() === userId.toString());
  }, [club, user]);

  const isMember = useMemo(() => {
    if (!club || !user) return false;
    const userId = user._id || user.id;
    return club.members?.some(m => (m._id || m).toString() === userId.toString());
  }, [club, user]);

  const memoPosts = useMemo(() => posts.map((p) => <Post key={p._id} post={p} />), [posts]);

  if (loading || !club) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-dark-bg" : "bg-white"}`}>
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-white"}`}>
      {/* Banner Section - Matching Home Style */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70 z-10" />
        {club.banner && (
          <img
            src={getBannerUrl(club.banner)}
            alt={club.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Banner load error, using gradient fallback');
              e.target.style.display = 'none';
            }}
          />
        )}

        {/* Club Info Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Club
                  </span>
                  {club.category && (
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
                      {club.category}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-2xl">
                  {club.name}
                </h1>
                <p className="text-gray-100 max-w-2xl text-sm md:text-base drop-shadow-lg">
                  {club.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <div>
                      <div className="text-xl font-bold">{club.members?.length || 0}</div>
                      <div className="text-xs opacity-80">Members</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <div>
                      <div className="text-xl font-bold">{total}</div>
                      <div className="text-xs opacity-80">Posts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Matching Home Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Post Creation - Only for Head/Co-Head */}
            {user && isHead && (
              <div>
                <PostForm
                  communityId={club.communityId || ""}
                  communityName={"Club"}
                  clubId={clubId}
                />
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {loadingPosts ? (
                <div className="flex justify-center py-12">
                  <CommonLoading />
                </div>
              ) : posts.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-orange-500/10" : "bg-orange-50"}`}>
                    <Grid3x3 size={32} className="text-orange-500" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    No posts yet
                  </h3>
                  <p className={`text-sm max-w-xs mx-auto ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {isHead
                      ? "Start the conversation by creating the first post!"
                      : "Check back soon for updates from club leadership."}
                  </p>
                </div>
              ) : (
                <>
                  {memoPosts}
                  {posts.length < total && (
                    <button
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isDarkMode
                        ? "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white hover:opacity-90"
                        : "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white hover:opacity-90"
                        } disabled:opacity-50`}
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading...
                        </span>
                      ) : "Load More Posts"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Matching Home Style */}
          <div className="space-y-4">
            {/* Membership Card */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
              <h3 className={`text-base font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Membership
              </h3>
              {user ? (
                isMember ? (
                  <div className="space-y-3">
                    <div className={`px-3 py-2 rounded-lg text-sm font-medium ${isDarkMode ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-700"}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        You're a member
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to leave this club?")) {
                          await API.post(`/clubs/${clubId}/leave`);
                          await loadClub();
                        }
                      }}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold border transition-all ${isDarkMode
                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : "border-red-300 text-red-600 hover:bg-red-50"
                        }`}
                    >
                      Leave Club
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      await API.post(`/clubs/${clubId}/join`);
                      await loadClub();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                  >
                    Join Club
                  </button>
                )
              ) : (
                <div className={`text-center py-3 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Login to join this club
                </div>
              )}
            </div>

            {/* Leadership Card */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
              <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                <ShieldCheck size={18} className="text-orange-500" />
                Leadership
              </h3>
              <div className="space-y-3">
                {/* Head */}
                <Link to={club.head?._id ? `/profile/${club.head._id}` : "#"} className="block">
                  <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <div className="relative">
                      <img
                        src={getAvatarUrl(club.head?.avatar)}
                        alt={club.head?.name || "Head"}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-500/30"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-bg-secondary">
                        <Shield size={10} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {club.head?.name || "Vacant"}
                      </div>
                      <div className="text-xs text-orange-500 font-medium">Club Head</div>
                    </div>
                  </div>
                </Link>

                {/* Co-Head */}
                <Link to={club.coHead?._id ? `/profile/${club.coHead._id}` : "#"} className="block">
                  <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <div className="relative">
                      <img
                        src={getAvatarUrl(club.coHead?.avatar)}
                        alt={club.coHead?.name || "Co-Head"}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-bg-secondary">
                        <Shield size={10} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {club.coHead?.name || "Vacant"}
                      </div>
                      <div className="text-xs text-blue-500 font-medium">Co-Head</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Club Info Card */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Calendar size={14} />
                <span>Created {new Date(club.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Club;
