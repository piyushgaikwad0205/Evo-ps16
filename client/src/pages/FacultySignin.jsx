import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiAcademicCap, HiEnvelope, HiLockClosed, HiExclamationCircle } from "react-icons/hi2";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

const FacultySignin = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:4000/api/faculty/signin", form);

            // Store token and user data
            localStorage.setItem("facultyToken", res.data.token);
            localStorage.setItem("facultyUser", JSON.stringify(res.data.user));
            localStorage.setItem("facultyType", res.data.userType);

            // Route based on user type
            if (res.data.userType === "hod") {
                navigate("/hod/dashboard");
            } else if (res.data.userType === "teacher") {
                navigate("/teacher/dashboard");
            } else if (res.data.userType === "staff") {
                navigate("/staff/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Sign in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? "bg-dark-bg" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-md w-full p-8 rounded-2xl shadow-2xl backdrop-blur-xl ${isDarkMode ? "bg-dark-bg-secondary/90 border border-white/10" : "bg-white/90"}`}
            >
                {/* Logo/Icon */}
                <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl ${isDarkMode ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20" : "bg-gradient-to-br from-blue-100 to-purple-100"}`}>
                        <HiAcademicCap className={`w-12 h-12 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    </div>
                </div>

                {/* Title */}
                <h1 className={`text-3xl font-bold text-center mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Faculty & Staff Sign In
                </h1>
                <p className={`text-center mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Access your dashboard
                </p>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3"
                    >
                        <HiExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Email Address
                        </label>
                        <div className="relative">
                            <HiEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                placeholder="your.email@college.edu"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Password
                        </label>
                        <div className="relative">
                            <HiLockClosed className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className={`mt-6 pt-6 border-t ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
                    <p className={`text-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Your credentials are managed by the administration.
                        <br />
                        Contact admin if you need assistance.
                    </p>
                </div>

                {/* Back to Home */}
                <button
                    onClick={() => navigate("/")}
                    className={`mt-4 w-full py-2 text-sm ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                >
                    ← Back to Home
                </button>
            </motion.div>
        </div>
    );
};

export default FacultySignin;
