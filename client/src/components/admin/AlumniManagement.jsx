import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiAcademicCap,
  HiCheckCircle,
  HiXCircle,
  HiTrash,
  HiPlus,
  HiMagnifyingGlass,
  HiUserPlus,
  HiEnvelope,
} from "react-icons/hi2";
import { getAllAlumni, updateAlumniUploadPermission, deleteAlumni, createAlumni } from "../../redux/api/adminAPI";
import { getAlumniRequests, rejectAlumniRequest, approveAlumniRequest } from "../../redux/api/adminAPI";
import { useTheme } from "../../contexts/ThemeContext";

const AlumniManagement = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'requests'
  const [alumniList, setAlumniList] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlumni, setNewAlumni] = useState({
    name: "", email: "", password: "", department: "", graduationYear: "",
    currentEmployer: "", position: "", industry: "", experience: "",
    linkedinUrl: "", githubUrl: "", skills: "", bio: "", location: "", interests: ""
  });
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAlumni();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredAlumni(alumniList.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.department && a.department.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    } else {
      setFilteredAlumni(alumniList);
    }
  }, [searchTerm, alumniList]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const { error, data } = await getAllAlumni();
      if (error) throw new Error(error);
      setAlumniList(data);
      setFilteredAlumni(data);
    } catch (err) {
      setError("Failed to fetch alumni list");
      console.error("Error fetching alumni:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const { error, data } = await getAlumniRequests("pending");
      if (error) throw new Error(error);
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const approveRequest = async (reqItem) => {
    setCreating(true);
    const { error } = await approveAlumniRequest(reqItem._id);
    setCreating(false);
    if (!error) {
      setSuccess("Approved and account created. Credentials emailed to user.");
      await Promise.all([fetchAlumni(), fetchRequests()]);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError("Failed to approve request");
      setTimeout(() => setError(null), 3000);
    }
  };

  const rejectRequest = async (id) => {
    if (!window.confirm("Reject this request?")) return;
    const { error } = await rejectAlumniRequest(id);
    if (!error) {
      await fetchRequests();
    }
  };

  const toggleUploadPermission = async (alumniId, currentPermission) => {
    try {
      const { error, data } = await updateAlumniUploadPermission(alumniId, !currentPermission);
      if (error) throw new Error(error);

      setAlumniList(prevList =>
        prevList.map(alumni =>
          alumni._id === alumniId
            ? { ...alumni, uploadPermission: !currentPermission }
            : alumni
        )
      );
      setSuccess(data.message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update upload permission");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteAlumni = async (alumniId, name) => {
    try {
      if (!window.confirm(`Delete alumni "${name}"? This cannot be undone.`)) return;
      const { error } = await deleteAlumni(alumniId);
      if (error) throw new Error(error);
      await fetchAlumni();
      setSuccess("Alumni deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete alumni");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCreateAlumni = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { error } = await createAlumni({
        ...newAlumni,
        graduationYear: newAlumni.graduationYear ? Number(newAlumni.graduationYear) : null
      });

      if (!error) {
        await fetchAlumni();
        setNewAlumni({
          name: "", email: "", password: "", department: "", graduationYear: "",
          currentEmployer: "", position: "", industry: "", experience: "",
          linkedinUrl: "", githubUrl: "", skills: "", bio: "", location: "", interests: ""
        });
        setShowCreateModal(false);
        setSuccess("Alumni created successfully");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(error);
      }
    } catch (err) {
      setError("Failed to create alumni");
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAlumni(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Alumni Management
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Manage alumni database and verification requests
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <HiPlus className="w-5 h-5" />
            Add Alumni
          </button>
        </div>
      </div>

      {/* Stats / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab("list")}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === "list"
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 border-transparent"
            : isDarkMode ? "bg-dark-bg-secondary border-white/5 hover:bg-white/5" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm font-medium ${activeTab === "list" ? "text-blue-100" : "text-gray-500"}`}>Total Alumni</p>
              <h3 className={`text-2xl font-bold ${activeTab === "list" ? "text-white" : isDarkMode ? "text-white" : "text-gray-900"}`}>
                {alumniList.length}
              </h3>
            </div>
            <HiAcademicCap className={`w-10 h-10 ${activeTab === "list" ? "text-white/20" : "text-blue-500/20"}`} />
          </div>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`p-4 rounded-xl border text-left transition-all ${activeTab === "requests"
            ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 border-transparent"
            : isDarkMode ? "bg-dark-bg-secondary border-white/5 hover:bg-white/5" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm font-medium ${activeTab === "requests" ? "text-purple-100" : "text-gray-500"}`}>Pending Requests</p>
              <h3 className={`text-2xl font-bold ${activeTab === "requests" ? "text-white" : isDarkMode ? "text-white" : "text-gray-900"}`}>
                {requests.length}
              </h3>
            </div>
            <HiUserPlus className={`w-10 h-10 ${activeTab === "requests" ? "text-white/20" : "text-purple-500/20"}`} />
          </div>
        </button>
      </div>

      {/* Content Area */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
        {activeTab === "list" && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4 bg-gray-100 dark:bg-white/5 p-2 rounded-xl">
              <HiMagnifyingGlass className="w-5 h-5 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search alumni by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm p-1 dark:text-white"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-400 border-white/5" : "text-gray-500 border-gray-100"} border-b`}>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Department</th>
                    <th className="p-4 font-medium">Grad Year</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-100"}`}>
                  {filteredAlumni.map((alumni) => (
                    <tr key={alumni._id} className={`group ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={alumni.avatar || "https://via.placeholder.com/40"}
                            alt={alumni.name}
                            className="w-10 h-10 rounded-full object-cover bg-gray-200"
                          />
                          <div>
                            <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{alumni.name}</p>
                            <p className="text-xs text-gray-500">{alumni.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{alumni.department || "-"}</td>
                      <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{alumni.graduationYear || "-"}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${alumni.uploadPermission
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}>
                          {alumni.uploadPermission ? "Verified" : "Restricted"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleUploadPermission(alumni._id, alumni.uploadPermission)}
                            className={`p-2 rounded-lg transition-colors ${alumni.uploadPermission
                              ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                              }`}
                            title={alumni.uploadPermission ? "Revoke Upload Permission" : "Grant Upload Permission"}
                          >
                            {alumni.uploadPermission ? <HiXCircle className="w-5 h-5" /> : <HiCheckCircle className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteAlumni(alumni._id, alumni.name)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Alumni"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="p-6">
            {requestsLoading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                <p>No pending requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req) => (
                  <div key={req._id} className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isDarkMode ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {req.name.charAt(0)}
                      </div>
                      <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">
                        {req.graduationYear}
                      </span>
                    </div>
                    <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{req.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{req.email}</p>
                    <p className={`text-xs mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{req.department}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => approveRequest(req)}
                        disabled={creating}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectRequest(req._id)}
                        className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Add New Alumni</h3>
              <form onSubmit={handleCreateAlumni} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Name *</label>
                    <input name="name" value={newAlumni.name} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} required />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email *</label>
                    <input type="email" name="email" value={newAlumni.email} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} required />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Password *</label>
                    <input type="password" name="password" value={newAlumni.password} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} required />
                  </div>

                  {/* Academic Info */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Department</label>
                    <input name="department" value={newAlumni.department} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Grad Year</label>
                    <input type="number" name="graduationYear" value={newAlumni.graduationYear} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Location</label>
                    <input name="location" value={newAlumni.location} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>

                  {/* Professional Info */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Current Employer</label>
                    <input name="currentEmployer" value={newAlumni.currentEmployer} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Position</label>
                    <input name="position" value={newAlumni.position} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Industry</label>
                    <input name="industry" value={newAlumni.industry} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Experience (Years)</label>
                    <input name="experience" value={newAlumni.experience} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>LinkedIn URL</label>
                    <input name="linkedinUrl" value={newAlumni.linkedinUrl} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>GitHub URL</label>
                    <input name="githubUrl" value={newAlumni.githubUrl} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Skills (comma separated)</label>
                  <input name="skills" value={newAlumni.skills} onChange={handleChange} placeholder="React, Node.js, AI" className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Interests (comma separated)</label>
                  <input name="interests" value={newAlumni.interests} onChange={handleChange} placeholder="Mentoring, Guest Lectures" className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Bio</label>
                  <textarea name="bio" value={newAlumni.bio} onChange={handleChange} rows={3} className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} outline-none focus:ring-2 focus:ring-blue-500 resize-none`} />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 px-4 py-2 rounded-xl border ${isDarkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20"
                  >
                    {creating ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success/Error Toasts */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg font-medium ${success ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
          >
            {success || error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlumniManagement;