import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getComModsAction } from "../../redux/actions/communityActions";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { Clock, MapPin, Shield } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const ModeratorsList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const communityName = location.pathname.split("/")[2];
  const { isDarkMode } = useTheme();

  useEffect(() => {
    dispatch(getComModsAction(communityName));
  }, [dispatch, communityName]);

  const communityMods = useSelector((state) => state.moderation?.communityMods);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Shield className={`${isDarkMode ? "text-blue-400" : "text-blue-600"}`} size={20} />
        <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Moderators
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {communityMods && communityMods.length > 0 ? (
          communityMods.map((moderator) => (
            <Link
              key={moderator._id}
              to={`/user/${moderator._id}`}
              className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-200 border ${isDarkMode
                  ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  : "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200"
                }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={moderator.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                  alt={moderator.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white dark:border-dark-bg-secondary flex items-center justify-center">
                  <Shield size={10} className="text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {moderator.name}
                </p>

                {moderator.location && (
                  <div className={`flex items-center gap-1 text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <MapPin size={12} />
                    <span className="truncate">{moderator.location}</span>
                  </div>
                )}

                <div className={`flex items-center gap-1 text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <Clock size={12} />
                  <span>Joined {new Date(moderator.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className={`text-sm text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            No moderators found
          </p>
        )}
      </div>
    </div>
  );
};

export default ModeratorsList;
