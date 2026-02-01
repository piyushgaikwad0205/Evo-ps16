import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPaperAirplane, HiUserGroup, HiCalendar, HiCheckCircle, HiXMark, HiBuildingLibrary } from "react-icons/hi2";
import { createGlobalNotification, getCollegesList } from "../../redux/api/adminAPI";
import { useTheme } from "../../contexts/ThemeContext";

const GlobalNotifications = () => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        targetAudience: "all",
        targetCollege: "",
        expiresAt: "",
    });
    const [colleges, setColleges] = useState([]);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadColleges();
    }, []);

    const loadColleges = async () => {
        try {
            const { data } = await getCollegesList();
            setColleges(data || []);
        } catch (error) {
            console.error("Failed to load colleges", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validation
        if ((formData.targetAudience === 'college' || formData.targetAudience === 'college_admins') && !formData.targetCollege) {
            setError("Please select a college");
            return;
        }

        const payload = { ...formData };
        if (!payload.expiresAt) delete payload.expiresAt;
        if (!payload.targetCollege) delete payload.targetCollege;

        const { error: apiError } = await createGlobalNotification(payload);
        if (apiError) {
            setError(apiError);
        } else {
            setSuccess("Global notification sent successfully!");
            setFormData({ title: "", message: "", targetAudience: "all", targetCollege: "", expiresAt: "" });
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Global Announcements
                </h1>
                <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Broadcast messages to users across the platform
                </p>
            </div>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Composer */}
                <div className={`flex-1 rounded-2xl shadow-sm border p-8 overflow-y-auto custom-scrollbar ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                    <div className="max-w-2xl mx-auto">
                        <div className={`mb-8 p-4 rounded-xl flex items-center gap-4 ${isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border border-indigo-100 text-indigo-600"}`}>
                            <div className={`p-3 rounded-full ${isDarkMode ? "bg-indigo-500/20" : "bg-white shadow-sm"}`}>
                                <HiPaperAirplane className="w-6 h-6 transform -rotate-45 translate-x-1" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Compose New Message</h3>
                                <p className="text-xs opacity-80">Send immediate alerts or scheduled updates.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDarkMode ? "bg-dark-bg border-white/10 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"}`}
                                    required
                                    placeholder="e.g. System Maintenance Update"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Target Audience</label>
                                    <div className="relative">
                                        <HiUserGroup className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                        <select
                                            name="targetAudience"
                                            value={formData.targetAudience}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none appearance-none transition-all ${isDarkMode ? "bg-dark-bg border-white/10 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"}`}
                                        >
                                            <option value="all">All Users (Global)</option>
                                            <option value="college">Specific College Users</option>
                                            <option value="admins">All Admins (Global)</option>
                                            <option value="college_admins">Specific College Admins</option>
                                            <option value="alumni">Alumni Only</option>
                                            <option value="general">Students Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Expires At (Optional)</label>
                                    <div className="relative">
                                        <HiCalendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                        <input
                                            type="datetime-local"
                                            name="expiresAt"
                                            value={formData.expiresAt}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${isDarkMode ? "bg-dark-bg border-white/10 text-white focus:border-indigo-500 [color-scheme:dark]" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {(formData.targetAudience === 'college' || formData.targetAudience === 'college_admins') && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Select Target College</label>
                                        <div className="relative">
                                            <HiBuildingLibrary className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-blue-500" : "text-blue-500"}`} />
                                            <select
                                                name="targetCollege"
                                                value={formData.targetCollege}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none appearance-none transition-all ${isDarkMode ? "bg-blue-500/10 border-blue-500/30 text-white focus:border-blue-500" : "bg-blue-50 border-blue-200 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"}`}
                                                required
                                            >
                                                <option value="">Choose an institution...</option>
                                                {colleges.map((col) => (
                                                    <option key={col._id} value={col._id}>
                                                        {col.name} ({col.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Message Content</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="6"
                                    className={`w-full px-4 py-3 rounded-xl border outline-none resize-none transition-all ${isDarkMode ? "bg-dark-bg border-white/10 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"}`}
                                    required
                                    placeholder="Type your announcement here..."
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <HiPaperAirplane className="w-5 h-5" />
                                    Send Announcement
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3"
                                >
                                    <HiCheckCircle className="w-5 h-5" />
                                    {success}
                                </motion.div>
                            )}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
                                >
                                    <HiXMark className="w-5 h-5" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Optional side panel for Preview or Tips */}
                <div className={`hidden xl:block w-80 rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                    <h3 className={`font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tips</h3>
                    <ul className={`space-y-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        <li className="flex gap-3">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                            <span>Keep titles concise and action-oriented for better engagement.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xs font-bold">2</div>
                            <span>Use specific targeting (College/Admins) to avoid notifying unrelated users.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-xs font-bold">3</div>
                            <span>Set an expiration date for time-sensitive announcements like maintenance or events.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GlobalNotifications;
