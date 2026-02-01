import { useState } from "react";
import JoinModal from "../modals/JoinModal";
import placeholder from "../../assets/placeholder.png";
import { useTheme } from "../../contexts/ThemeContext";
import { Users, UserPlus } from "lucide-react";

const CommunityCard = ({ community }) => {
  const [joinModalVisibility, setJoinModalVisibility] = useState({});
  const { isDarkMode } = useTheme();

  const toggleJoinModal = (communityId, visible) => {
    setJoinModalVisibility((prev) => ({
      ...prev,
      [communityId]: visible,
    }));
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isDarkMode
          ? "bg-dark-bg-secondary border-white/10 hover:border-orange-500/40 hover:shadow-orange-500/10"
          : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-orange-500/10"
        }`}
    >
      {/* Banner/Avatar Section */}
      <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src={community.banner || placeholder}
          alt="community banner"
          loading="lazy"
          onError={(e) => {
            e.target.src = placeholder;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Community Name */}
        <h4 className={`text-lg font-bold mb-2 line-clamp-2 ${isDarkMode
            ? "text-white group-hover:text-orange-400"
            : "text-gray-900 group-hover:text-orange-600"
          } transition-colors`}>
          {community.name}
        </h4>

        {/* Members Count & Join Button */}
        <div className="flex items-center justify-between mt-auto">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isDarkMode
              ? "bg-white/5 border border-white/10"
              : "bg-gray-100 border border-gray-200"
            }`}>
            <Users className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
            <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {community.members?.length || 0}
            </span>
            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {community.members?.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Join Button */}
          <button
            onClick={() => toggleJoinModal(community._id, true)}
            className={`p-2.5 rounded-lg transition-all ${isDarkMode
                ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 border-2 border-orange-500/30 hover:border-orange-500/50"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl"
              }`}
          >
            <UserPlus className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-white"}`} />
          </button>
        </div>
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <JoinModal
        show={joinModalVisibility[community._id] || false}
        onClose={() => toggleJoinModal(community._id, false)}
        community={community}
      />
    </div>
  );
};

export default CommunityCard;
