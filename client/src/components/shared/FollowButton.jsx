import { useState, useEffect } from "react";
import { useFollowUser, useUnfollowUser, useCheckFollowStatus } from "../../hooks/useFollow";
import { useTheme } from "../../contexts/ThemeContext";

const FollowButton = ({ targetUserId, className = "" }) => {
    const { isDarkMode } = useTheme();

    // Queries & Mutations
    const { data: statusData, isLoading } = useCheckFollowStatus(targetUserId);
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const [localStatus, setLocalStatus] = useState("none"); // none, following, requested

    useEffect(() => {
        if (statusData) {
            setLocalStatus(statusData.status);
        }
    }, [statusData]);

    const handleAction = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (localStatus === "none") {
            // Follow
            try {
                setLocalStatus("loading");
                const res = await followMutation.mutateAsync(targetUserId);
                setLocalStatus(res.status);
            } catch (error) {
                setLocalStatus("none");
            }
        } else if (localStatus === "following" || localStatus === "requested") {
            // Unfollow or Cancel Request
            if (window.confirm(localStatus === "following" ? "Unfollow this user?" : "Cancel follow request?")) {
                try {
                    setLocalStatus("loading");
                    await unfollowMutation.mutateAsync(targetUserId);
                    setLocalStatus("none");
                } catch (error) {
                    // revert
                    setLocalStatus(statusData.status);
                }
            }
        }
    };

    if (isLoading || localStatus === "loading") {
        return (
            <button className={`px-4 py-1.5 rounded-lg text-sm font-semibold opacity-70 cursor-wait ${className} ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                ...
            </button>
        );
    }

    const getButtonStyles = () => {
        if (localStatus === "following") {
            return isDarkMode
                ? "bg-transparent border border-gray-600 text-white hover:border-gray-400"
                : "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200";
        }
        if (localStatus === "requested") {
            return isDarkMode
                ? "bg-transparent border border-gray-600 text-gray-300"
                : "bg-white border border-gray-300 text-gray-700";
        }
        // Follow / Follow Back
        return "bg-blue-600 text-white hover:bg-blue-700 border border-transparent";
    };

    const getLabel = () => {
        if (localStatus === "following") return "Following";
        if (localStatus === "requested") return "Requested";
        if (statusData?.followsMe) return "Follow Back";
        return "Follow";
    };

    return (
        <button
            onClick={handleAction}
            className={`px-6 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${getButtonStyles()} ${className}`}
        >
            {getLabel()}
        </button>
    );
};

export default FollowButton;
