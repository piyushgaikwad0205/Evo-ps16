import React, { useEffect, useState } from "react";
import { HiOutlineArrowPath, HiMagnifyingGlass, HiBuildingLibrary, HiPencilSquare, HiNoSymbol, HiLockClosed, HiCheckCircle, HiXMark, HiUsers, HiUserGroup, HiShieldExclamation, HiShieldCheck } from "react-icons/hi2";
import { getGlobalUsers, getCollegesList, updateGlobalUserStatus, updateGlobalUser, getGlobalStats } from "../../redux/api/adminAPI";
import CommonLoading from "../loader/CommonLoading";
import { useTheme } from "../../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const GlobalUserManagement = ({ initialFilter }) => {
    const { isDarkMode } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [colleges, setColleges] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        blockedUsers: 0
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: "",
        role: "",
        collegeId: "",
        status: ""
    });

    // Apply initial filter when component mounts or initialFilter changes
    useEffect(() => {
        if (initialFilter) {
            setFilters(prev => ({
                ...prev,
                status: initialFilter === "all" ? "" : initialFilter
            }));
        }
    }, [initialFilter]);

    // Modal States
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [suspendDuration, setSuspendDuration] = useState("7");
    const [editForm, setEditForm] = useState({
        username: "",
        email: ""
    });

    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const fetchColleges = async () => {
        const { data } = await getCollegesList();
        if (data) setColleges(data);
    };

    const fetchStats = async () => {
        const { data } = await getGlobalStats();
        if (data) {
            setStats({
                totalUsers: data.totalUsers || 0,
                activeUsers: data.activeUsers || 0,
                suspendedUsers: data.suspendedUsers || 0,
                blockedUsers: data.blockedUsers || 0
            });
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        const { error, data } = await getGlobalUsers({
            page,
            limit: 20,
            search: debouncedSearch,
            role: filters.role,
            collegeId: filters.collegeId,
            status: filters.status
        });
        if (data) {
            setUsers(data.users);
            setTotalPages(data.totalPages);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchColleges();
        fetchStats();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [page, debouncedSearch, filters.role, filters.collegeId, filters.status]);

    const handleAction = async (action, user) => {
        if (action === "suspend") {
            setSelectedUser(user);
            setShowSuspendModal(true);
        } else if (action === "edit") {
            setSelectedUser(user);
            setEditForm({ username: user.username, email: user.email });
            setShowEditModal(true);
        } else if (action === "block") {
            if (window.confirm(`Are you sure you want to permanently block ${user.username || user.email}?`)) {
                try {
                    const { error, data } = await updateGlobalUserStatus(user._id, { action: "block" });
                    if (error) {
                        alert(`Error: ${error.message || 'Failed to block user'}`);
                    } else {
                        alert('User blocked successfully');
                        fetchUsers();
                        fetchStats();
                    }
                } catch (err) {
                    alert('Failed to block user');
                    console.error(err);
                }
            }
        } else if (action === "activate") {
            if (window.confirm(`Re-activate ${user.username || user.email}?`)) {
                try {
                    const { error, data } = await updateGlobalUserStatus(user._id, { action: "activate" });
                    if (error) {
                        alert(`Error: ${error.message || 'Failed to activate user'}`);
                    } else {
                        alert('User activated successfully');
                        fetchUsers();
                        fetchStats();
                    }
                } catch (err) {
                    alert('Failed to activate user');
                    console.error(err);
                }
            }
        }
    };

    const submitSuspend = async () => {
        try {
            const { error, data } = await updateGlobalUserStatus(selectedUser._id, {
                action: "suspend",
                duration: parseInt(suspendDuration)
            });
            if (error) {
                alert(`Error: ${error.message || 'Failed to suspend user'}`);
            } else {
                alert(`User suspended for ${suspendDuration} day(s)`);
                setShowSuspendModal(false);
                fetchUsers();
                fetchStats();
            }
        } catch (err) {
            alert('Failed to suspend user');
            console.error(err);
        }
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            const { error, data } = await updateGlobalUser(selectedUser._id, editForm);
            if (error) {
                alert(`Error: ${error.message || 'Failed to update user'}`);
            } else {
                alert('User updated successfully');
                setShowEditModal(false);
                fetchUsers();
            }
        } catch (err) {
            alert('Failed to update user');
            console.error(err);
        }
    };

    return (
        <div className="p-6 relative">
            <div className="mb-6">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global User Management</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage users across all colleges</p>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFilters({ ...filters, status: "" })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isDarkMode ? 'bg-dark-bg border-white/10 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-500'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
                            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                Click to view all
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <HiUsers className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFilters({ ...filters, status: "active" })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isDarkMode ? 'bg-dark-bg border-white/10 hover:border-green-500/50' : 'bg-white border-gray-200 hover:border-green-500'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</p>
                            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeUsers}</p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                Click to filter
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <HiShieldCheck className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFilters({ ...filters, status: "suspended" })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isDarkMode ? 'bg-dark-bg border-white/10 hover:border-orange-500/50' : 'bg-white border-gray-200 hover:border-orange-500'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Suspended Users</p>
                            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.suspendedUsers}</p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                Click to filter
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-500/10">
                            <HiShieldExclamation className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setFilters({ ...filters, status: "blocked" })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isDarkMode ? 'bg-dark-bg border-white/10 hover:border-red-500/50' : 'bg-white border-gray-200 hover:border-red-500'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Blocked Users</p>
                            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.blockedUsers}</p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                Click to filter
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10">
                            <HiUserGroup className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center px-4 py-2 rounded-xl border flex-1 min-w-[200px] ${isDarkMode ? 'bg-dark-bg border-white/10' : 'bg-white border-gray-200'}`}>
                        <HiMagnifyingGlass className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            placeholder="Search users..."
                            className={`ml-3 bg-transparent outline-none text-sm w-full ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <select
                            className={`pl-10 pr-4 py-2 rounded-xl border outline-none text-sm appearance-none cursor-pointer ${isDarkMode ? 'bg-dark-bg border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            value={filters.collegeId}
                            onChange={(e) => setFilters({ ...filters, collegeId: e.target.value })}
                        >
                            <option value="">All Colleges</option>
                            {colleges.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        <HiBuildingLibrary className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>

                    <select
                        className={`px-4 py-2 rounded-xl border outline-none text-sm cursor-pointer ${isDarkMode ? 'bg-dark-bg border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    >
                        <option value="">All Roles</option>
                        <option value="general">Student</option>
                        <option value="alumni">Alumni</option>
                    </select>

                    <select
                        className={`px-4 py-2 rounded-xl border outline-none text-sm cursor-pointer ${isDarkMode ? 'bg-dark-bg border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                    </select>

                    <button
                        onClick={() => { fetchUsers(); fetchStats(); }}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <HiOutlineArrowPath className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">College</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center">
                                        <CommonLoading />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className={`py-8 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className={`${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {user.avatar || user.profilePicture ? (
                                                    <img
                                                        src={user.avatar || user.profilePicture}
                                                        alt={user.username}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                                        {(user.username || user.email || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.username}</div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'alumni'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {user.collegeId?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.isBlocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                user.isSuspended
                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : user.isSuspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleAction('edit', user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit">
                                                    <HiPencilSquare className="w-5 h-5" />
                                                </button>
                                                {user.isSuspended || user.isBlocked ? (
                                                    <button onClick={() => handleAction('activate', user)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Activate">
                                                        <HiCheckCircle className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleAction('suspend', user)} className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300" title="Suspend">
                                                            <HiNoSymbol className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleAction('block', user)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Block">
                                                            <HiLockClosed className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className={`px-4 py-2 text-sm rounded-lg ${isDarkMode ? 'bg-white/5 disabled:opacity-50' : 'bg-gray-100 disabled:opacity-50'}`}
                >
                    Previous
                </button>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className={`px-4 py-2 text-sm rounded-lg ${isDarkMode ? 'bg-white/5 disabled:opacity-50' : 'bg-gray-100 disabled:opacity-50'}`}
                >
                    Next
                </button>
            </div>

            {/* Suspend Modal */}
            <AnimatePresence>
                {showSuspendModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuspendModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl shadow-2xl z-50 ${isDarkMode ? 'bg-dark-bg border border-white/10' : 'bg-white'}`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Suspend User</h3>
                            <p className="mb-4 text-sm text-gray-500">Select suspension duration for {selectedUser?.username}</p>
                            <select
                                className={`w-full p-3 rounded-xl border mb-6 outline-none ${isDarkMode ? 'bg-dark-bg-secondary border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                                value={suspendDuration}
                                onChange={(e) => setSuspendDuration(e.target.value)}
                            >
                                <option value={1}>1 Day</option>
                                <option value={3}>3 Days</option>
                                <option value={7}>1 Week</option>
                                <option value={30}>1 Month</option>
                                <option value={365}>1 Year</option>
                            </select>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowSuspendModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                <button onClick={submitSuspend} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Confirm Suspend</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl shadow-2xl z-50 ${isDarkMode ? 'bg-dark-bg border border-white/10' : 'bg-white'}`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit User</h3>
                            <form onSubmit={submitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm mb-1 text-gray-500">Username</label>
                                    <input
                                        className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-dark-bg-secondary border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                                        value={editForm.username}
                                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-gray-500">Email</label>
                                    <input
                                        className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-dark-bg-secondary border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        required
                                        type="email"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalUserManagement;
