import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logoutAction } from "../../redux/actions/adminActions";
import ButtonLoadingSpinner from "../loader/ButtonLoadingSpinner";
import { BiLogOut } from "react-icons/bi";
import { BsPeople, BsWindowStack } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { FaGraduationCap } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { SiOpenai } from "react-icons/si";
import { MdGroups } from "react-icons/md";
import { useTheme } from "../../contexts/ThemeContext";

const Tab = ({ activeTab, handleTabClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loggingOut, setLoggingOut] = useState(false);
  const { isDarkMode } = useTheme();

  const handleLogout = async () => {
    setLoggingOut(true);
    await dispatch(logoutAction()).then(() => {
      navigate("/admin/signin");
    });
    setLoggingOut(false);
  };

  const tabs = [
    {
      id: "logs",
      label: "Logs",
      icon: BsWindowStack,
      description: "System logs and activity"
    },
    {
      id: "settings",
      label: "Settings",
      icon: IoSettingsOutline,
      description: "Platform configuration"
    },
    {
      id: "Community Management",
      label: "Community Management",
      icon: BsPeople,
      description: "Manage communities and groups"
    },
    {
      id: "Alumni Management",
      label: "Alumni Management",
      icon: FaGraduationCap,
      description: "Alumni database and verification"
    },
    {
      id: "Survey Management",
      label: "Survey Management",
      icon: IoSettingsOutline,
      description: "Create and manage surveys"
    },
    {
      id: "Club Management",
      label: "Club Management",
      icon: MdGroups,
      description: "Student clubs and organizations"
    },
    {
      id: "Notifications",
      label: "Notifications",
      icon: IoNotificationsOutline,
      description: "System notifications"
    },
    {
      id: "AI Assistant",
      label: "AI Assistant",
      icon: SiOpenai,
      description: "AI-powered admin tools"
    }
  ];

  return (
    <div className={`border-b sticky top-0 left-0 z-30 rounded-md transition-all duration-200 ${
      isDarkMode 
        ? 'bg-dark-bg-secondary border-dark-border' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-wrap items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isDarkMode ? 'bg-green-400' : 'bg-green-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Admin Panel
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <div key={tab.id} className="relative group">
                <button
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'text-gray-300 hover:text-white hover:bg-dark-bg-tertiary'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {tab.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            );
          })}
          
          {/* Logout Button */}
          <div className="relative group">
            <button
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "logout"
                  ? isDarkMode
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-red-500 text-white shadow-lg'
                  : isDarkMode
                    ? 'text-red-400 hover:text-white hover:bg-red-600'
                    : 'text-red-600 hover:text-white hover:bg-red-500'
              }`}
              onClick={handleLogout}
            >
              <BiLogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {loggingOut ? (
                  <ButtonLoadingSpinner loadingText={"Logging out..."} />
                ) : (
                  "Logout"
                )}
              </span>
            </button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Sign out of admin panel
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tab;
