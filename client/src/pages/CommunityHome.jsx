import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getCommunityAction } from "../redux/actions/communityActions";

import CommunityRightbar from "../components/community/Rightbar";
import CommunityMainSection from "../components/community/MainSection";
import AppLoader from "../components/loader/AppLoader";
import LeaveModal from "../components/modals/LeaveModal";
import { useTheme } from "../contexts/ThemeContext";
import { Users, Calendar, Globe, LogOut, FileText, X } from "lucide-react";
import { HiOutlineCheckBadge } from "react-icons/hi2";
import dayjs from "dayjs";

const CommunityHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { communityName } = useParams();
  const { isDarkMode } = useTheme();

  const { joinedCommunities, communityData } = useSelector((state) => state.community || {});
  const user = useSelector((state) => state.auth?.userData);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  const isAuthorized = joinedCommunities?.some(
    ({ name }) => name === communityName
  );

  useEffect(() => {
    if (communityName) {
      dispatch(getCommunityAction(communityName));
    }
  }, [dispatch, communityName]);

  useEffect(() => {
    if (joinedCommunities && !isAuthorized && joinedCommunities.length > 0) {
      navigate("/access-denied");
    }
  }, [isAuthorized, joinedCommunities, navigate, communityName]);

  if (!communityData || !joinedCommunities) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <AppLoader />
      </div>
    );
  }

  return (
    <>
      {/* Hero Banner Section */}
      <div className="relative h-48 md:h-64 w-full group mb-6 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
        <img
          src={communityData.banner || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"}
          alt={communityData.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute bottom-0 left-0 w-full z-20 px-4 sm:px-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-xs font-medium border border-white/30 bg-white/10 text-white backdrop-blur-sm">
                  Community
                </span>
                {user?._id === communityData?.creator && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-600/80 text-white backdrop-blur-sm">
                    Admin
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                {communityData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 text-xs md:text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{communityData.members?.length || 0} Members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Created {dayjs(communityData.createdAt).format("MMM D, YYYY")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={14} />
                  <span>Public Group</span>
                </div>
              </div>

              {communityData.description && (
                <div className="mt-2 max-w-2xl">
                  <p className="text-white/80 text-xs md:text-sm leading-relaxed line-clamp-2 drop-shadow-md">
                    {communityData.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              {/* Guidelines Button */}
              {communityData.rules && communityData.rules.length > 0 && (
                <button
                  onClick={() => setShowGuidelinesModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all font-medium text-xs md:text-sm shadow-lg"
                >
                  <FileText size={16} />
                  <span>Guidelines</span>
                </button>
              )}

              {/* Leave Button */}
              {user?._id !== communityData?.creator && (
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-md border border-white/10 transition-all font-medium text-xs md:text-sm shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut size={16} />
                  <span>Leave</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <CommunityMainSection />

      {/* Guidelines Modal */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowGuidelinesModal(false)}>
          <div
            className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-2xl ${isDarkMode ? "bg-dark-bg-secondary border border-white/10" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowGuidelinesModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"}`}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pr-10">
              <div className={`p-3 rounded-xl ${isDarkMode ? "bg-orange-500/10" : "bg-orange-50"}`}>
                <HiOutlineCheckBadge className={`text-2xl ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Community Guidelines
                </h2>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Please follow these rules to maintain a healthy community
                </p>
              </div>
            </div>

            {/* Rules List */}
            <ul className="space-y-4">
              {communityData.rules.map((rule, index) => (
                <li key={rule._id} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"}`}>
                    {index + 1}
                  </div>
                  <p className={`flex-1 leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {rule.rule}
                  </p>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className={`mt-6 pt-6 border-t ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
              <button
                onClick={() => setShowGuidelinesModal(false)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${isDarkMode
                  ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                  }`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      <LeaveModal
        show={showLeaveModal}
        toggle={() => setShowLeaveModal(false)}
        communityName={communityName}
      />
    </>
  );
};

export default CommunityHome;
