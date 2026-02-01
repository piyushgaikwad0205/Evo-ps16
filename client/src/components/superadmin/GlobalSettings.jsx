import React, { useState, useEffect } from "react";
import { HiCheck } from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const GlobalSettings = () => {
    const { isDarkMode } = useTheme();
    const [settings, setSettings] = useState({
        platformName: "Campus Connects",
        maintenanceMode: false,
        allowNewRegistrations: true,
        defaultTheme: "light",
        security: {
            maxLoginAttempts: 5,
            passwordPolicy: {
                minLength: 8,
                requireSpecialChar: true
            }
        },
        features: {
            aiModeration: true,
            globalEvents: true
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await ADMIN_API.get("/super/settings");
            if (res.data) setSettings(res.data);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await ADMIN_API.put("/super/settings", settings);
            alert("Settings updated successfully");
        } catch (error) {
            alert("Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Platform Settings</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                    <HiCheck className="w-5 h-5" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} space-y-6`}>
                <div>
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Platform Name</label>
                            <input
                                value={settings.platformName}
                                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Default Theme</label>
                            <select
                                value={settings.defaultTheme}
                                onChange={(e) => setSettings({ ...settings, defaultTheme: e.target.value })}
                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 border-gray-200 dark:border-white/5">
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Access Control</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Maintenance Mode (Disable all access)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.allowNewRegistrations}
                                onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Allow New College Registrations</span>
                        </label>
                    </div>
                </div>

                <div className="border-t pt-6 border-gray-200 dark:border-white/5">
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Security Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Max Login Attempts</label>
                            <input
                                type="number"
                                value={settings.security?.maxLoginAttempts}
                                onChange={(e) => setSettings({ ...settings, security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) } })}
                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Min Password Length</label>
                            <input
                                type="number"
                                value={settings.security?.passwordPolicy?.minLength}
                                onChange={(e) => setSettings({ ...settings, security: { ...settings.security, passwordPolicy: { ...settings.security.passwordPolicy, minLength: parseInt(e.target.value) } } })}
                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalSettings;
