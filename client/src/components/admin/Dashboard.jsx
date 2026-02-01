import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    HiUsers,
    HiAcademicCap,
    HiDocumentText,
    HiBuildingLibrary,
    HiChartBar,
    HiArrowTrendingUp,
    HiBuildingOffice,
    HiBookOpen,
    HiBriefcase,
    HiUser,
    HiWrench,
    HiCalendar,
} from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const Dashboard = () => {
    const { isDarkMode } = useTheme();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCommunities: 0,
        totalAlumni: 0,
        totalSurveys: 0,
        totalClubs: 0,
        totalDepartments: 0,
        totalClasses: 0,
        totalHODs: 0,
        totalTeachers: 0,
        totalStaff: 0,
        totalEvents: 0,
        userGrowth: [],
        postActivity: [],
        topCommunities: [],
        topClubs: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await ADMIN_API.get("/stats");
            const data = res.data;

            setStats({
                totalUsers: data.totalUsers || 0,
                totalCommunities: data.totalCommunities || 0,
                totalAlumni: data.usersByRole?.alumni || 0,
                totalSurveys: data.totalSurveys || 0,
                totalClubs: data.totalClubs || 0,
                totalDepartments: data.totalDepartments || 0,
                totalClasses: data.totalClasses || 0,
                totalHODs: data.totalHODs || 0,
                totalTeachers: data.totalTeachers || 0,
                totalStaff: data.totalStaff || 0,
                totalEvents: data.totalEvents || 0,
                userGrowth: data.userGrowth || [],
                postActivity: data.postActivity || [],
                topCommunities: data.topCommunities || [],
                topClubs: data.topClubs || [],
            });
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem("admin");
                window.location.reload();
            }
        } finally {
            setLoading(false);
        }
    };

    const overviewData = [
        { name: "Total Users", icon: <HiUsers className="w-6 h-6" />, count: stats.totalUsers, color: "text-blue-600", iconBg: "bg-blue-500/10", gradient: "from-blue-500 to-blue-600" },
        { name: "Student Clubs", icon: <HiBuildingLibrary className="w-6 h-6" />, count: stats.totalClubs, color: "text-green-600", iconBg: "bg-green-500/10", gradient: "from-green-500 to-emerald-600" },
        { name: "Active Surveys", icon: <HiDocumentText className="w-6 h-6" />, count: stats.totalSurveys, color: "text-yellow-600", iconBg: "bg-yellow-500/10", gradient: "from-yellow-500 to-orange-500" },
        { name: "Alumni", icon: <HiAcademicCap className="w-6 h-6" />, count: stats.totalAlumni, color: "text-purple-600", iconBg: "bg-purple-500/10", gradient: "from-purple-500 to-purple-600" },
        { name: "Departments", icon: <HiBuildingOffice className="w-6 h-6" />, count: stats.totalDepartments, color: "text-indigo-600", iconBg: "bg-indigo-500/10", gradient: "from-indigo-500 to-indigo-600" },
        { name: "Classes", icon: <HiBookOpen className="w-6 h-6" />, count: stats.totalClasses, color: "text-teal-600", iconBg: "bg-teal-500/10", gradient: "from-teal-500 to-teal-600" },
        { name: "HODs", icon: <HiBriefcase className="w-6 h-6" />, count: stats.totalHODs, color: "text-red-600", iconBg: "bg-red-500/10", gradient: "from-red-500 to-red-600" },
        { name: "Teachers", icon: <HiUser className="w-6 h-6" />, count: stats.totalTeachers, color: "text-orange-600", iconBg: "bg-orange-500/10", gradient: "from-orange-500 to-orange-600" },
        { name: "Staff", icon: <HiWrench className="w-6 h-6" />, count: stats.totalStaff, color: "text-pink-600", iconBg: "bg-pink-500/10", gradient: "from-pink-500 to-rose-600" },
        { name: "Events", icon: <HiCalendar className="w-6 h-6" />, count: stats.totalEvents, color: "text-cyan-600", iconBg: "bg-cyan-500/10", gradient: "from-cyan-500 to-cyan-600" },
    ];

    // Helper to get max value for scaling
    const getMaxValue = (data) => Math.max(...data.map(d => d.count), 1);

    // Simple Line Chart SVG Path Generator
    const generateLinePath = (data, width, height) => {
        if (!data.length) return "";
        const max = getMaxValue(data);
        const stepX = width / (data.length - 1);

        const points = data.map((d, i) => {
            const x = i * stepX;
            const y = height - (d.count / max) * height; // Invert Y
            return `${x},${y}`;
        });

        return `M${points.join(" L")}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-border"></div>
                    <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {overviewData.map((item, index) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative overflow-hidden rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDarkMode ? "bg-dark-bg-secondary border-white/5 hover:border-white/10" : "bg-white border-gray-200 hover:border-blue-200"}`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-10 blur-2xl`}></div>
                        <div className="relative p-4">
                            <div className={`inline-flex p-3 ${item.iconBg} rounded-xl mb-3`}>
                                <div className={`${item.color}`}>
                                    {item.icon}
                                </div>
                            </div>
                            <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {item.count}
                            </h3>
                            <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {item.name}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart (Bar Chart) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-dark-border" : "bg-white border-gray-100"}`}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>User Growth (Last 7 Days)</h3>
                        <HiChartBar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {stats.userGrowth.map((d, i) => {
                            const height = (d.count / getMaxValue(stats.userGrowth)) * 100;
                            return (
                                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                    <div className="relative w-full bg-orange-100 dark:bg-orange-900/20 rounded-t-lg h-full flex items-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                            className="w-full bg-orange-500 rounded-t-lg relative group-hover:bg-orange-600 transition-colors"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {d.count}
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 rotate-0 truncate w-full text-center">
                                        {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Platform Activity (Line Chart) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-dark-border" : "bg-white border-gray-100"}`}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Post Activity (Last 7 Days)</h3>
                        <HiArrowTrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64 relative px-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map(y => (
                                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={isDarkMode ? "#374151" : "#e5e7eb"} strokeWidth="0.5" />
                            ))}

                            {/* Line Path */}
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                d={generateLinePath(stats.postActivity, 100, 100)}
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                            />

                            {/* Points */}
                            {stats.postActivity.map((d, i) => {
                                const max = getMaxValue(stats.postActivity);
                                const x = (i / (stats.postActivity.length - 1)) * 100;
                                const y = 100 - (d.count / max) * 100;
                                return (
                                    <g key={i} className="group">
                                        <circle cx={x} cy={y} r="1.5" fill="#f97316" className="hover:r-2 transition-all" />
                                        {/* Tooltip */}
                                        <foreignObject x={x - 10} y={y - 15} width="20" height="20" className="overflow-visible opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black text-white text-[8px] px-1 py-0.5 rounded text-center whitespace-nowrap transform -translate-x-1/2">
                                                {d.count}
                                            </div>
                                        </foreignObject>
                                    </g>
                                );
                            })}
                        </svg>
                        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {stats.postActivity.map((d, i) => (
                                <span key={i}>{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Top Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Communities */}
                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-dark-border" : "bg-white border-gray-100"}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Top Communities</h3>
                    <div className="space-y-4">
                        {stats.topCommunities.map((community, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                                        {index + 1}
                                    </span>
                                    <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{community.name}</span>
                                </div>
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{community.memberCount} members</span>
                            </div>
                        ))}
                        {stats.topCommunities.length === 0 && <p className="text-gray-500 text-sm">No communities found.</p>}
                    </div>
                </div>

                {/* Top Clubs */}
                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-dark-border" : "bg-white border-gray-100"}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Top Student Clubs</h3>
                    <div className="space-y-4">
                        {stats.topClubs.map((club, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}>
                                        {index + 1}
                                    </span>
                                    <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{club.name}</span>
                                </div>
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{club.memberCount} members</span>
                            </div>
                        ))}
                        {stats.topClubs.length === 0 && <p className="text-gray-500 text-sm">No clubs found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
