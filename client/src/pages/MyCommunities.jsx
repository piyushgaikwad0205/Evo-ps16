import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getJoinedCommunitiesAction } from "../redux/actions/communityActions";
import JoinedCommunityCard from "../components/community/JoinedCommunityCard";
import CommonLoading from "../components/loader/CommonLoading";
import { useTheme } from "../contexts/ThemeContext";
import { Users, Grid3x3 } from "lucide-react";

const MyCommunities = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  const joinedCommunities = useSelector(
    (state) => state.community?.joinedCommunities
  );

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getJoinedCommunitiesAction());
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 border border-orange-500/30" : "bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300"}`}>
              <Users className={`w-6 h-6 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                My Communities
              </h1>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {joinedCommunities?.length || 0} {joinedCommunities?.length === 1 ? 'community' : 'communities'} joined
              </p>
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        {!joinedCommunities || joinedCommunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`p-6 rounded-full mb-4 ${isDarkMode ? "bg-gradient-to-r from-orange-600/10 via-red-500/10 to-yellow-500/10" : "bg-gradient-to-r from-orange-100 to-yellow-100"}`}>
              <Grid3x3 className={`w-12 h-12 ${isDarkMode ? "text-orange-400/50" : "text-orange-500/50"}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              No Communities Yet
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Join communities to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {joinedCommunities.map((community) => (
              <JoinedCommunityCard key={community._id} community={community} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCommunities;
