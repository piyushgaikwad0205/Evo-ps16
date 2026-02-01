import { useState } from "react";
import ReportedPosts from "../moderator/ReportedPosts";
import MembersList from "../moderator/MembersList";
import BannerMembersList from "../moderator/BannerMembersList";
import { useTheme } from "../../contexts/ThemeContext";
import { AlertTriangle, Users, Ban } from "lucide-react";

const MainSection = () => {
  const [activeTab, setActiveTab] = useState("Reported Posts");
  const { isDarkMode } = useTheme();

  const tabs = [
    { name: "Reported Posts", icon: AlertTriangle },
    { name: "Members", icon: Users },
    { name: "Banned Users", icon: Ban }
  ];

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"
      }`}>
      {/* Premium Tab Navigation */}
      <div className={`border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}>
        <div className="flex flex-col md:flex-row">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold text-sm transition-all duration-200 relative ${isActive
                    ? isDarkMode
                      ? "text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                      : "text-blue-600 bg-blue-50"
                    : isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-white/5"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === "Reported Posts" && <ReportedPosts />}
        {activeTab === "Members" && <MembersList />}
        {activeTab === "Banned Users" && <BannerMembersList />}
      </div>
    </div>
  );
};

export default MainSection;
