import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HiWrench,
    HiClock,
    HiCalendar,
    HiArrowRightOnRectangle,
    HiBuildingOffice2,
    HiCheckCircle,
} from "react-icons/hi2";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

const StaffDashboard = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("facultyToken");
                const userType = localStorage.getItem("facultyType");

                if (!token || userType !== "staff") {
                    navigate("/faculty/signin");
                    return;
                }

                const res = await axios.get("http://localhost:4000/api/faculty/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.userType !== "staff") {
                    navigate("/faculty/signin");
                    return;
                }

                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
                navigate("/faculty/signin");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("facultyToken");
        localStorage.removeItem("facultyUser");
        localStorage.removeItem("facultyType");
        navigate("/faculty/signin");
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) return null;

    const stats = [
        { label: "Department", value: user.department || "N/A", icon: HiBuildingOffice2, color: "blue" },
        { label: "Role", value: user.role || "N/A", icon: HiWrench, color: "purple" },
        { label: "Shift", value: user.shift || "N/A", icon: HiClock, color: "orange" },
        { label: "Status", value: user.isActive ? "Active" : "Inactive", icon: HiCheckCircle, color: user.isActive ? "green" : "red" },
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
            {/* Header */}
            <header className={`sticky top-0 z-10 backdrop-blur-xl border-b ${isDarkMode ? "bg-dark-bg/80 border-white/10" : "bg-white/80 border-gray-200"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-orange-900/20" : "bg-orange-100"}`}>
                                <HiWrench className={`w-8 h-8 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    Staff Dashboard
                                </h1>
                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    Welcome back, {user.name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                            <HiArrowRightOnRectangle className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                </div>
                                <div>
                                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</p>
                                    <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Profile Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}
                >
                    <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Profile Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Employee ID</label>
                            <p className={`mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{user.employeeId}</p>
                        </div>
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Email</label>
                            <p className={`mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{user.email}</p>
                        </div>
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Phone</label>
                            <p className={`mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{user.phone || "N/A"}</p>
                        </div>
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Gender</label>
                            <p className={`mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{user.gender || "N/A"}</p>
                        </div>
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Joining Date</label>
                            <p className={`mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                        <div>
                            <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Date of Birth</label>
                            <p className={`mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                        {user.address && (
                            <div className="md:col-span-2">
                                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Address</label>
                                <p className={`mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{user.address}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} hover:shadow-lg transition-shadow cursor-pointer`}>
                        <HiClock className={`w-8 h-8 mb-3 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>My Schedule</h3>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>View your work schedule</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} hover:shadow-lg transition-shadow cursor-pointer`}>
                        <HiCalendar className={`w-8 h-8 mb-3 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Leave Requests</h3>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Manage your leave applications</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} hover:shadow-lg transition-shadow cursor-pointer`}>
                        <HiWrench className={`w-8 h-8 mb-3 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tasks</h3>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>View and manage your tasks</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default StaffDashboard;
