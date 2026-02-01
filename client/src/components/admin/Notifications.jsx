import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiBell,
  HiTrash,
  HiPaperAirplane,
  HiCalendar,
  HiUserGroup,
  HiInformationCircle,
  HiXMark,
  HiCheckCircle,
} from "react-icons/hi2";
import { getNotifications, createNotification, deleteNotification } from "../../redux/api/adminAPI";
import { useTheme } from "../../contexts/ThemeContext";

const Notifications = () => {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "all",
    expiresAt: "",
  });

  const fetchNotifications = async () => {
    setLoading(true);
    const { error, data } = await getNotifications();
    if (error) setError(error);
    else setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = { ...formData };
    if (!payload.expiresAt) delete payload.expiresAt;

    const { error } = await createNotification(payload);
    if (error) {
      setError(error);
    } else {
      setFormData({ title: "", message: "", targetAudience: "all", expiresAt: "" });
      fetchNotifications();
      setSuccess("Notification sent successfully!");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    const { error } = await deleteNotification(id);
    if (error) setError(error);
    else fetchNotifications();
  };

  const getAudienceLabel = (audience) => {
    switch (audience) {
      case "all": return "All Users";
      case "alumni": return "Alumni Only";
      case "general": return "Students Only";
      case "moderator": return "Moderators";
      default: return audience;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Notifications Center
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Manage and send announcements to your community
          </p>
        </div>
        <div className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
          <HiBell className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Notification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-1 p-6 rounded-2xl shadow-sm border h-fit ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"
            }`}
        >
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <HiPaperAirplane className="w-5 h-5 text-blue-500" />
            Send New Notification
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., System Maintenance"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode
                    ? "bg-dark-bg border-white/10 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Target Audience
              </label>
              <div className="relative">
                <HiUserGroup className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none ${isDarkMode
                      ? "bg-dark-bg border-white/10 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                >
                  <option value="all">All Users</option>
                  <option value="alumni">Alumni</option>
                  <option value="general">General Users</option>
                  <option value="moderator">Moderators</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                rows={4}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none ${isDarkMode
                    ? "bg-dark-bg border-white/10 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Expires At (Optional)
              </label>
              <div className="relative">
                <HiCalendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode
                      ? "bg-dark-bg border-white/10 text-white placeholder-gray-500 [color-scheme:dark]"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <HiPaperAirplane className="w-5 h-5 transform rotate-90" />
              Send Notification
            </button>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 p-3 rounded-lg"
                >
                  <HiCheckCircle className="w-5 h-5" />
                  {success}
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg"
                >
                  <HiXMark className="w-5 h-5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <HiBell className="w-5 h-5 text-purple-500" />
            Active Notifications
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className={`text-center py-12 rounded-2xl border border-dashed ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
              <HiInformationCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`text-lg font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                No active notifications
              </p>
              <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                Create a new notification to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {notifications.map((n) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${isDarkMode
                        ? "bg-dark-bg-secondary border-white/5 hover:border-white/10"
                        : "bg-white border-gray-200 hover:border-blue-200"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {n.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                            }`}>
                            {getAudienceLabel(n.targetAudience)}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {n.message}
                        </p>
                        <div className={`flex items-center gap-4 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          <span className="flex items-center gap-1">
                            <HiCalendar className="w-3.5 h-3.5" />
                            Sent: {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                          {n.expiresAt && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <HiCalendar className="w-3.5 h-3.5" />
                              Expires: {new Date(n.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(n._id)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode
                            ? "text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                            : "text-gray-400 hover:bg-red-50 hover:text-red-600"
                          }`}
                        title="Delete Notification"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;