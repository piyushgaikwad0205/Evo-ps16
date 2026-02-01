import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiUsers,
  HiUserGroup,
  HiAcademicCap,
  HiDocumentText,
  HiBuildingLibrary,
  HiPencil,
  HiTrash,
  HiLockClosed,
  HiLockOpen,
  HiMagnifyingGlass,
  HiXMark,
} from "react-icons/hi2";
import { ADMIN_API } from "../../redux/api/utils";
import { useTheme } from "../../contexts/ThemeContext";

const UserManagement = () => {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCommunities: 0,
    totalAlumni: 0,
    totalSurveys: 0,
    totalClubs: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await ADMIN_API.get("/users");
      setUsers(res.data?.users || res.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await ADMIN_API.get("/stats");
      const data = res.data;

      setStats({
        totalUsers: data.totalUsers || 0,
        totalCommunities: data.totalCommunities || 0,
        totalAlumni: data.usersByRole?.alumni || 0,
        totalSurveys: data.totalSurveys || 0,
        totalClubs: data.totalClubs || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? All related data will be permanently deleted.")) return;

    try {
      await ADMIN_API.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert("User and all related data deleted successfully");
      fetchStats();
    } catch (error) {
      alert("Failed to delete user: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    const action = currentStatus === "suspended" ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await ADMIN_API.patch(`/users/${userId}/suspend`, {
        suspended: currentStatus !== "suspended"
      });
      setUsers(users.map(u =>
        u._id === userId
          ? { ...u, status: currentStatus === "suspended" ? "active" : "suspended" }
          : u
      ));
      alert(`User ${action}ed successfully`);
    } catch (error) {
      alert(`Failed to ${action} user: ` + (error.response?.data?.message || error.message));
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      await ADMIN_API.patch(`/users/${selectedUser._id}`, editForm);
      setUsers(users.map(u =>
        u._id === selectedUser._id
          ? { ...u, ...editForm }
          : u
      ));
      setShowEditModal(false);
      alert("User updated successfully");
    } catch (error) {
      alert("Failed to update user: " + (error.response?.data?.message || error.message));
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overviewData = [
    { name: "Users", icon: <HiUsers className="w-6 h-6" />, count: stats.totalUsers, color: "text-blue-600", iconBg: "bg-blue-500/10", gradient: "from-blue-500 to-blue-600" },
    { name: "Communities", icon: <HiUserGroup className="w-6 h-6" />, count: stats.totalCommunities, color: "text-green-600", iconBg: "bg-green-500/10", gradient: "from-green-500 to-emerald-600" },
    { name: "Alumni", icon: <HiAcademicCap className="w-6 h-6" />, count: stats.totalAlumni, color: "text-purple-600", iconBg: "bg-purple-500/10", gradient: "from-purple-500 to-purple-600" },
    { name: "Surveys", icon: <HiDocumentText className="w-6 h-6" />, count: stats.totalSurveys, color: "text-yellow-600", iconBg: "bg-yellow-500/10", gradient: "from-yellow-500 to-orange-500" },
    { name: "Clubs", icon: <HiBuildingLibrary className="w-6 h-6" />, count: stats.totalClubs, color: "text-pink-600", iconBg: "bg-pink-500/10", gradient: "from-pink-500 to-rose-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards - Premium Glassmorphism */}


      {/* Users Table - Premium Glassmorphism */}
      <div className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"
        }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              User Management
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Total: <span className="text-blue-600 font-bold">{filteredUsers.length}</span> users
            </p>
          </div>

          {/* Premium Search Bar */}
          <div className="relative w-full sm:w-72">
            <HiMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"
              }`} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode
                ? "bg-dark-bg border-white/10 text-white placeholder-gray-500"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
            <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Loading users...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <tr>
                    <th className={`py-3 px-3 text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Avatar
                    </th>
                    <th className={`py-3 px-3 text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Name
                    </th>
                    <th className={`py-3 px-3 text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Email
                    </th>
                    <th className={`py-3 px-3 text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Role
                    </th>
                    <th className={`py-3 px-3 text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Status
                    </th>
                    <th className={`py-3 px-3 text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                      <td className="py-3 px-3">
                        <img
                          src={user.avatar || "https://via.placeholder.com/40"}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className={`py-3 px-3 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {user.name}
                      </td>
                      <td className={`py-3 px-3 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {user.email}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700" :
                          user.role === "alumni" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "suspended"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                          }`}>
                          {user.status || "active"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className={`p-2 rounded-lg transition-all ${isDarkMode ? "text-blue-400 hover:bg-blue-500/10" : "text-blue-600 hover:bg-blue-50"}`}
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user._id, user.status)}
                            className={`p-2 rounded-lg transition-all ${user.status === "suspended"
                              ? (isDarkMode ? "text-green-400 hover:bg-green-500/10" : "text-green-600 hover:bg-green-50")
                              : (isDarkMode ? "text-yellow-400 hover:bg-yellow-500/10" : "text-yellow-600 hover:bg-yellow-50")
                              }`}
                            title={user.status === "suspended" ? "Activate" : "Suspend"}
                          >
                            {user.status === "suspended" ? <HiLockOpen className="w-4 h-4" /> : <HiLockClosed className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className={`p-2 rounded-lg transition-all ${isDarkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"}`}
                            title="Delete"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user._id}
                  className={`p-4 rounded-lg border ${isDarkMode ? "bg-dark-bg border-dark-border" : "bg-gray-50 border-gray-200"
                    }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar || "https://via.placeholder.com/40"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {user.name}
                      </h3>
                      <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {user.email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700" :
                          user.role === "alumni" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                          {user.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "suspended"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                          }`}>
                          {user.status || "active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      <HiPencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleSuspendUser(user._id, user.status)}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition ${user.status === "suspended"
                        ? "text-green-600 bg-green-50 hover:bg-green-100"
                        : "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                        }`}
                    >
                      {user.status === "suspended" ? (
                        <><HiLockOpen className="w-4 h-4" /> Activate</>
                      ) : (
                        <><HiLockClosed className="w-4 h-4" /> Suspend</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      <HiTrash className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal - Mobile Responsive */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-xl shadow-xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Edit User
                </h3>
                <button onClick={() => setShowEditModal(false)} className="p-1">
                  <HiXMark className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                      ? "bg-dark-bg border-dark-border text-white"
                      : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                      ? "bg-dark-bg border-dark-border text-white"
                      : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                      ? "bg-dark-bg border-dark-border text-white"
                      : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode
                      ? "border-dark-border text-gray-300 hover:bg-dark-bg"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      } transition`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
