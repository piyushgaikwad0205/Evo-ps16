import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiUserGroup,
  HiPlus,
  HiPencil,
  HiTrash,
  HiCheck,
  HiXMark,
  HiMagnifyingGlass,
  HiPhoto,
} from "react-icons/hi2";
import { getClubs, createClub, updateClub, assignClubHeads, deleteClub, removeClubMember, suspendUser } from "../../redux/api/adminAPI";
import { ADMIN_API } from "../../redux/api/utils";
import { getBannerUrl, handleImageError, getAvatarUrl } from "../../utils/imageUtils";
import { useTheme } from "../../contexts/ThemeContext";

const ClubManagement = () => {
  const { isDarkMode } = useTheme();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", banner: null });
  const [heads, setHeads] = useState({ headId: "", coHeadId: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const { data: clubList } = await getClubs();
      // Use ADMIN_API to get users to avoid auth issues
      const res = await ADMIN_API.get("/users");
      const userList = res.data?.users || res.data || [];

      setClubs(clubList || []);
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, banner: file });
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (form.banner) {
        formData.append('banner', form.banner);
      }

      await createClub(formData);
      await load();
      setForm({ name: "", description: "", banner: null });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating club:', error);
      alert("Failed to create club");
    } finally {
      setIsSaving(false);
    }
  };

  const onAssign = async () => {
    if (!selectedClub) return;
    setIsSaving(true);
    try {
      await assignClubHeads(selectedClub._id, heads);
      await load();
      alert("Club heads assigned successfully");
    } catch (error) {
      console.error('Error assigning heads:', error);
      alert("Failed to assign club heads");
    } finally {
      setIsSaving(false);
    }
  };

  const [bannerFile, setBannerFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);

  useEffect(() => {
    setBannerFile(null);
    setIconFile(null);
  }, [selectedClub?._id]);

  const onUpdate = async () => {
    if (!selectedClub) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', selectedClub.name);
      formData.append('description', selectedClub.description);
      formData.append('isActive', selectedClub.isActive !== false);
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }
      if (iconFile) {
        formData.append('icon', iconFile);
      }

      await updateClub(selectedClub._id, formData);

      // Reset file states to clear preview
      setBannerFile(null);
      setIconFile(null);

      // Small delay to ensure backend has processed the file
      await new Promise(resolve => setTimeout(resolve, 500));

      await load();

      // Update local selected club to reflect changes immediately (especially for text fields)
      // For banner, load() refreshes the list, we might need to re-find the club to get new banner URL
      const { data: updatedList } = await getClubs();
      const updated = updatedList.find(c => c._id === selectedClub._id);
      if (updated) {
        // Force new object reference to trigger re-render and bypass cache
        setSelectedClub({ ...updated, _refreshKey: Date.now() });
      }

      alert("Club updated successfully");
    } catch (error) {
      console.error('Error updating club:', error);
      alert("Failed to update club");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!selectedClub) return;
    if (!window.confirm(`Delete club "${selectedClub.name}"? This cannot be undone.`)) return;
    setIsSaving(true);
    try {
      await deleteClub(selectedClub._id);
      await load();
      setSelectedClub(null);
    } catch (error) {
      console.error('Error deleting club:', error);
      alert("Failed to delete club");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this user from the club?")) return;
    setIsSaving(true);
    try {
      await removeClubMember(selectedClub._id, userId);
      const { data: clubList } = await getClubs();
      setClubs(clubList || []);
      const updated = clubList.find(c => c._id === selectedClub._id);
      if (updated) setSelectedClub(updated);
      alert("Member removed successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to remove member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm("Are you sure you want to suspend this user's account?")) return;
    try {
      await suspendUser(userId);
      alert("User suspended successfully");
    } catch (e) { console.error(e); alert("Failed to suspend user"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Club Management
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Manage student clubs, heads, and activities
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <HiPlus className="w-5 h-5" />
          Create Club
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clubs List */}
        <div className={`lg:col-span-1 rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
          <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
            <h2 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>All Clubs</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : clubs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No clubs found</div>
            ) : (
              <div className="divide-y dark:divide-white/5">
                {clubs.map((club) => (
                  <div
                    key={club._id}
                    onClick={() => {
                      setSelectedClub(club);
                      setHeads({
                        headId: club.head?._id || "",
                        coHeadId: club.coHead?._id || ""
                      });
                    }}
                    className={`p-4 cursor-pointer transition-colors flex items-center gap-3 ${selectedClub?._id === club._id
                      ? isDarkMode ? "bg-blue-600/10 border-l-4 border-blue-500" : "bg-blue-50 border-l-4 border-blue-500"
                      : isDarkMode ? "hover:bg-white/5 border-l-4 border-transparent" : "hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                  >
                    <img
                      src={getBannerUrl(club.banner) || "https://placehold.co/40x40?text=No+Banner"}
                      alt={club.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-200"
                      onError={(e) => handleImageError(e, 'banner')}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{club.name}</h3>
                      <p className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {club.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Club Details / Edit */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {selectedClub ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl shadow-sm border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Banner Upload */}
                    <div className="relative group cursor-pointer shrink-0">
                      <img
                        src={bannerFile ? URL.createObjectURL(bannerFile) : (getBannerUrl(selectedClub.banner) || "https://placehold.co/80x80")}
                        alt={selectedClub.name}
                        className="w-20 h-20 rounded-xl object-cover shadow-sm group-hover:opacity-75 transition-all"
                        onError={(e) => handleImageError(e, 'banner')}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/30 rounded-xl">
                        <HiPencil className="text-white w-6 h-6 drop-shadow-md" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Change Banner"
                        />
                      </div>
                      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-medium rounded ${isDarkMode ? "bg-dark-bg text-gray-400" : "bg-white text-gray-600"} shadow-sm`}>
                        Banner
                      </div>
                    </div>

                    {/* Icon Upload */}
                    <div className="relative group cursor-pointer shrink-0">
                      <img
                        src={iconFile ? URL.createObjectURL(iconFile) : (getAvatarUrl(selectedClub.icon) || "https://placehold.co/80x80")}
                        alt={`${selectedClub.name} icon`}
                        className="w-20 h-20 rounded-full object-cover shadow-sm group-hover:opacity-75 transition-all ring-2 ring-blue-500/20"
                        onError={(e) => handleImageError(e, 'avatar')}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/30 rounded-full">
                        <HiPencil className="text-white w-6 h-6 drop-shadow-md" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Change Icon"
                        />
                      </div>
                      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-medium rounded ${isDarkMode ? "bg-dark-bg text-gray-400" : "bg-white text-gray-600"} shadow-sm`}>
                        Icon
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Club Name</label>
                        <input
                          value={selectedClub.name}
                          onChange={(e) => setSelectedClub({ ...selectedClub, name: e.target.value })}
                          className={`w-full bg-transparent border-b ${isDarkMode ? "border-white/10 text-white focus:border-blue-500" : "border-gray-200 text-gray-900 focus:border-blue-500"} outline-none text-xl font-bold py-1 transition-colors`}
                          placeholder="Enter club name"
                        />
                      </div>

                      <button
                        onClick={() => setSelectedClub({ ...selectedClub, isActive: !selectedClub.isActive })}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${selectedClub.isActive !== false ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}
                      >
                        {selectedClub.isActive !== false ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={onDelete}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-4"
                    title="Delete Club"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                      <textarea
                        value={selectedClub.description}
                        onChange={(e) => setSelectedClub({ ...selectedClub, description: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Heads Assignment */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                    <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Leadership</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Club Head</label>
                        <select
                          value={heads.headId}
                          onChange={(e) => setHeads({ ...heads, headId: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                        >
                          <option value="">Select Head</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Co-Head</label>
                        <select
                          value={heads.coHeadId}
                          onChange={(e) => setHeads({ ...heads, coHeadId: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                        >
                          <option value="">Select Co-Head</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={onAssign}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {isSaving ? "Saving..." : "Update Leadership"}
                      </button>
                    </div>
                  </div>

                  {/* Members Management */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-200"}`}>
                    <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Members ({selectedClub.members?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                      {users.filter(u => selectedClub.members?.some(m => (m._id || m).toString() === u._id.toString())).map(member => (
                        <div key={member._id} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"} border ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                          <div className="flex items-center gap-3">
                            <img
                              src={getAvatarUrl(member.avatar)}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{member.name}</div>
                              <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{member.email}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              title="Remove from Club"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => handleSuspendUser(member._id)}
                              className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              title="Suspend User Account"
                            >
                              Suspend
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!selectedClub.members || selectedClub.members.length === 0) && (
                        <div className="text-center text-sm text-gray-500 py-4">No members yet.</div>
                      )}
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
                <HiUserGroup className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a club to view details</p>
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
              className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Create New Club</h3>
                <button onClick={() => setShowCreateModal(false)} className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                  <HiXMark className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                </button>
              </div>

              <form onSubmit={onCreate} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Club Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                    placeholder="e.g. Coding Club"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`}
                    placeholder="What is this club about?"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Banner Image</label>
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${isDarkMode ? "border-white/10 hover:border-blue-500/50" : "border-gray-300 hover:border-blue-500"}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center">
                      <HiPhoto className={`w-8 h-8 mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                      <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {form.banner ? form.banner.name : "Click to upload banner"}
                      </span>
                    </label>
                  </div>
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
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20"
                  >
                    {isSaving ? "Creating..." : "Create Club"}
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

export default ClubManagement;

