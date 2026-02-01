import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HODManagement from "../components/admin/HODManagement";
import TeacherManagement from "../components/admin/TeacherManagement";
import StaffManagement from "../components/admin/StaffManagement";

import {
  HiUsers,
  HiCog6Tooth,
  HiChartPie,
  HiShieldCheck,
  HiUserGroup,
  HiBell,
  HiAcademicCap,
  HiBars3,
  HiXMark,
  HiCalendar,
  HiUser,
  HiBookOpen,
  HiWrench,
} from "react-icons/hi2";

import Logs from "../components/admin/Logs";
import Settings from "../components/admin/Settings";
import CommunityManagement from "../components/admin/CommunityManagement";
import AlumniManagement from "../components/admin/AlumniManagement";
import SurveyManagement from "../components/admin/SurveyManagement";
import ClubManagement from "../components/admin/ClubManagement";
import DepartmentManagement from "../components/admin/DepartmentManagement";
import ClassManagement from "../components/admin/ClassManagement";
import EventManagement from "../components/admin/EventManagement";
import Notifications from "../components/admin/Notifications";
import Dashboard from "../components/admin/Dashboard";
import UserManagement from "../components/admin/UserManagement";
import { logoutAction } from "../redux/actions/adminActions";
import { useTheme } from "../contexts/ThemeContext";

const AdminPanel = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const adminPanelError = useSelector((state) => state.admin.error);

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // const [adminRole, setAdminRole] = useState("admin");

  // Check if admin is authenticated
  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (!adminData) {
      navigate("/admin/signin");
    } else {
      try {
        const parsed = JSON.parse(adminData);
        if (parsed.user) {
          setCurrentAdmin(parsed.user);
        }
      } catch (e) {
        console.error("Error parsing admin data", e);
      }
    }
  }, [navigate]);

  const [currentAdmin, setCurrentAdmin] = useState(null);

  const getTabs = () => {
    let currentTabs = [
      { name: "Dashboard", icon: <HiChartPie className="w-5 h-5" />, desc: "Overview and analytics" },
      { name: "User Management", icon: <HiUsers className="w-5 h-5" />, desc: "Manage users, suspend, delete" },
      { name: "Logs", icon: <HiChartPie className="w-5 h-5" />, desc: "Monitor system activity and performance" },
      { name: "Settings", icon: <HiCog6Tooth className="w-5 h-5" />, desc: "Configure platform settings and security" },
    ];

    if (currentAdmin?.role === "superadmin") {
      currentTabs.push({ name: "Community Management", icon: <HiShieldCheck className="w-5 h-5" />, desc: "Manage user communities and reports" });
    }

    currentTabs.push(
      { name: "Alumni Management", icon: <HiAcademicCap className="w-5 h-5" />, desc: "Verify alumni and manage database" },
      { name: "Survey Management", icon: <HiChartPie className="w-5 h-5" />, desc: "Create and analyze surveys" },
      { name: "Club Management", icon: <HiUserGroup className="w-5 h-5" />, desc: "Manage student clubs and activities" },
      { name: "Department Management", icon: <HiAcademicCap className="w-5 h-5" />, desc: "Manage college departments" },
      { name: "Class Management", icon: <HiAcademicCap className="w-5 h-5" />, desc: "Manage classes and sections" },
      { name: "HOD Management", icon: <HiUser className="w-5 h-5" />, desc: "Manage Heads of Department" },
      { name: "Teacher Management", icon: <HiBookOpen className="w-5 h-5" />, desc: "Manage Teachers" },
      { name: "Staff Management", icon: <HiWrench className="w-5 h-5" />, desc: "Manage Staff" },
      { name: "Event Management", icon: <HiCalendar className="w-5 h-5" />, desc: "Create and manage events" },
      { name: "Notifications", icon: <HiBell className="w-5 h-5" />, desc: "Send and manage notifications" },
    );

    return currentTabs;
  };

  const tabs = getTabs();

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await dispatch(logoutAction());
    setLoggingOut(false);
    window.location.href = "/admin/signin";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dashboard": return <Dashboard />;
      case "User Management": return <UserManagement />;
      case "Logs": return <Logs />;
      case "Settings": return <Settings />;
      case "Community Management": return <CommunityManagement />;
      case "Alumni Management": return <AlumniManagement />;
      case "Survey Management": return <SurveyManagement />;
      case "Club Management": return <ClubManagement />;
      case "Department Management": return <DepartmentManagement />;
      case "Class Management": return <ClassManagement />;
      case "HOD Management": return <HODManagement />;
      case "Teacher Management": return <TeacherManagement />;
      case "Staff Management": return <StaffManagement />;
      case "Event Management": return <EventManagement />;
      case "Notifications": return <Notifications />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isDarkMode
        ? "bg-dark-bg/80 backdrop-blur-xl border-b border-white/5"
        : "bg-white/80 backdrop-blur-xl border-b border-gray-200/50"
        }`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${isDarkMode ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
                }`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <HiBars3 className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              {currentAdmin?.college?.logo ? (
                <img src={currentAdmin.college.logo} alt="College Logo" className="w-10 h-10 rounded-lg object-cover shadow-sm bg-white" />
              ) : (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/20`}>
                  {currentAdmin?.college?.name?.charAt(0) || "A"}
                </div>
              )}
              <div>
                <h1 className={`text-lg font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {currentAdmin?.college?.name || "Campus Connect Portal"}
                </h1>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {currentAdmin?.role === "superadmin" ? "Super Admin Console" : "College Administration"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <button
              onClick={() => setActiveTab("Notifications")}
              className={`p-2 rounded-full transition-colors relative ${isDarkMode
                ? "text-gray-300 hover:bg-white/10 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              title="Notifications"
            >
              <HiBell className="w-6 h-6" />
              {/* Optional: Add a badge if there are unread notifications */}
              {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-bg"></span> */}
            </button>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu((s) => !s)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all duration-200 ${isDarkMode
                  ? "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <div className="relative">
                  <img className="h-8 w-8 rounded-full ring-2 ring-white/10" src={`https://ui-avatars.com/api/?name=${currentAdmin?.username || "Admin"}&background=random`} alt="Admin" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <span className="hidden sm:block text-sm font-medium pr-1">{currentAdmin?.username || "Administrator"}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-100"
                      }`}
                  >
                    <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                      <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Signed in as</p>
                      <p className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{currentAdmin?.username || "User"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("Settings");
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${isDarkMode
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <HiUserGroup className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${isDarkMode
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-red-600 hover:bg-red-50"
                        }`}
                    >
                      <HiCog6Tooth className="w-4 h-4" />
                      {loggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[60px] h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 border-r transition-colors duration-300 overflow-y-auto custom-scrollbar ${isDarkMode ? "bg-dark-bg/50 border-white/5" : "bg-white/50 border-gray-200/50"} backdrop-blur-md`}>
          <div className="flex-1 py-6 px-4">
            <nav className="space-y-1.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left ${isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                  >
                    <span className={`mr-3 h-5 w-5 transition-colors ${isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      }`}>
                      {tab.icon}
                    </span>
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed top-0 left-0 bottom-0 w-72 flex-shrink-0 h-screen p-6 z-[60] shadow-2xl overflow-y-auto ${isDarkMode ? "bg-dark-bg border-r border-white/10" : "bg-white border-r border-gray-200"
                  }`}
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white font-bold">A</div>
                    <h1 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>College Portal</h1>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${isDarkMode ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-gray-100"}`}>
                    <HiXMark className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex flex-col gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => {
                        setActiveTab(tab.name);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${activeTab === tab.name
                        ? (isDarkMode ? "bg-blue-600 text-white shadow-lg" : "bg-blue-50 text-blue-700")
                        : (isDarkMode ? "text-gray-400 hover:bg-white/5 hover:text-gray-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                        }`}
                    >
                      {tab.icon} <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-black/20">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200/60"
              }`}>
              {renderTabContent()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
