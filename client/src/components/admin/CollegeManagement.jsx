import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiPlus,
    HiTrash,
    HiXMark,
    HiMagnifyingGlass,
    HiBuildingLibrary,
    HiPencil,
    HiMapPin,
    HiEnvelope,
    HiUserGroup,
    HiAcademicCap,
    HiCalendarDays,
    HiGlobeAlt,
    HiBriefcase,
    HiComputerDesktop,
} from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const CollegeManagement = () => {
    const { isDarkMode } = useTheme();
    const [colleges, setColleges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        university: "",
        establishedYear: new Date().getFullYear(),
        logo: "",
        logoFile: null
    });

    const [editId, setEditId] = useState(null);

    const [selectedCollegeForAdmins, setSelectedCollegeForAdmins] = useState(null);
    const [collegeAdmins, setCollegeAdmins] = useState([]);
    const [newAdminData, setNewAdminData] = useState({ username: "", password: "" });
    const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

    const [selectedCollegeForOverview, setSelectedCollegeForOverview] = useState(null);
    const [overviewStats, setOverviewStats] = useState(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);

    useEffect(() => {
        loadColleges();
    }, []);

    useEffect(() => {
        if (selectedCollegeForAdmins) {
            loadCollegeAdmins(selectedCollegeForAdmins._id);
        }
    }, [selectedCollegeForAdmins]);

    useEffect(() => {
        if (selectedCollegeForOverview) {
            loadCollegeOverview(selectedCollegeForOverview._id);
        }
    }, [selectedCollegeForOverview]);

    const loadCollegeOverview = async (collegeId) => {
        setIsLoadingOverview(true);
        try {
            const res = await ADMIN_API.get(`/super/colleges/${collegeId}/overview`);
            setOverviewStats(res.data.stats);
        } catch (error) {
            console.error("Failed to load overview", error);
            setOverviewStats(null);
        } finally {
            setIsLoadingOverview(false);
        }
    };

    const loadCollegeAdmins = async (collegeId) => {
        setIsLoadingAdmins(true);
        try {
            const res = await ADMIN_API.get(`/super/colleges/${collegeId}/admins`);
            // Handle new API response format: { success, count, admins }
            setCollegeAdmins(res.data.admins || res.data || []);
        } catch (error) {
            console.error("Failed to load admins", error);
            setCollegeAdmins([]);
        } finally {
            setIsLoadingAdmins(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await ADMIN_API.post(`/super/colleges/${selectedCollegeForAdmins._id}/admins`, newAdminData);
            setNewAdminData({ username: "", password: "" });
            loadCollegeAdmins(selectedCollegeForAdmins._id);
            alert("Admin created successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create admin");
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm("Delete this admin?")) return;
        try {
            await ADMIN_API.delete(`/super/admins/${adminId}`);
            loadCollegeAdmins(selectedCollegeForAdmins._id);
        } catch (error) {
            alert("Failed to delete admin");
        }
    };

    const loadColleges = async () => {
        setIsLoading(true);
        try {
            const res = await ADMIN_API.get("/colleges");
            setColleges(res.data || []);
        } catch (error) {
            console.error("Failed to load colleges:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'logo' && key !== 'logoFile') {
                    data.append(key, formData[key]);
                }
            });
            if (formData.logoFile) {
                data.append('file', formData.logoFile);
            }

            await ADMIN_API.post("/colleges", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await loadColleges();
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create college");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'logo' && key !== 'logoFile') {
                    data.append(key, formData[key]);
                }
            });
            if (formData.logoFile) {
                data.append('file', formData.logoFile);
            }

            await ADMIN_API.put(`/colleges/${editId}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await loadColleges();
            setShowEditModal(false);
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update college");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this college?")) return;
        try {
            await ADMIN_API.delete(`/colleges/${id}`);
            setColleges(colleges.filter(c => c._id !== id));
        } catch (error) {
            alert("Failed to delete college");
        }
    };

    const openEditModal = (college) => {
        setFormData({
            name: college.name,
            code: college.code,
            address: college.address || "",
            city: college.city || "",
            state: college.state || "",
            country: college.country || "",
            zipCode: college.zipCode || "",
            contactEmail: college.contactEmail || "",
            contactPhone: college.contactPhone || "",
            website: college.website || "",
            university: college.university || "",
            establishedYear: college.establishedYear || new Date().getFullYear(),
            logo: college.logo || "",
            logoFile: null
        });
        setEditId(college._id);
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            address: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            contactEmail: "",
            contactPhone: "",
            website: "",
            university: "",
            establishedYear: new Date().getFullYear(),
            logo: "",
            logoFile: null
        });
        setEditId(null);
    };

    const filteredColleges = colleges.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>College Management</h2>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Manage registered colleges and institutions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                    <HiPlus className="w-5 h-5" />
                    Add College
                </button>
            </div>

            {/* Search */}
            <div className={`relative p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                <HiMagnifyingGlass className={`absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search colleges..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"} outline-none focus:ring-2 focus:ring-blue-500`}
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredColleges.length === 0 ? (
                    <div className={`col-span-full text-center py-12 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        No colleges found
                    </div>
                ) : (
                    filteredColleges.map((college) => (
                        <motion.div
                            key={college._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${isDarkMode ? "bg-dark-bg-secondary border-white/5 hover:border-white/10" : "bg-white border-gray-200 hover:border-blue-200"}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                                    <HiBuildingLibrary className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(college)}
                                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}
                                        title="Edit Details"
                                    >
                                        <HiPencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(college._id)}
                                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-red-900/20 text-red-400" : "hover:bg-red-50 text-red-500"}`}
                                        title="Delete College"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>


                            <div className="mb-4 flex items-center gap-4">
                                {college.logo ? (
                                    <img src={college.logo} alt={college.name} className="w-16 h-16 rounded-xl object-contain bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10" />
                                ) : (
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                                        <HiBuildingLibrary className="w-8 h-8" />
                                    </div>
                                )}
                                <div>
                                    <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{college.name}</h3>
                                    <p className={`text-sm font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>{college.code}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2 py-1 text-xs rounded-full border ${college.status === "approved" ? "bg-green-100 text-green-700 border-green-200" :
                                    college.status === "suspended" ? "bg-red-100 text-red-700 border-red-200" :
                                        "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    }`}>
                                    {college.status?.toUpperCase() || "APPROVED"}
                                </span>
                                <select
                                    value={college.status || "approved"}
                                    onChange={async (e) => {
                                        try {
                                            await ADMIN_API.put(`/super/colleges/${college._id}/status`, { status: e.target.value });
                                            loadColleges();
                                        } catch (err) {
                                            alert("Failed to update status");
                                        }
                                    }}
                                    className={`text-xs px-2 py-1 rounded-lg border outline-none ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                                >
                                    <option value="approved">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div className="space-y-2 text-sm">
                                {college.city && (
                                    <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        <HiMapPin className="w-4 h-4" />
                                        <span>{college.city}, {college.state}</span>
                                    </div>
                                )}
                                {college.contactEmail && (
                                    <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        <HiEnvelope className="w-4 h-4" />
                                        <span>{college.contactEmail}</span>
                                    </div>
                                )}
                            </div>


                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSelectedCollegeForOverview(college)}
                                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setSelectedCollegeForAdmins(college)}
                                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? "bg-white/5 hover:bg-white/10 text-blue-400" : "bg-blue-50 hover:bg-blue-100 text-blue-600"}`}
                                >
                                    Manage Admins
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {showEditModal ? "Edit College" : "Add New College"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                    className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                                >
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={showEditModal ? handleUpdate : handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>College Name *</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>College Code *</label>
                                        <input
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>University</label>
                                        <input
                                            value={formData.university}
                                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Established Year</label>
                                        <input
                                            type="number"
                                            value={formData.establishedYear}
                                            onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                            rows="2"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>City</label>
                                        <input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>State</label>
                                        <input
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Country</label>
                                        <input
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Zip Code</label>
                                        <input
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                                        <input
                                            type="email"
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone</label>
                                        <input
                                            value={formData.contactPhone}
                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Website</label>
                                        <input
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>College Logo</label>
                                    <div className="flex items-center gap-4">
                                        {formData.logoFile ? (
                                            <div className="relative">
                                                <img
                                                    src={URL.createObjectURL(formData.logoFile)}
                                                    alt="Preview"
                                                    className="w-16 h-16 rounded-xl object-contain border bg-gray-50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, logoFile: null })}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                                                >
                                                    <HiXMark className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : formData.logo ? (
                                            <img
                                                src={formData.logo}
                                                alt="Current"
                                                className="w-16 h-16 rounded-xl object-contain border bg-gray-50"
                                            />
                                        ) : (
                                            <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center ${isDarkMode ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"}`}>
                                                <HiBuildingLibrary className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFormData({ ...formData, logoFile: file });
                                                    }
                                                }}
                                                className={`block w-full text-sm ${isDarkMode ? "text-gray-300 file:text-white" : "text-gray-500 file:text-blue-600"}
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-xl file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:hover:bg-blue-100
                                                        hover:file:bg-blue-100
                                                        dark:file:bg-blue-900/20 dark:hover:file:bg-blue-900/30
                                                    `}
                                            />
                                            <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Max size: 5MB. Formats: JPG, PNG</p>
                                        </div>
                                    </div>
                                </div>


                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setShowEditModal(false);
                                            resetForm();
                                        }}
                                        className={`px-4 py-2 rounded-xl font-medium ${isDarkMode ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20"
                                    >
                                        {isSaving ? "Saving..." : (showEditModal ? "Update College" : "Create College")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >
            {/* Admin Management Modal */}
            < AnimatePresence >
                {selectedCollegeForAdmins && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Manage Admins</h3>
                                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedCollegeForAdmins.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCollegeForAdmins(null)}
                                    className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                                >
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Add New Admin</h4>
                                <form onSubmit={handleCreateAdmin} className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            required
                                            placeholder="Username"
                                            value={newAdminData.username}
                                            onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                                            className={`px-4 py-3 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"} outline-none focus:ring-2 focus:ring-blue-500`}
                                            minLength={3}
                                            maxLength={20}
                                        />
                                        <input
                                            required
                                            type="password"
                                            placeholder="Password (min 6 chars)"
                                            value={newAdminData.password}
                                            onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                            className={`px-4 py-3 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"} outline-none focus:ring-2 focus:ring-blue-500`}
                                            minLength={6}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300"
                                    >
                                        <HiPlus className="w-5 h-5" />
                                        Create College Admin
                                    </button>
                                </form>
                            </div>

                            <div>
                                <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Existing Admins</h4>
                                {isLoadingAdmins ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : collegeAdmins.length === 0 ? (
                                    <div className={`text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No admins found</div>
                                ) : (
                                    <div className="space-y-2">
                                        {collegeAdmins.map((admin) => (
                                            <div key={admin._id} className={`flex justify-between items-center p-3 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                                <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{admin.username}</span>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin._id)}
                                                    className="text-red-500 hover:text-red-600 p-1"
                                                >
                                                    <HiTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Overview Modal */}
            <AnimatePresence>
                {selectedCollegeForOverview && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>College Overview</h3>
                                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedCollegeForOverview.name}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCollegeForOverview(null);
                                        setOverviewStats(null);
                                    }}
                                    className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                                >
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>

                            {isLoadingOverview ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : overviewStats ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <StatCard
                                        title="Admins"
                                        count={overviewStats.admins}
                                        icon={<HiBriefcase className="w-6 h-6" />}
                                        color="blue"
                                        isDarkMode={isDarkMode}
                                    />
                                    <StatCard
                                        title="Teachers"
                                        count={overviewStats.teachers}
                                        icon={<HiAcademicCap className="w-6 h-6" />}
                                        color="green"
                                        isDarkMode={isDarkMode}
                                    />
                                    <StatCard
                                        title="Staff"
                                        count={overviewStats.staff}
                                        icon={<HiUserGroup className="w-6 h-6" />}
                                        color="purple"
                                        isDarkMode={isDarkMode}
                                    />
                                    <StatCard
                                        title="Students/Users"
                                        count={overviewStats.users}
                                        icon={<HiUserGroup className="w-6 h-6" />}
                                        color="orange"
                                        isDarkMode={isDarkMode}
                                    />
                                    <StatCard
                                        title="Events"
                                        count={overviewStats.events}
                                        icon={<HiCalendarDays className="w-6 h-6" />}
                                        color="pink"
                                        isDarkMode={isDarkMode}
                                    />
                                    <StatCard
                                        title="Clubs"
                                        count={overviewStats.clubs}
                                        icon={<HiGlobeAlt className="w-6 h-6" />}
                                        color="indigo"
                                        isDarkMode={isDarkMode}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Failed to load stats
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

const StatCard = ({ title, count, icon, color, isDarkMode }) => {
    const colors = {
        blue: isDarkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600",
        green: isDarkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600",
        purple: isDarkMode ? "bg-purple-900/20 text-purple-400" : "bg-purple-50 text-purple-600",
        orange: isDarkMode ? "bg-orange-900/20 text-orange-400" : "bg-orange-50 text-orange-600",
        pink: isDarkMode ? "bg-pink-900/20 text-pink-400" : "bg-pink-50 text-pink-600",
        indigo: isDarkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600",
    };

    return (
        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-white border-gray-100"}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
                {icon}
            </div>
            <h4 className={`text-2xl font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{count}</h4>
            <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{title}</p>
        </div>
    );

};

export default CollegeManagement;
