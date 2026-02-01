import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCog6Tooth,
  HiShieldCheck,
  HiClock,
  HiServer,
  HiCheckCircle,
  HiUser,
} from "react-icons/hi2";
import {
  getServicePreferencesAction,
  updateServicePreferencesAction,
  updateAdminProfileAction,
} from "../../redux/actions/adminActions";
import { useTheme } from "../../contexts/ThemeContext";

const Settings = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);

  const servicePreferences = useSelector(
    (state) => state.admin?.servicePreferences
  );

  const [usePerspectiveAPI, setUsePerspectiveAPI] = useState(false);
  const [
    categoryFilteringServiceProvider,
    setCategoryFilteringServiceProvider,
  ] = useState("");
  const [categoryFilteringRequestTimeout, setCategoryFilteringRequestTimeout] =
    useState(0);

  const [adminProfile, setAdminProfile] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    dispatch(getServicePreferencesAction());
    const adminData = JSON.parse(localStorage.getItem("admin"));
    if (adminData?.result) {
      setAdminProfile(prev => ({
        ...prev,
        name: adminData.result.name || "",
        email: adminData.result.email || ""
      }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (servicePreferences) {
      setUsePerspectiveAPI(servicePreferences.usePerspectiveAPI);
      setCategoryFilteringServiceProvider(
        servicePreferences.categoryFilteringServiceProvider
      );
      setCategoryFilteringRequestTimeout(
        servicePreferences.categoryFilteringRequestTimeout
      );
      setIsLoading(false);
    }
  }, [servicePreferences]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setIsSuccess(false);
    try {
      await dispatch(
        updateServicePreferencesAction({
          usePerspectiveAPI,
          categoryFilteringServiceProvider,
          categoryFilteringRequestTimeout,
        })
      );
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (adminProfile.password && adminProfile.password !== adminProfile.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsProfileUpdating(true);
    setIsProfileSuccess(false);

    try {
      const updateData = {
        name: adminProfile.name,
        email: adminProfile.email,
      };
      if (adminProfile.password) {
        updateData.password = adminProfile.password;
      }

      await dispatch(updateAdminProfileAction(updateData));
      setIsProfileSuccess(true);
      setAdminProfile(prev => ({ ...prev, password: "", confirmPassword: "" }));
      setTimeout(() => setIsProfileSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setIsProfileUpdating(false);
    }
  };

  if (isLoading || !servicePreferences) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Platform Settings
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Configure system preferences and integrations
          </p>
        </div>
        <div className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
          <HiCog6Tooth className="w-6 h-6 animate-spin-slow" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"
            }`}
        >
          <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <HiServer className="w-5 h-5 text-purple-500" />
            Service Preferences
          </h2>

          <div className="space-y-6">
            {/* Perspective API Toggle */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                    <HiShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Content Moderation</h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Use Perspective API for automatic content filtering</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={usePerspectiveAPI}
                    onChange={(e) => setUsePerspectiveAPI(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Service Provider Select */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Category Filtering Provider
              </label>
              <div className="relative">
                <select
                  value={categoryFilteringServiceProvider}
                  onChange={(e) => setCategoryFilteringServiceProvider(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                    ? "bg-dark-bg border-white/10 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                >
                  <option value="">Select a provider</option>
                  <option value="TextRazor">TextRazor</option>
                  <option value="InterfaceAPI">InterfaceAPI</option>
                  <option value="ClassifierAPI">ClassifierAPI</option>
                  <option value="disabled">Disabled</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Timeout Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Request Timeout (ms)
              </label>
              <div className="relative">
                <HiClock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                <input
                  type="number"
                  value={categoryFilteringRequestTimeout}
                  min={0}
                  max={500000}
                  onChange={(e) => setCategoryFilteringRequestTimeout(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                    ? "bg-dark-bg border-white/10 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-green-500 text-sm font-medium"
                  >
                    <HiCheckCircle className="w-5 h-5" />
                    Settings saved!
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all transform active:scale-95 ${isUpdating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20"
                  }`}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Admin Profile Update */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"
            }`}
        >
          <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <HiUser className="w-5 h-5 text-blue-500" />
            Admin Profile
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Name
              </label>
              <input
                type="text"
                value={adminProfile.name}
                onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                  ? "bg-dark-bg border-white/10 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Email
              </label>
              <input
                type="email"
                value={adminProfile.email}
                onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                  ? "bg-dark-bg border-white/10 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                New Password (optional)
              </label>
              <input
                type="password"
                value={adminProfile.password}
                onChange={(e) => setAdminProfile({ ...adminProfile, password: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                  ? "bg-dark-bg border-white/10 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                placeholder="Leave blank to keep current"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={adminProfile.confirmPassword}
                onChange={(e) => setAdminProfile({ ...adminProfile, confirmPassword: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode
                  ? "bg-dark-bg border-white/10 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <AnimatePresence>
                {isProfileSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-green-500 text-sm font-medium"
                  >
                    <HiCheckCircle className="w-5 h-5" />
                    Profile updated!
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isProfileUpdating}
                className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all transform active:scale-95 ${isProfileUpdating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20"
                  }`}
              >
                {isProfileUpdating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
