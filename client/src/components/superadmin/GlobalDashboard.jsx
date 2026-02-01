import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    HiAcademicCap,
    HiDocumentText,
    HiShieldCheck,
    HiChartBarSquare,
    HiUserCircle,
    HiUserGroup,
    HiBriefcase,
    HiIdentification
} from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";
import GlobalUserManagement from "./GlobalUserManagement";

const GlobalDashboard = ({ initialFilter, onNavigate }) => {
    const { isDarkMode } = useTheme();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("overview");
    const [userFilter, setUserFilter] = useState(null); // To pass filter to UserManagement

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await ADMIN_API.get("/super/stats");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load global stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    const platformCards = [
        { title: "Total Colleges", value: stats?.totalColleges || 0, icon: <HiAcademicCap />, color: "text-blue-600", bg: "bg-blue-100", darkBg: "bg-blue-500/10", gradient: "from-blue-500 to-blue-600" },
        { title: "Total Admins", value: stats?.totalAdmins || 0, icon: <HiShieldCheck />, color: "text-purple-600", bg: "bg-purple-100", darkBg: "bg-purple-500/10", gradient: "from-purple-500 to-purple-600" },
        { title: "Total Posts", value: stats?.totalPosts || 0, icon: <HiDocumentText />, color: "text-orange-600", bg: "bg-orange-100", darkBg: "bg-orange-500/10", gradient: "from-orange-500 to-orange-600" },
        { title: "Active Colleges", value: stats?.activeColleges || 0, icon: <HiAcademicCap />, color: "text-teal-600", bg: "bg-teal-100", darkBg: "bg-teal-500/10", gradient: "from-teal-500 to-teal-600" },
        { title: "Total Teachers", value: stats?.totalTeachers || 0, icon: <HiUserGroup />, color: "text-indigo-600", bg: "bg-indigo-100", darkBg: "bg-indigo-500/10", gradient: "from-indigo-500 to-indigo-600" },
        { title: "Total Staff", value: stats?.totalStaff || 0, icon: <HiBriefcase />, color: "text-pink-600", bg: "bg-pink-100", darkBg: "bg-pink-500/10", gradient: "from-pink-500 to-pink-600" },
        { title: "Total HODs", value: stats?.totalHODs || 0, icon: <HiIdentification />, color: "text-amber-600", bg: "bg-amber-100", darkBg: "bg-amber-500/10", gradient: "from-amber-500 to-amber-600" },
    ];



    const sections = [
        { id: "overview", name: "Overview", icon: <HiChartBarSquare className="w-5 h-5" /> },
        { id: "users", name: "User Management", icon: <HiUserCircle className="w-5 h-5" /> },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Global Dashboard
                    </h1>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Monitor and manage your entire platform from one place
                    </p>
                </div>
            </div>

            {/* Section Tabs */}
            <div className={`flex gap-2 p-1 rounded-xl ${isDarkMode ? "bg-dark-bg-secondary" : "bg-gray-100"}`}>
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => {
                            setActiveSection(section.id);
                            if (section.id === "overview") setUserFilter(null);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeSection === section.id
                            ? isDarkMode
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white text-blue-600 shadow-md"
                            : isDarkMode
                                ? "text-gray-400 hover:text-white hover:bg-white/5"
                                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                            }`}
                    >
                        {section.icon}
                        <span>{section.name}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeSection === "overview" ? (
                <div className="space-y-6">
                    {/* Platform Stats */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                                <HiAcademicCap className="w-5 h-5 text-blue-600" />
                            </div>
                            Platform Overview
                            <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>(Click to manage)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {platformCards.map((card, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        if (card.title.includes("College") && onNavigate) {
                                            onNavigate("College Management");
                                        }
                                    }}
                                    className={`group relative p-6 rounded-2xl border ${card.title.includes("College") ? "cursor-pointer" : ""
                                        } ${isDarkMode ? "bg-dark-bg-secondary border-white/5 hover:border-white/10" : "bg-white border-gray-200 hover:border-gray-300"} shadow-sm hover:shadow-lg transition-all`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{card.title}</p>
                                            <p className={`text-3xl font-bold mt-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{card.value}</p>
                                            {card.title.includes("College") && (
                                                <p className={`text-xs mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                    Click to manage →
                                                </p>
                                            )}
                                        </div>
                                        <div className={`p-3 rounded-xl ${isDarkMode ? card.darkBg : card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                                            <span className="text-2xl">{card.icon}</span>
                                        </div>
                                    </div>
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>


                </div>
            ) : (
                /* User Management Section */
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`rounded-2xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} shadow-sm overflow-hidden`}
                >
                    <GlobalUserManagement initialFilter={userFilter} />
                </motion.div>
            )}
        </div>
    );
};

export default GlobalDashboard;
