import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { Users, ArrowRight } from "lucide-react";

const JoinedCommunityCard = ({ community }) => {
  const { isDarkMode } = useTheme();

  return (
    <Link
      to={`/community/${community.name}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isDarkMode
          ? "bg-dark-bg-secondary border-white/10 hover:border-orange-500/40 hover:shadow-orange-500/10"
          : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-orange-500/10"
        }`}
    >
      {/* Banner Image */}
      <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500">
        {community.banner ? (
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={community.banner}
            alt={community.name}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-12 h-12 text-white/30" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Community Name */}
        <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isDarkMode
            ? "text-white group-hover:text-orange-400"
            : "text-gray-900 group-hover:text-orange-600"
          } transition-colors`}>
          {community.name}
        </h3>

        {/* Members Count */}
        <div className="flex items-center gap-2 mt-auto">
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

          {/* Arrow Icon */}
          <div className={`ml-auto p-2 rounded-lg transition-all ${isDarkMode
              ? "bg-white/5 group-hover:bg-orange-500/20"
              : "bg-gray-100 group-hover:bg-orange-100"
            }`}>
            <ArrowRight className={`w-4 h-4 ${isDarkMode ? "text-gray-400 group-hover:text-orange-400" : "text-gray-600 group-hover:text-orange-600"
              } transition-all group-hover:translate-x-1`} />
          </div>
        </div>
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Link>
  );
};

export default JoinedCommunityCard;
