import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LeaveModal from "../modals/LeaveModal";
import { getCommunityAction } from "../../redux/actions/communityActions";
import placeholder from "../../assets/placeholder.png";
import CommonLoading from "../loader/CommonLoading";
import { useTheme } from "../../contexts/ThemeContext";

import {
  useBannerLoading,
  useIsModeratorUpdated,
} from "../../hooks/useCommunityData";
import { HiUserGroup, HiOutlineCheckBadge } from "react-icons/hi2";
import { Shield, LogOut, Users, FileText } from "lucide-react";

const Rightbar = () => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const { isDarkMode } = useTheme();

  const dispatch = useDispatch();
  const { communityName } = useParams();

  const toggleLeaveModal = useCallback(() => {
    setShowLeaveModal((prevState) => !prevState);
  }, []);

  useEffect(() => {
    dispatch(getCommunityAction(communityName));
  }, [dispatch, communityName]);

  const communityData = useSelector((state) => state.community?.communityData);

  const isModeratorOfThisCommunity = useSelector(
    (state) => state.auth?.isModeratorOfThisCommunity
  );

  const { name, description, members, rules, banner } = useMemo(
    () => communityData || {},
    [communityData]
  );

  const bannerLoaded = useBannerLoading(banner);
  const isModeratorUpdated = useIsModeratorUpdated(isModeratorOfThisCommunity);

  if (!communityData) {
    return (
      <div className="flex justify-center items-center h-full">
        <CommonLoading />
      </div>
    );
  }

  // Header/Banner removed (displayed in main Hero)

  return (
    <div className="flex flex-col gap-4">


      {/* Action Buttons: Only Moderation Panel remains in sidebar if applicable */}
      {isModeratorOfThisCommunity && (
        <div className="flex flex-col gap-2">
          <Link
            to={`/community/${communityName}/moderator`}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
              ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
              }`}
          >
            <Shield className="w-4 h-4" />
            Moderation Panel
          </Link>
        </div>
      )}

      {/* Community Guidelines */}
      {rules && rules.length > 0 && (
        <div className={`p-5 rounded-xl border transition-colors duration-200 ${isDarkMode
          ? "bg-dark-bg-secondary border-white/10"
          : "bg-white border-gray-100 shadow-sm"
          }`}>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCheckBadge className={`text-xl ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
            <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Community Guidelines
            </h3>
          </div>
          <ul className="flex flex-col gap-3">
            {rules.map((rule) => (
              <li key={rule._id} className="flex items-start gap-3">
                <HiOutlineCheckBadge className={`text-lg flex-shrink-0 mt-0.5 ${isDarkMode ? "text-orange-400/80" : "text-orange-600/80"}`} />
                <span className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {rule.rule}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Rightbar;
