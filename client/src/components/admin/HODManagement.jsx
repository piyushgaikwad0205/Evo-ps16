import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiAcademicCap,
    HiPlus,
    HiTrash,
    HiXMark,
    HiMagnifyingGlass,
    HiEnvelope,
    HiCheckCircle,
    HiXCircle,
    HiUser,
    HiEye,
    HiEyeSlash,
} from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const HODManagement = () => {
    const { isDarkMode } = useTheme();
    const [hods, setHods] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedHOD, setSelectedHOD] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterActive, setFilterActive] = useState("all");
    const [stats, setStats] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        employeeId: "",
        qualification: "",
        specialization: "",
        experience: 0,
        joiningDate: new Date().toISOString().split("T")[0],
        dateOfBirth: "",
        gender: "",
        address: "",
        isActive: true,
        password: "",
    });

    const loadHODs = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterDepartment !== "all") params.department = filterDepartment;
            if (filterActive !== "all") params.isActive = filterActive === "active";

            const res = await ADMIN_API.get("/hods", { params });
            setHods(res.data?.hods || []);
        } catch (error) {
            console.error("Failed to load HODs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const res = await ADMIN_API.get("/departments");
            setDepartments(res.data?.departments || []);
        } catch (error) {
            console.error("Failed to load departments:", error);
        }
    };

    const loadStats = async () => {
        try {
            const res = await ADMIN_API.get("/hods/stats");
            setStats(res.data?.stats || null);
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    useEffect(() => {
        loadHODs();
        loadDepartments();
        loadStats();
    }, [searchTerm, filterDepartment, filterActive]);

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            phone: "",
            department: "",
            employeeId: "",
            qualification: "",
            specialization: "",
            experience: 0,
            joiningDate: new Date().toISOString().split("T")[0],
            dateOfBirth: "",
            gender: "",
            address: "",
            isActive: true,
            password: "",
        });
    };

    const onCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.employeeId || !form.department || !form.password) {
            alert("Name, email, employee ID, department, and password are required");
            return;
        }
        setIsSaving(true);

        try {
            await ADMIN_API.post("/hods", form);
            await loadHODs();
            await loadStats();
            resetForm();
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating HOD:", error);
            alert(error.response?.data?.message || "Failed to create HOD");
        } finally {
            setIsSaving(false);
        }
    };

    const onUpdate = async () => {
        if (!selectedHOD) return;
        setIsSaving(true);

        try {
            await ADMIN_API.put(`/hods/${selectedHOD._id}`, selectedHOD);
            await loadHODs();
            await loadStats();
            alert("HOD updated successfully");
        } catch (error) {
            console.error("Error updating HOD:", error);
            alert(error.response?.data?.message || "Failed to update HOD");
        } finally {
            setIsSaving(false);
        }
    };

    const onDelete = async () => {
        if (!selectedHOD) return;
        if (!window.confirm(`Delete HOD "${selectedHOD.name}"? This cannot be undone.`)) return;
        setIsSaving(true);
        try {
            await ADMIN_API.delete(`/hods/${selectedHOD._id}`);
            await loadHODs();
            await loadStats();
            setSelectedHOD(null);
        } catch (error) {
            console.error("Error deleting HOD:", error);
            alert("Failed to delete HOD");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        HOD Management
                    </h1>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Manage Heads of Department
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    <HiPlus className="w-5 h-5" />
                    Add HOD
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <HiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalHODs}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total HODs</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.activeHODs}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Active</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <HiXCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.inactiveHODs}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Inactive</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <HiAcademicCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.avgExperience}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Avg Experience (yrs)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <HiMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                    <input
                        type="text"
                        placeholder="Search HODs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                </div>
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className={`px-4 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                </select>
                <div className="flex gap-2">
                    {["all", "active", "inactive"].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setFilterActive(filter)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${filterActive === filter
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : isDarkMode
                                    ? "bg-dark-bg-secondary text-gray-400 hover:bg-white/5"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* HODs List */}
                <div className={`lg:col-span-1 rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                    <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                        <h2 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>All HODs</h2>
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{hods.length} total</p>
                    </div>
                    <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : hods.length === 0 ? (
                            <div className={`p-8 text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No HODs found</div>
                        ) : (
                            <div className="divide-y dark:divide-white/5">
                                {hods.map((hod) => (
                                    <div
                                        key={hod._id}
                                        onClick={() => setSelectedHOD(hod)}
                                        className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${selectedHOD?._id === hod._id
                                            ? isDarkMode
                                                ? "bg-blue-600/10 border-l-4 border-blue-500"
                                                : "bg-blue-50 border-l-4 border-blue-500"
                                            : isDarkMode
                                                ? "hover:bg-white/5 border-l-4 border-transparent"
                                                : "hover:bg-gray-50 border-l-4 border-transparent"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"}`}>
                                            <HiUser className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{hod.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${hod.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                                                    {hod.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{hod.department?.name || "N/A"}</p>
                                            <p className={`text-xs font-mono mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{hod.employeeId}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* HOD Details / Edit */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedHOD ? (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"}`}>
                                            <HiUser className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedHOD.name}</h2>
                                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedHOD.employeeId}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onDelete}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete HOD"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Name</label>
                                            <input
                                                value={selectedHOD.name}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Employee ID</label>
                                            <input
                                                value={selectedHOD.employeeId}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, employeeId: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                                            <input
                                                type="email"
                                                value={selectedHOD.email}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, email: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone</label>
                                            <input
                                                type="tel"
                                                value={selectedHOD.phone}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, phone: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department</label>
                                            <select
                                                value={selectedHOD.department?._id || ""}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, department: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map((dept) => (
                                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Gender</label>
                                            <select
                                                value={selectedHOD.gender}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, gender: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Academic Info */}
                                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Academic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Qualification</label>
                                                <input
                                                    value={selectedHOD.qualification}
                                                    onChange={(e) => setSelectedHOD({ ...selectedHOD, qualification: e.target.value })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                    placeholder="Ph.D., M.Tech, etc."
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Specialization</label>
                                                <input
                                                    value={selectedHOD.specialization}
                                                    onChange={(e) => setSelectedHOD({ ...selectedHOD, specialization: e.target.value })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Experience (years)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={selectedHOD.experience}
                                                    onChange={(e) => setSelectedHOD({ ...selectedHOD, experience: parseInt(e.target.value) || 0 })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Status</label>
                                                <select
                                                    value={selectedHOD.isActive ? "active" : "inactive"}
                                                    onChange={(e) => setSelectedHOD({ ...selectedHOD, isActive: e.target.value === "active" })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Date of Birth</label>
                                            <input
                                                type="date"
                                                value={selectedHOD.dateOfBirth ? new Date(selectedHOD.dateOfBirth).toISOString().split("T")[0] : ""}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, dateOfBirth: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Joining Date</label>
                                            <input
                                                type="date"
                                                value={selectedHOD.joiningDate ? new Date(selectedHOD.joiningDate).toISOString().split("T")[0] : ""}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, joiningDate: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Address</label>
                                            <textarea
                                                value={selectedHOD.address}
                                                onChange={(e) => setSelectedHOD({ ...selectedHOD, address: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end pt-4 border-t dark:border-white/5">
                                        <button
                                            onClick={onUpdate}
                                            disabled={isSaving}
                                            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-500/20"
                                        >
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className={`h-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed ${isDarkMode ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"}`}>
                                <HiUser className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Select a HOD to view details</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Add New HOD</h3>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                                >
                                    <HiXMark className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                </button>
                            </div>

                            <form onSubmit={onCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Name *</label>
                                        <input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Employee ID *</label>
                                        <input
                                            value={form.employeeId}
                                            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email *</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department *</label>
                                        <select
                                            value={form.department}
                                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Gender</label>
                                        <select
                                            value={form.gender}
                                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Qualification</label>
                                        <input
                                            value={form.qualification}
                                            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Specialization</label>
                                        <input
                                            value={form.specialization}
                                            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Experience (years)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.experience}
                                            onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Joining Date</label>
                                        <input
                                            type="date"
                                            value={form.joiningDate}
                                            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={form.dateOfBirth}
                                            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Address</label>
                                        <textarea
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={form.password}
                                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none pr-10`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                                            >
                                                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className={`flex-1 px-4 py-2 rounded-xl border ${isDarkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20"
                                    >
                                        {isSaving ? "Creating..." : "Create HOD"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HODManagement;
