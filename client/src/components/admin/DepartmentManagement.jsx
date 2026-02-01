import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiAcademicCap,
    HiPlus,
    HiTrash,
    HiXMark,
    HiMagnifyingGlass,
    HiUsers,
    HiUserGroup,
    HiEnvelope,
    HiCheckCircle,
    HiXCircle,
    HiBookOpen,
} from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const DepartmentManagement = () => {
    const { isDarkMode } = useTheme();
    const [departments, setDepartments] = useState([]);
    const [hods, setHods] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterActive, setFilterActive] = useState("all");
    const [stats, setStats] = useState(null);
    const [deptTeachers, setDeptTeachers] = useState([]);
    const [deptStaff, setDeptStaff] = useState([]);
    const [deptClasses, setDeptClasses] = useState([]);
    const [deptSections, setDeptSections] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: "",
        headOfDepartment: "",
        email: "",
        phone: "",
        building: "",
        floor: "",
        totalStudents: 0,
        totalFaculty: 0,
        establishedYear: new Date().getFullYear(),
        isActive: true,
        programs: [],
        website: "",
    });

    const loadDepartments = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterActive !== "all") params.isActive = filterActive === "active";

            const res = await ADMIN_API.get("/departments", { params });
            setDepartments(res.data?.departments || []);
        } catch (error) {
            console.error("Failed to load departments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await ADMIN_API.get("/departments/stats");
            setStats(res.data?.stats || null);
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    const loadHODs = async () => {
        try {
            const res = await ADMIN_API.get("/hods");
            setHods(res.data?.hods || []);
        } catch (error) {
            console.error("Failed to load HODs:", error);
        }
    };

    useEffect(() => {
        loadDepartments();
        loadStats();
        loadHODs();
    }, [searchTerm, filterActive]);

    useEffect(() => {
        const loadDeptMembers = async () => {
            if (!selectedDepartment) return;
            setMembersLoading(true);
            try {

                const [teachersRes, staffRes, classesRes, sectionsRes] = await Promise.all([
                    ADMIN_API.get("/teachers", { params: { department: selectedDepartment._id } }),
                    ADMIN_API.get("/staff", { params: { department: selectedDepartment._id } }),
                    ADMIN_API.get("/classes", { params: { department: selectedDepartment._id } }),
                    ADMIN_API.get("/sections")
                ]);
                setDeptTeachers(teachersRes.data?.teachers || []);
                setDeptStaff(staffRes.data?.staff || []);
                setDeptClasses(classesRes.data?.classes || []);

                // Filter sections for this department
                const allSections = sectionsRes.data?.sections || [];
                const deptSectionsFiltered = allSections.filter(section =>
                    section.class?.department === selectedDepartment._id ||
                    section.class?.department?._id === selectedDepartment._id
                );
                setDeptSections(deptSectionsFiltered);
            } catch (error) {
                console.error("Failed to load department members:", error);
            } finally {
                setMembersLoading(false);
            }
        };
        loadDeptMembers();
    }, [selectedDepartment]);

    const resetForm = () => {
        setForm({
            name: "",
            code: "",
            description: "",
            headOfDepartment: "",
            email: "",
            phone: "",
            building: "",
            floor: "",
            totalStudents: 0,
            totalFaculty: 0,
            establishedYear: new Date().getFullYear(),
            isActive: true,
            programs: [],
            website: "",
        });
    };

    const onCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.code) {
            alert("Department name and code are required");
            return;
        }
        setIsSaving(true);

        try {
            await ADMIN_API.post("/departments", form);
            await loadDepartments();
            await loadStats();
            resetForm();
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating department:", error);
            alert(error.response?.data?.message || "Failed to create department");
        } finally {
            setIsSaving(false);
        }
    };

    const onUpdate = async () => {
        if (!selectedDepartment) return;
        setIsSaving(true);

        try {
            await ADMIN_API.put(`/departments/${selectedDepartment._id}`, selectedDepartment);
            await loadDepartments();
            await loadStats();
            alert("Department updated successfully");
        } catch (error) {
            console.error("Error updating department:", error);
            alert(error.response?.data?.message || "Failed to update department");
        } finally {
            setIsSaving(false);
        }
    };

    const onDelete = async () => {
        if (!selectedDepartment) return;
        if (!window.confirm(`Delete department "${selectedDepartment.name}"? This cannot be undone.`)) return;
        setIsSaving(true);
        try {
            await ADMIN_API.delete(`/departments/${selectedDepartment._id}`);
            await loadDepartments();
            await loadStats();
            setSelectedDepartment(null);
        } catch (error) {
            console.error("Error deleting department:", error);
            alert("Failed to delete department");
        } finally {
            setIsSaving(false);
        }
    };

    const handleProgramsChange = (value, isEdit = false) => {
        const programsArray = value.split(",").map((p) => p.trim()).filter((p) => p);
        if (isEdit) {
            setSelectedDepartment({ ...selectedDepartment, programs: programsArray });
        } else {
            setForm({ ...form, programs: programsArray });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Department Management
                    </h1>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Manage college departments and their information
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    <HiPlus className="w-5 h-5" />
                    Create Department
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <HiAcademicCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalDepartments}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Departments</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.activeDepartments}</p>
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
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.inactiveDepartments}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Inactive</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <HiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalStudents}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Students</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                <HiUserGroup className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalFaculty}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Faculty</p>
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
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                </div>
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
                {/* Departments List */}
                <div className={`lg:col-span-1 rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                    <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                        <h2 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>All Departments</h2>
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{departments.length} total</p>
                    </div>
                    <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : departments.length === 0 ? (
                            <div className={`p-8 text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No departments found</div>
                        ) : (
                            <div className="divide-y dark:divide-white/5">
                                {departments.map((dept) => (
                                    <div
                                        key={dept._id}
                                        onClick={() => setSelectedDepartment(dept)}
                                        className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${selectedDepartment?._id === dept._id
                                            ? isDarkMode
                                                ? "bg-blue-600/10 border-l-4 border-blue-500"
                                                : "bg-blue-50 border-l-4 border-blue-500"
                                            : isDarkMode
                                                ? "hover:bg-white/5 border-l-4 border-transparent"
                                                : "hover:bg-gray-50 border-l-4 border-transparent"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"}`}>
                                            <HiAcademicCap className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{dept.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${dept.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                                                    {dept.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className={`text-xs font-mono mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{dept.code}</p>
                                            <div className={`flex items-center gap-3 mt-2 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                                <span className="flex items-center gap-1">
                                                    <HiUsers className="w-3 h-3" />
                                                    {dept.totalStudents || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <HiUserGroup className="w-3 h-3" />
                                                    {dept.totalFaculty || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Department Details / Edit */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedDepartment ? (
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
                                            <HiAcademicCap className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedDepartment.name}</h2>
                                            <p className={`text-sm font-mono ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedDepartment.code}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onDelete}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Department"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department Name</label>
                                            <input
                                                value={selectedDepartment.name}
                                                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, name: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department Code</label>
                                            <input
                                                value={selectedDepartment.code}
                                                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, code: e.target.value.toUpperCase() })}
                                                className={`w-full px-3 py-2 rounded-xl border font-mono ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                                            <textarea
                                                value={selectedDepartment.description}
                                                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, description: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Head of Department</label>
                                                <select
                                                    value={selectedDepartment.headOfDepartment}
                                                    onChange={(e) => setSelectedDepartment({ ...selectedDepartment, headOfDepartment: e.target.value })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                >
                                                    <option value="">Select Head of Department</option>
                                                    {hods.map((hod) => (
                                                        <option key={hod._id} value={hod.name}>
                                                            {hod.name} ({hod.employeeId})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                                                <div className="relative">
                                                    <HiEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                                    <input
                                                        type="email"
                                                        value={selectedDepartment.email}
                                                        onChange={(e) => setSelectedDepartment({ ...selectedDepartment, email: e.target.value })}
                                                        className={`w-full pl-10 pr-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                        placeholder="dept@college.edu"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone</label>
                                                <input
                                                    type="tel"
                                                    value={selectedDepartment.phone}
                                                    onChange={(e) => setSelectedDepartment({ ...selectedDepartment, phone: e.target.value })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Website</label>
                                                <input
                                                    type="url"
                                                    value={selectedDepartment.website}
                                                    onChange={(e) => setSelectedDepartment({ ...selectedDepartment, website: e.target.value })}
                                                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                    placeholder="https://dept.college.edu"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location & Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Location</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Building</label>
                                                    <input
                                                        value={selectedDepartment.building}
                                                        onChange={(e) => setSelectedDepartment({ ...selectedDepartment, building: e.target.value })}
                                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                        placeholder="Main Building"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Floor</label>
                                                    <input
                                                        value={selectedDepartment.floor}
                                                        onChange={(e) => setSelectedDepartment({ ...selectedDepartment, floor: e.target.value })}
                                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                        placeholder="3rd Floor"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Statistics</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Total Students</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={selectedDepartment.totalStudents}
                                                        onChange={(e) => setSelectedDepartment({ ...selectedDepartment, totalStudents: parseInt(e.target.value) || 0 })}
                                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Total Faculty</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={selectedDepartment.totalFaculty}
                                                        onChange={(e) => setSelectedDepartment({ ...selectedDepartment, totalFaculty: parseInt(e.target.value) || 0 })}
                                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Established Year</label>
                                            <input
                                                type="number"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                value={selectedDepartment.establishedYear}
                                                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Status</label>
                                            <select
                                                value={selectedDepartment.isActive ? "active" : "inactive"}
                                                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, isActive: e.target.value === "active" })}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Programs (comma-separated)</label>
                                            <input
                                                value={selectedDepartment.programs?.join(", ") || ""}
                                                onChange={(e) => handleProgramsChange(e.target.value, true)}
                                                className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                                placeholder="B.Tech, M.Tech, PhD"
                                            />
                                        </div>
                                    </div>

                                    {/* Department Faculty & Staff */}
                                    {/* Department Faculty & Staff */}
                                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Department Members</h3>

                                        {membersLoading ? (
                                            <div className="text-center py-4">
                                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Teachers */}
                                                <div>
                                                    <h4 className={`text-xs font-semibold mb-3 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                                        Faculty ({deptTeachers.length})
                                                    </h4>
                                                    {deptTeachers.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {deptTeachers.map(teacher => (
                                                                <div key={teacher._id} className={`flex items-center gap-3 p-2 rounded-lg border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-100"}`}>
                                                                    <div className={`p-2 rounded-full ${isDarkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                                                                        <HiAcademicCap className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{teacher.name}</p>
                                                                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{teacher.designation}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className={`text-sm italic ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No faculty members assigned</p>
                                                    )}
                                                </div>

                                                {/* Staff */}
                                                <div>
                                                    <h4 className={`text-xs font-semibold mb-3 ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                                                        Staff ({deptStaff.length})
                                                    </h4>
                                                    {deptStaff.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {deptStaff.map(staff => (
                                                                <div key={staff._id} className={`flex items-center gap-3 p-2 rounded-lg border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-100"}`}>
                                                                    <div className={`p-2 rounded-full ${isDarkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                                                                        <HiUserGroup className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{staff.name}</p>
                                                                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{staff.role}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className={`text-sm italic ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No staff members assigned</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Academic Structure (Classes & Sections) */}
                                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                                        <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Academic Structure</h3>

                                        {membersLoading ? (
                                            <div className="text-center py-4">
                                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Classes */}
                                                <div>
                                                    <h4 className={`text-xs font-semibold mb-3 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                                                        Classes ({deptClasses.length})
                                                    </h4>
                                                    {deptClasses.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {deptClasses.map(cls => (
                                                                <div key={cls._id} className={`flex items-center gap-3 p-2 rounded-lg border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-100"}`}>
                                                                    <div className={`p-2 rounded-full ${isDarkMode ? "bg-purple-900/20 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
                                                                        <HiBookOpen className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{cls.name}</p>
                                                                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{cls.semester}th Semester</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className={`text-sm italic ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No classes created</p>
                                                    )}
                                                </div>

                                                {/* Sections */}
                                                <div>
                                                    <h4 className={`text-xs font-semibold mb-3 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
                                                        Sections ({deptSections.length})
                                                    </h4>
                                                    {deptSections.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {deptSections.map(section => (
                                                                <div key={section._id} className={`flex items-center gap-3 p-2 rounded-lg border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-100"}`}>
                                                                    <div className={`p-2 rounded-full ${isDarkMode ? "bg-orange-900/20 text-orange-400" : "bg-orange-50 text-orange-600"}`}>
                                                                        <HiUserGroup className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{section.name}</p>
                                                                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                            {section.class?.name} • {section.studentCount || 0} Students
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className={`text-sm italic ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No sections created</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                <HiAcademicCap className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Select a department to view details</p>
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
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Create New Department</h3>
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
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department Name *</label>
                                        <input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            placeholder="Computer Science"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department Code *</label>
                                        <input
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                            className={`w-full px-3 py-2 rounded-xl border font-mono ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            placeholder="CSE"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        rows={3}
                                        placeholder="Brief description of the department..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Head of Department</label>
                                        <select
                                            value={form.headOfDepartment}
                                            onChange={(e) => setForm({ ...form, headOfDepartment: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        >
                                            <option value="">Select Head of Department</option>
                                            {hods.map((hod) => (
                                                <option key={hod._id} value={hod.name}>
                                                    {hod.name} ({hod.employeeId})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            placeholder="dept@college.edu"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Website</label>
                                        <input
                                            type="url"
                                            value={form.website}
                                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            placeholder="https://dept.college.edu"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Building</label>
                                        <input
                                            value={form.building}
                                            onChange={(e) => setForm({ ...form, building: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            placeholder="Main Building"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Floor</label>
                                        <input
                                            value={form.floor}
                                            onChange={(e) => setForm({ ...form, floor: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                            placeholder="3rd Floor"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Total Students</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.totalStudents}
                                            onChange={(e) => setForm({ ...form, totalStudents: parseInt(e.target.value) || 0 })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Total Faculty</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.totalFaculty}
                                            onChange={(e) => setForm({ ...form, totalFaculty: parseInt(e.target.value) || 0 })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Established Year</label>
                                        <input
                                            type="number"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            value={form.establishedYear}
                                            onChange={(e) => setForm({ ...form, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Programs (comma-separated)</label>
                                    <input
                                        value={form.programs?.join(", ") || ""}
                                        onChange={(e) => handleProgramsChange(e.target.value, false)}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                                        placeholder="B.Tech, M.Tech, PhD"
                                    />
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
                                        {isSaving ? "Creating..." : "Create Department"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default DepartmentManagement;
