import { memo } from "react";
import { Link } from "react-router-dom";
import { CiLocationOn } from "react-icons/ci";
import FollowButton from "../shared/FollowButton";
import { useTheme } from "../../contexts/ThemeContext";
import { useRemoveFollower } from "../../hooks/useFollow";
import { X } from "lucide-react";

const PublicProfileCard = ({ user, isFollowerList = false }) => {
  const { isDarkMode } = useTheme();
  const removeFollowerMutation = useRemoveFollower();

  const handleRemove = async () => {
    if (window.confirm(`Remove ${user.name} from your followers?`)) {
      await removeFollowerMutation.mutateAsync(user._id);
    }
  };

  return (
    <div
      className={`border rounded-xl w-full px-4 py-4 shadow-sm transition-all hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link to={`/user/${user._id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover shrink-0"
            loading="lazy"
          />
          <div className="min-w-0">
            <h2 className={`font-bold text-base truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</h2>
            <p className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <CiLocationOn className="text-lg" />
              <span className="truncate">{user.location || "N/A"}</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {isFollowerList && (
            <button
              onClick={handleRemove}
              disabled={removeFollowerMutation.isLoading}
              className={`p-1.5 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-400' : 'border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-500'}`}
              title="Remove Follower"
            >
              <X size={16} />
            </button>
          )}
          <FollowButton targetUserId={user._id} />
        </div>
      </div>

    </div>
  );
};

export default memo(PublicProfileCard);
