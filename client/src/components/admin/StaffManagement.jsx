import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiWrench,
    HiPlus,
    HiTrash,
    HiXMark,
    HiMagnifyingGlass,
    HiCheckCircle,
    HiXCircle,
    HiUser,
    HiEye,
    HiEyeSlash,
    HiClock,
} from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const StaffManagement = () => {
    const { isDarkMode } = useTheme();
    const [staffList, setStaffList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
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
        role: "",
        shift: "",
        joiningDate: new Date().toISOString().split("T")[0],
        dateOfBirth: "",
        gender: "",
        address: "",
        isActive: true,
        password: "",
    });

    const loadStaff = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterDepartment !== "all") params.department = filterDepartment;
            if (filterActive !== "all") params.isActive = filterActive === "active";

            const res = await ADMIN_API.get("/staff", { params });
            setStaffList(res.data?.staff || []);
        } catch (error) {
            console.error("Failed to load staff:", error);
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
            const res = await ADMIN_API.get("/staff/stats");
            setStats(res.data?.stats || null);
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    useEffect(() => {
        loadStaff();
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
            role: "",
            shift: "",
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
            await ADMIN_API.post("/staff", form);
            await loadStaff();
            await loadStats();
            resetForm();
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating staff:", error);
            alert(error.response?.data?.message || "Failed to create staff");
        } finally {
            setIsSaving(false);
        }
    };

    const onUpdate = async () => {
        if (!selectedStaff) return;
        setIsSaving(true);

        try {
            await ADMIN_API.put(`/staff/${selectedStaff._id}`, selectedStaff);
            await loadStaff();
            await loadStats();
            alert("Staff updated successfully");
        } catch (error) {
            console.error("Error updating staff:", error);
            alert(error.response?.data?.message || "Failed to update staff");
        } finally {
            setIsSaving(false);
        }
    };

    const onDelete = async () => {
        if (!selectedStaff) return;
        if (!window.confirm(`Delete Staff "${selectedStaff.name}"? This cannot be undone.`)) return;
        setIsSaving(true);
        try {
            await ADMIN_API.delete(`/staff/${selectedStaff._id}`);
            await loadStaff();
            await loadStats();
            setSelectedStaff(null);
        } catch (error) {
            console.error("Error deleting staff:", error);
            alert("Failed to delete staff");
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
                        Staff Management
                    </h1>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Manage Support Staff
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    <HiPlus className="w-5 h-5" />
                    Add Staff
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                <HiUser className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalStaff}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Staff</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.activeStaff}</p>
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
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.inactiveStaff}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Inactive</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <HiWrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.roles?.length || 0}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Unique Roles</p>
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
                        placeholder="Search Staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} focus:ring-2 focus:ring-orange-500 outline-none`}
                    />
                </div>
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className={`px-4 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
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
                                ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
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
                {/* Staff List */}
                <div className={`lg:col-span-1 rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                    <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                        <h2 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>All Staff</h2>
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{staffList.length} total</p>
                    </div>
                    <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                            </div>
                        ) : staffList.length === 0 ? (
                            <div className={`p-8 text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No Staff found</div>
                        ) : (
                            <div className="divide-y dark:divide-white/5">
                                {staffList.map((staff) => (
                                    <div
                                        key={staff._id}
                                        onClick={() => setSelectedStaff(staff)}
                                        className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${selectedStaff?._id === staff._id
                                            ? isDarkMode
                                                ? "bg-orange-600/10 border-l-4 border-orange-500"
                                                : "bg-orange-50 border-l-4 border-orange-500"
                                            : isDarkMode
                                                ? "hover:bg-white/5 border-l-4 border-transparent"
                                                : "hover:bg-gray-50 border-l-4 border-transparent"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-orange-900/20" : "bg-orange-100"}`}>
                                            <HiUser className={`w-6 h-6 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{staff.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${staff.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                                                    {staff.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{staff.role || "N/A"}</p>
                                            <p className={`text-xs font-mono mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{staff.employeeId}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Staff Details / Edit */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedStaff ? (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${isDarkMode ? "bg-orange-900/20" : "bg-orange-100"}`}>
                                            <HiUser className={`w-8 h-8 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedStaff.name}</h2>
                                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedStaff.employeeId}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onDelete}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Staff"
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
                                                value={selectedStaff.name}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Employee ID</label>
                                            <input
                                                value={selectedStaff.employeeId}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, employeeId: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                                            <input
                                                type="email"
                                                value={selectedStaff.email}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone</label>
                                            <input
                                                type="tel"
                                                value={selectedStaff.phone}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, phone: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department</label>
                                            <select
                                                value={selectedStaff.department || ""}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, department: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map((dept) => (
                                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Role</label>
                                            <select
                                                value={selectedStaff.role}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, role: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            >
                                                <option value="">Select Role</option>
                                                <option value="Administrative">Administrative</option>
                                                <option value="Technical">Technical</option>
                                                <option value="Support">Support</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Security">Security</option>
                                                <option value="Library">Library</option>
                                                <option value="Lab Assistant">Lab Assistant</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Work Info */}
                                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Work Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Shift</label>
                                                <select
                                                    value={selectedStaff.shift}
                                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, shift: e.target.value })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                                >
                                                    <option value="">Select Shift</option>
                                                    <option value="Morning">Morning</option>
                                                    <option value="Evening">Evening</option>
                                                    <option value="Night">Night</option>
                                                    <option value="Rotational">Rotational</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Status</label>
                                                <select
                                                    value={selectedStaff.isActive ? "active" : "inactive"}
                                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, isActive: e.target.value === "active" })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
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
                                                value={selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toISOString().split("T")[0] : ""}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, dateOfBirth: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Joining Date</label>
                                            <input
                                                type="date"
                                                value={selectedStaff.joiningDate ? new Date(selectedStaff.joiningDate).toISOString().split("T")[0] : ""}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, joiningDate: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Gender</label>
                                            <select
                                                value={selectedStaff.gender}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, gender: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Address</label>
                                            <textarea
                                                value={selectedStaff.address}
                                                onChange={(e) => setSelectedStaff({ ...selectedStaff, address: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
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
                                <p className="text-lg font-medium">Select a Staff member to view details</p>
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
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Add New Staff</h3>
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
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Employee ID *</label>
                                        <input
                                            value={form.employeeId}
                                            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email *</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department *</label>
                                        <select
                                            value={form.department}
                                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Role</label>
                                        <select
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Administrative">Administrative</option>
                                            <option value="Technical">Technical</option>
                                            <option value="Support">Support</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Security">Security</option>
                                            <option value="Library">Library</option>
                                            <option value="Lab Assistant">Lab Assistant</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Shift</label>
                                        <select
                                            value={form.shift}
                                            onChange={(e) => setForm({ ...form, shift: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                        >
                                            <option value="">Select Shift</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                            <option value="Night">Night</option>
                                            <option value="Rotational">Rotational</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Joining Date</label>
                                        <input
                                            type="date"
                                            value={form.joiningDate}
                                            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={form.dateOfBirth}
                                            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Gender</label>
                                        <select
                                            value={form.gender}
                                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Address</label>
                                        <textarea
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none`}
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
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-orange-500 outline-none pr-10`}
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
                                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium shadow-lg shadow-orange-500/20"
                                    >
                                        {isSaving ? "Creating..." : "Create Staff"}
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

export default StaffManagement;
