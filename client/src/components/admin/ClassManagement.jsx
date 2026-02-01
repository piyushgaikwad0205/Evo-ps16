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
    HiPencil,
    HiArrowRightOnRectangle,
    HiCheckCircle,
    HiUser,
} from "react-icons/hi2";
import { ADMIN_API, FACULTY_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const ClassManagement = ({ role = "admin", departmentId, teacherId }) => {
    const api = role === "admin" ? ADMIN_API : FACULTY_API;
    const { isDarkMode } = useTheme();
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showCreateClassModal, setShowCreateClassModal] = useState(false);
    const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
    const [showMoveStudentsModal, setShowMoveStudentsModal] = useState(false);
    const [showEditClassModal, setShowEditClassModal] = useState(false);
    const [editClassForm, setEditClassForm] = useState({
        _id: "",
        name: "",
        department: "",
        academicYear: "",
        semester: 1,
        isActive: true
    });

    const [showEditSectionModal, setShowEditSectionModal] = useState(false);
    const [editSectionForm, setEditSectionForm] = useState({
        _id: "",
        name: "",
        maxStudents: 60,
        classTeacher: "",
        isActive: true
    });

    const [filterDepartment, setFilterDepartment] = useState("all");
    const [stats, setStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name"); // name, semester, academicYear

    // Forms
    const [classForm, setClassForm] = useState({
        name: "",
        department: "",
        academicYear: "2023-2024",
        semester: 1,
        isActive: true
    });

    const [sectionForm, setSectionForm] = useState({
        name: "",
        class: "",
        maxStudents: 60,
        classTeacher: "",
        isActive: true
    });

    const [moveForm, setMoveForm] = useState({
        sourceSection: "",
        targetClass: "",
        targetSection: ""
    });

    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");

    // Load initial data
    useEffect(() => {
        loadDepartments();
        loadTeachers();
        loadStats();
    }, []);

    // Load classes when filter changes
    useEffect(() => {
        loadClasses();
    }, [filterDepartment, searchQuery, sortBy]);

    // Load sections when class is selected
    useEffect(() => {
        if (selectedClass) {
            loadSections(selectedClass._id);
        } else {
            setSections([]);
        }
    }, [selectedClass]);

    const loadDepartments = async () => {
        if (role !== "admin") return;
        try {
            const res = await api.get("/departments");
            setDepartments(res.data?.departments || []);
        } catch (error) {
            console.error("Failed to load departments:", error);
        }
    };

    const loadTeachers = async () => {
        if (role !== "admin") return;
        try {
            const res = await api.get("/teachers");
            setTeachers(res.data?.teachers || []);
        } catch (error) {
            console.error("Failed to load teachers:", error);
        }
    };

    const loadStats = async () => {
        try {
            const res = await api.get("/sections/stats");
            setStats(res.data?.stats || null);
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    const loadClasses = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (role === "hod" && departmentId) {
                params.department = departmentId;
            } else if (role === "admin" && filterDepartment !== "all") {
                params.department = filterDepartment;
            }

            const res = await api.get("/classes", { params });
            let fetchedClasses = res.data?.classes || [];

            // Apply search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                fetchedClasses = fetchedClasses.filter(cls =>
                    cls.name.toLowerCase().includes(query) ||
                    cls.department?.name.toLowerCase().includes(query) ||
                    cls.academicYear.toLowerCase().includes(query)
                );
            }

            // Apply sorting
            fetchedClasses.sort((a, b) => {
                if (sortBy === "name") {
                    return a.name.localeCompare(b.name);
                } else if (sortBy === "semester") {
                    return a.semester - b.semester;
                } else if (sortBy === "academicYear") {
                    return b.academicYear.localeCompare(a.academicYear); // Descending
                }
                return 0;
            });

            setClasses(fetchedClasses);
        } catch (error) {
            console.error("Failed to load classes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSections = async (classId) => {
        try {
            const params = { class: classId };
            if (role === "teacher" && teacherId) {
                params.classTeacher = teacherId;
            }
            const res = await api.get("/sections", { params });
            setSections(res.data?.sections || []);
        } catch (error) {
            console.error("Failed to load sections:", error);
        }
    };

    // Class Actions
    const handleCreateClass = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await ADMIN_API.post("/classes", classForm);
            await loadClasses();
            await loadStats();
            setShowCreateClassModal(false);
            setClassForm({ name: "", department: "", academicYear: "2023-2024", semester: 1, isActive: true });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create class");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClass = async (classId) => {
        if (!window.confirm("Delete this class? This will also delete all sections within it.")) return;
        try {
            await ADMIN_API.delete(`/classes/${classId}`);
            if (selectedClass?._id === classId) setSelectedClass(null);
            await loadClasses();
            await loadStats();
        } catch (error) {
            alert("Failed to delete class");
        }
    };

    const handleEditClass = (cls) => {
        setEditClassForm({
            _id: cls._id,
            name: cls.name,
            department: cls.department._id || cls.department,
            academicYear: cls.academicYear,
            semester: cls.semester,
            isActive: cls.isActive
        });
        setShowEditClassModal(true);
    };

    const handleUpdateClass = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put(`/classes/${editClassForm._id}`, editClassForm);
            await loadClasses();
            setShowEditClassModal(false);
            if (selectedClass && selectedClass._id === editClassForm._id) {
                setSelectedClass({ ...selectedClass, ...editClassForm });
            }
        } catch (error) {
            console.error("Failed to update class:", error);
            alert("Failed to update class");
        } finally {
            setIsSaving(false);
        }
    };

    // Section Actions
    const handleCreateSection = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await ADMIN_API.post("/sections", { ...sectionForm, class: selectedClass._id });
            await loadSections(selectedClass._id);
            await loadStats();
            setShowCreateSectionModal(false);
            setSectionForm({ name: "", class: "", maxStudents: 60, classTeacher: "", isActive: true });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create section");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm("Delete this section?")) return;
        try {
            await ADMIN_API.delete(`/sections/${sectionId}`);
            await loadSections(selectedClass._id);
            await loadStats();
        } catch (error) {
            alert("Failed to delete section");
        }
    };

    const handleUpdateSection = async (section) => {
        try {
            await ADMIN_API.put(`/sections/${section._id}`, section);
            await loadSections(selectedClass._id);
            alert("Section updated");
        } catch (error) {
            alert("Failed to update section");
        }
    };

    const handleEditSection = (section) => {
        setEditSectionForm({
            _id: section._id,
            name: section.name,
            maxStudents: section.maxStudents,
            classTeacher: section.classTeacher?._id || section.classTeacher || "",
            isActive: section.isActive
        });
        setShowEditSectionModal(true);
    };

    const handleSaveSectionEdit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await ADMIN_API.put(`/sections/${editSectionForm._id}`, {
                ...editSectionForm,
                class: selectedClass._id
            });
            await loadSections(selectedClass._id);
            setShowEditSectionModal(false);
            alert("Section updated successfully");
        } catch (error) {
            console.error("Failed to update section:", error);
            alert("Failed to update section");
        } finally {
            setIsSaving(false);
        }
    };

    // Move Students
    const loadStudentsForMove = async (sectionId) => {
        if (!sectionId) {
            setAvailableStudents([]);
            return;
        }
        try {
            const res = await ADMIN_API.get(`/sections/${sectionId}/students`);
            setAvailableStudents(res.data?.students || []);
        } catch (error) {
            console.error("Failed to load students:", error);
            setAvailableStudents([]);
        }
    };

    const handleMoveStudents = async (e) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0) {
            alert("Please select at least one student");
            return;
        }
        setIsSaving(true);
        try {
            await ADMIN_API.put("/sections/move-students", {
                studentIds: selectedStudentIds,
                targetClassId: moveForm.targetClass,
                targetSectionId: moveForm.targetSection
            });
            alert(`Successfully moved ${selectedStudentIds.length} student(s)`);
            setShowMoveStudentsModal(false);
            setMoveForm({ sourceSection: "", targetClass: "", targetSection: "" });
            setSelectedStudentIds([]);
            setAvailableStudents([]);
            await loadStats();
            if (selectedClass) loadSections(selectedClass._id);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to move students");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleSelectAll = () => {
        const filtered = filteredStudents();
        if (selectedStudentIds.length === filtered.length && filtered.length > 0) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(filtered.map(s => s._id));
        }
    };

    const [studentFilters, setStudentFilters] = useState({
        year: "",
        department: "",
        branch: ""
    });

    const filteredStudents = () => {
        let filtered = availableStudents;

        // Apply filters
        if (studentFilters.year) {
            filtered = filtered.filter(s => s.yearOfStudy === parseInt(studentFilters.year));
        }
        if (studentFilters.department) {
            filtered = filtered.filter(s => s.department === studentFilters.department);
        }
        if (studentFilters.branch) {
            filtered = filtered.filter(s => s.branchSpecification?.toLowerCase().includes(studentFilters.branch.toLowerCase()));
        }

        // Apply search
        if (studentSearchQuery.trim()) {
            const query = studentSearchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                (s.btid && s.btid.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Classes & Sections
                    </h1>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Manage academic structure and student allocation
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {role === "admin" && (
                        <>
                            <button
                                onClick={() => setShowMoveStudentsModal(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                            >
                                <HiArrowRightOnRectangle className="w-5 h-5" />
                                Move Students
                            </button>
                            <button
                                onClick={() => setShowCreateClassModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                            >
                                <HiPlus className="w-5 h-5" />
                                Add Class
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Search and Sort Bar */}
            <div className={`flex flex-col sm:flex-row gap-3 p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                <div className="flex-1 relative">
                    <HiMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search classes by name, department, or year..."
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"} outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    <option value="name">Sort by Name</option>
                    <option value="semester">Sort by Semester</option>
                    <option value="academicYear">Sort by Year</option>
                </select>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <HiAcademicCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalClasses}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Classes</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <HiUserGroup className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalSections}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Sections</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <HiUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.studentsInSections}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Allocated Students</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                <HiCheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.sectionsWithTeachers}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Class Teachers Assigned</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Classes List */}
                <div className={`lg:col-span-1 rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
                    <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"} space-y-3`}>
                        <div className="flex justify-between items-center">
                            <h2 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Classes</h2>
                            <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                                {classes.length}
                            </span>
                        </div>
                        {role === "admin" && (
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl text-sm border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : classes.length === 0 ? (
                            <div className={`p-8 text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No classes found</div>
                        ) : (
                            <div className="divide-y dark:divide-white/5">
                                {classes.map((cls) => (
                                    <div
                                        key={cls._id}
                                        onClick={() => setSelectedClass(cls)}
                                        className={`p-4 cursor-pointer transition-colors flex items-center justify-between group ${selectedClass?._id === cls._id
                                            ? isDarkMode ? "bg-blue-600/10 border-l-4 border-blue-500" : "bg-blue-50 border-l-4 border-blue-500"
                                            : isDarkMode ? "hover:bg-white/5 border-l-4 border-transparent" : "hover:bg-gray-50 border-l-4 border-transparent"
                                            }`}
                                    >
                                        <div>
                                            <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{cls.name}</h3>
                                            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                {cls.department?.name} • Sem {cls.semester}
                                            </p>
                                        </div>
                                        {role === "admin" && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditClass(cls); }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls._id); }}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sections List */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedClass ? (
                            <motion.div
                                key="sections"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"}`}>
                                            <HiAcademicCap className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedClass.name} - Sections</h2>
                                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                {selectedClass.department?.name} • Sem {selectedClass.semester} • {selectedClass.academicYear}
                                            </p>
                                        </div>
                                    </div>
                                    {role === "admin" && (
                                        <button
                                            onClick={() => setShowCreateSectionModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            <HiPlus className="w-5 h-5" />
                                            Add Section
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sections.map((section) => (
                                        <div key={section._id} className={`p-4 rounded-xl border transition-all ${isDarkMode ? "bg-dark-bg border-white/5 hover:border-white/20" : "bg-gray-50 border-gray-200 hover:border-blue-300"}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Section {section.name}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${section.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700"}`}>
                                                        {section.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                                {role === "admin" && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditSection(section)}
                                                            className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-colors"
                                                        >
                                                            <HiPencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSection(section._id)}
                                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                                                        >
                                                            <HiTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Class Teacher</label>
                                                    {role === "admin" ? (
                                                        <select
                                                            value={section.classTeacher?._id || section.classTeacher || ""}
                                                            onChange={(e) => handleUpdateSection({ ...section, classTeacher: e.target.value })}
                                                            className={`w-full px-2 py-1.5 rounded-lg text-sm border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} outline-none focus:border-blue-500`}
                                                        >
                                                            <option value="">Select Teacher</option>
                                                            {teachers.map(t => (
                                                                <option key={t._id} value={t._id}>{t.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                            {section.classTeacher?.name || "Not Assigned"}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Students:</span>
                                                    <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{section.studentCount || 0} / {section.maxStudents}</span>
                                                </div>

                                                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-blue-600 h-full rounded-full"
                                                        style={{ width: `${Math.min(((section.studentCount || 0) / section.maxStudents) * 100, 100)}%` }}
                                                    />
                                                </div>

                                                {role === "hod" && (
                                                    <button
                                                        onClick={() => alert("Assign Subject Teacher feature coming soon!")}
                                                        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                                                    >
                                                        <HiUser className="w-4 h-4" />
                                                        Assign Subject Teachers
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {sections.length === 0 && (
                                        <div className={`col-span-full py-12 text-center border-2 border-dashed rounded-xl ${isDarkMode ? "border-white/10 text-gray-500" : "border-gray-200 text-gray-400"}`}>
                                            <HiUserGroup className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No sections created yet</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className={`h-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed ${isDarkMode ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"}`}>
                                <HiAcademicCap className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Select a class to manage sections</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Create Class Modal */}
            <AnimatePresence>
                {showCreateClassModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Add New Class</h3>
                                <button onClick={() => setShowCreateClassModal(false)} className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateClass} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Class Name</label>
                                    <input
                                        value={classForm.name}
                                        onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="e.g. FY, SY, TY"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department</label>
                                    <select
                                        value={classForm.department}
                                        onChange={(e) => setClassForm({ ...classForm, department: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Semester</label>
                                    <select
                                        value={classForm.semester}
                                        onChange={(e) => setClassForm({ ...classForm, semester: parseInt(e.target.value) })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        required
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Academic Year</label>
                                    <input
                                        value={classForm.academicYear}
                                        onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="e.g. 2023-2024"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 mt-4"
                                >
                                    {isSaving ? "Creating..." : "Create Class"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Section Modal */}
            <AnimatePresence>
                {showCreateSectionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Add Section to {selectedClass?.name}</h3>
                                <button onClick={() => setShowCreateSectionModal(false)} className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSection} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Section Name</label>
                                    <input
                                        value={sectionForm.name}
                                        onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="e.g. A, B, C"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Max Students</label>
                                    <input
                                        type="number"
                                        value={sectionForm.maxStudents}
                                        onChange={(e) => setSectionForm({ ...sectionForm, maxStudents: parseInt(e.target.value) })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Class Teacher</label>
                                    <select
                                        value={sectionForm.classTeacher}
                                        onChange={(e) => setSectionForm({ ...sectionForm, classTeacher: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 mt-4"
                                >
                                    {isSaving ? "Creating..." : "Create Section"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Class Modal */}
            <AnimatePresence>
                {showEditClassModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Edit Class</h3>
                                <button onClick={() => setShowEditClassModal(false)} className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateClass} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Class Name</label>
                                    <input
                                        value={editClassForm.name}
                                        onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department</label>
                                    <select
                                        value={editClassForm.department}
                                        onChange={(e) => setEditClassForm({ ...editClassForm, department: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Semester</label>
                                    <select
                                        value={editClassForm.semester}
                                        onChange={(e) => setEditClassForm({ ...editClassForm, semester: parseInt(e.target.value) })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        required
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Academic Year</label>
                                    <input
                                        value={editClassForm.academicYear}
                                        onChange={(e) => setEditClassForm({ ...editClassForm, academicYear: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editClassForm.isActive}
                                        onChange={(e) => setEditClassForm({ ...editClassForm, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Active</label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 mt-4"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Section Modal */}
            <AnimatePresence>
                {showEditSectionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Edit Section</h3>
                                <button onClick={() => setShowEditSectionModal(false)} className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveSectionEdit} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Section Name</label>
                                    <input
                                        value={editSectionForm.name}
                                        onChange={(e) => setEditSectionForm({ ...editSectionForm, name: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Max Students</label>
                                    <input
                                        type="number"
                                        value={editSectionForm.maxStudents}
                                        onChange={(e) => setEditSectionForm({ ...editSectionForm, maxStudents: parseInt(e.target.value) })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Class Teacher</label>
                                    <select
                                        value={editSectionForm.classTeacher}
                                        onChange={(e) => setEditSectionForm({ ...editSectionForm, classTeacher: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editSectionForm.isActive}
                                        onChange={(e) => setEditSectionForm({ ...editSectionForm, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Active</label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 mt-4"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Move Students Modal */}
            <AnimatePresence>
                {showMoveStudentsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"} max-h-[90vh] overflow-y-auto`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Move Students</h3>
                                <button onClick={() => {
                                    setShowMoveStudentsModal(false);
                                    setMoveForm({ sourceSection: "", targetClass: "", targetSection: "" });
                                    setSelectedStudentIds([]);
                                    setAvailableStudents([]);
                                    setStudentFilters({ year: "", department: "", branch: "" });
                                }} className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleMoveStudents} className="space-y-4">
                                {/* Source Section */}
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Source Section</label>
                                    <select
                                        value={moveForm.sourceSection}
                                        onChange={(e) => {
                                            setMoveForm({ ...moveForm, sourceSection: e.target.value });
                                            setSelectedStudentIds([]);
                                            setStudentFilters({ year: "", department: "", branch: "" });
                                            loadStudentsForMove(e.target.value);
                                        }}
                                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                        required
                                    >
                                        <option value="">Select Source Section</option>
                                        {sections.map(s => (
                                            <option key={s._id} value={s._id}>{selectedClass?.name} - Section {s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Student Selection */}
                                {moveForm.sourceSection && (
                                    <div className={`border rounded-xl p-4 ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                Select Students ({selectedStudentIds.length} selected)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={toggleSelectAll}
                                                className={`text-xs px-2 py-1 rounded ${isDarkMode ? "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                                            >
                                                {selectedStudentIds.length === filteredStudents().length && filteredStudents().length > 0 ? "Deselect All" : "Select All"}
                                            </button>
                                        </div>

                                        {/* Filters */}
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <select
                                                value={studentFilters.year}
                                                onChange={(e) => setStudentFilters({ ...studentFilters, year: e.target.value })}
                                                className={`px-2 py-1 rounded-lg text-sm border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} outline-none`}
                                            >
                                                <option value="">All Years</option>
                                                {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                                            </select>
                                            <select
                                                value={studentFilters.department}
                                                onChange={(e) => setStudentFilters({ ...studentFilters, department: e.target.value })}
                                                className={`px-2 py-1 rounded-lg text-sm border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} outline-none`}
                                            >
                                                <option value="">All Depts</option>
                                                {departments.map(d => <option key={d._id} value={d.name}>{d.code}</option>)}
                                            </select>
                                            <input
                                                type="text"
                                                value={studentFilters.branch}
                                                onChange={(e) => setStudentFilters({ ...studentFilters, branch: e.target.value })}
                                                placeholder="Branch..."
                                                className={`px-2 py-1 rounded-lg text-sm border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} outline-none`}
                                            />
                                        </div>

                                        {/* Search */}
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                value={studentSearchQuery}
                                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                placeholder="Search by name, email, or BT ID..."
                                                className={`w-full px-3 py-2 rounded-lg text-sm border ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} outline-none focus:ring-2 focus:ring-blue-500`}
                                            />
                                        </div>

                                        {/* Student List */}
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {filteredStudents().length === 0 ? (
                                                <p className={`text-sm text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                                    {availableStudents.length === 0 ? "No students in this section" : "No students match your search"}
                                                </p>
                                            ) : (
                                                filteredStudents().map(student => (
                                                    <label
                                                        key={student._id}
                                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudentIds.includes(student._id)}
                                                            onChange={() => toggleStudentSelection(student._id)}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{student.name}</p>
                                                            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{student.email}</p>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Target Class & Section */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Target Class</label>
                                        <select
                                            value={moveForm.targetClass}
                                            onChange={(e) => setMoveForm({ ...moveForm, targetClass: e.target.value, targetSection: "" })}
                                            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.name} ({c.department?.name})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Target Section</label>
                                        <SectionDropdown
                                            classId={moveForm.targetClass}
                                            value={moveForm.targetSection}
                                            onChange={(val) => setMoveForm({ ...moveForm, targetSection: val })}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving || selectedStudentIds.length === 0}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "Moving..." : `Move ${selectedStudentIds.length} Student(s)`}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

// Helper component to fetch sections for dropdown
const SectionDropdown = ({ classId, value, onChange, isDarkMode }) => {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        if (classId) {
            ADMIN_API.get("/sections", { params: { class: classId } })
                .then(res => setSections(res.data?.sections || []))
                .catch(err => console.error(err));
        } else {
            setSections([]);
        }
    }, [classId]);

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`}
            required
            disabled={!classId}
        >
            <option value="">Select Section</option>
            {sections.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
            ))}
        </select>
    );
};

export default ClassManagement;
