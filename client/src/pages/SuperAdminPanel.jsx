import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiChartPie,
    HiBuildingLibrary,
    HiBars3,
    HiXMark,
    HiPaperAirplane,
    HiShieldCheck,
    HiCog6Tooth,
} from "react-icons/hi2";

import GlobalDashboard from "../components/superadmin/GlobalDashboard";
import CollegeManagement from "../components/admin/CollegeManagement";
import GlobalLogs from "../components/superadmin/GlobalLogs";
import GlobalNotifications from "../components/superadmin/GlobalNotifications";
import CommunityManagement from "../components/admin/CommunityManagement";
import { logoutAction } from "../redux/actions/adminActions";
import { useTheme } from "../contexts/ThemeContext";

const SuperAdminPanel = () => {
    const { isDarkMode } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Global Dashboard");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const adminData = localStorage.getItem("admin");
        if (!adminData) {
            navigate("/admin/signin");
            return;
        }
        try {
            const parsed = JSON.parse(adminData);
            if (parsed.user?.role !== "superadmin") {
                navigate("/admin");
            }
        } catch (e) {
            navigate("/admin/signin");
        }
    }, [navigate]);

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

    const tabs = [
        { name: "Global Dashboard", icon: <HiChartPie className="w-5 h-5" />, desc: "Global analytics & user management" },
        { name: "College Management", icon: <HiBuildingLibrary className="w-5 h-5" />, desc: "Manage colleges" },
        { name: "Community Management", icon: <HiShieldCheck className="w-5 h-5" />, desc: "Manage communities" },
        { name: "Global Logs", icon: <HiChartPie className="w-5 h-5" />, desc: "System logs" },
        { name: "Global Notifications", icon: <HiPaperAirplane className="w-5 h-5" />, desc: "Send announcements" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "Global Dashboard": return <GlobalDashboard onNavigate={setActiveTab} />;
            case "College Management": return <CollegeManagement />;
            case "Community Management": return <CommunityManagement />;
            case "Global Logs": return <GlobalLogs />;
            case "Global Notifications": return <GlobalNotifications />;
            default: return <GlobalDashboard onNavigate={setActiveTab} />;
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
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/20`}>
                                S
                            </div>
                            <div>
                                <h1 className={`text-lg font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Super Admin</h1>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Platform Management</p>
                            </div>
                        </div>
                    </div>

                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => setShowProfileMenu((s) => !s)}
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all duration-200 ${isDarkMode
                                ? "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <img className="h-8 w-8 rounded-full ring-2 ring-white/10" src="https://ui-avatars.com/api/?name=Super+Admin&background=random" alt="Admin" />
                            <span className="hidden sm:block text-sm font-medium pr-1">Super Admin</span>
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
                                        <p className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>super@campusconnect.com</p>
                                    </div>
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
                                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        <span className={`mr-3 h-5 w-5 transition-colors ${isActive
                                            ? "text-indigo-600 dark:text-indigo-400"
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
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 text-white font-bold">S</div>
                                        <h1 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Super Admin</h1>
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
                                                ? (isDarkMode ? "bg-indigo-600 text-white shadow-lg" : "bg-indigo-50 text-indigo-700")
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

export default SuperAdminPanel;
