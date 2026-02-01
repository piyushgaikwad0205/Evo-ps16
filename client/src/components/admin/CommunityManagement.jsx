import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiUserGroup,
  HiPlus,
  HiTrash,
  HiXMark,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import {
  getCommunitiesAction,
  getModeratorsAction,
  addModeratorAction,
  removeModeratorAction,
  getCommunityAction,
} from "../../redux/actions/adminActions";
import { deleteCommunity, createCommunity as createCommunityAPI } from "../../redux/api/adminAPI";
import { useTheme } from "../../contexts/ThemeContext";

const CommunityManagement = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const communities = useSelector((state) => state.admin?.communities);
  const moderators = useSelector((state) => state.admin?.moderators);
  const community = useSelector((state) => state.admin?.community);

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedCommunityData, setSelectedCommunityData] = useState(null);
  const [newModerator, setNewModerator] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingCommunity, setIsChangingCommunity] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "", banner: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getCommunitiesAction());
    dispatch(getModeratorsAction());
  }, [dispatch]);

  useEffect(() => {
    setSelectedCommunityData(community);
  }, [community]);

  const handleCommunitySelect = async (comm) => {
    setSelectedCommunity(comm);
    setIsChangingCommunity(true);
    await dispatch(getCommunityAction(comm._id));
    setIsChangingCommunity(false);
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!newCommunity.name.trim()) {
      alert("Name is required!");
      return;
    }
    setIsUpdating(true);
    try {
      await createCommunityAPI(newCommunity);
      await dispatch(getCommunitiesAction());
      setNewCommunity({ name: "", description: "", banner: "" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create community", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!selectedCommunityData) return;
    if (!window.confirm(`Delete community "${selectedCommunityData.name}"? This cannot be undone.`)) return;
    setIsUpdating(true);
    try {
      await deleteCommunity(selectedCommunityData._id);
      await dispatch(getCommunitiesAction());
      setSelectedCommunity(null);
      setSelectedCommunityData(null);
    } catch (error) {
      console.error("Failed to delete community", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveModerator = async (moderator) => {
    if (!window.confirm(`Remove ${moderator.name} as moderator?`)) return;
    setIsUpdating(true);
    try {
      await dispatch(removeModeratorAction(selectedCommunityData._id, moderator._id));
      await dispatch(getCommunityAction(selectedCommunityData._id));
      await dispatch(getModeratorsAction());
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddModerator = async () => {
    if (!newModerator) return;
    setIsUpdating(true);
    try {
      await dispatch(addModeratorAction(selectedCommunityData._id, newModerator));
      await dispatch(getCommunityAction(selectedCommunityData._id));
      await dispatch(getModeratorsAction());
      setNewModerator("");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCommunities = communities?.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Community Management
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Oversee global communities and membership
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium"
        >
          <HiPlus className="w-5 h-5" />
          Create Community
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Communities List */}
        <div className={`lg:col-span-4 flex flex-col rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
          <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
            <div className={`relative px-4 py-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? "bg-dark-bg border-white/10" : "bg-gray-50 border-gray-200"}`}>
              <HiMagnifyingGlass className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search communities..."
                className={`bg-transparent outline-none w-full text-sm ${isDarkMode ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {!communities ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : filteredCommunities?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No communities found</div>
            ) : (
              filteredCommunities?.map((comm) => (
                <div
                  key={comm._id}
                  onClick={() => handleCommunitySelect(comm)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group ${selectedCommunity?._id === comm._id
                    ? isDarkMode ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-700"
                    : isDarkMode ? "hover:bg-white/5 text-gray-300 hover:text-white" : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    }`}
                >
                  <img
                    src={comm.banner || "https://placehold.co/40"}
                    alt={comm.name}
                    className={`w-10 h-10 rounded-full object-cover ring-2 ${selectedCommunity?._id === comm._id ? (isDarkMode ? "ring-blue-500/50" : "ring-blue-200") : "ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-white/10"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{comm.name}</h3>
                    <p className={`text-xs truncate ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-500 group-hover:text-gray-600"}`}>
                      {comm.memberCount || 0} members
                    </p>
                  </div>
                  {selectedCommunity?._id === comm._id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Community Details */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {selectedCommunityData ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`h-full flex flex-col rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}
              >
                {/* Banner Header */}
                <div className="h-48 relative shrink-0">
                  <img
                    src={selectedCommunityData.banner || "https://placehold.co/800x200"}
                    alt={selectedCommunityData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? "from-dark-bg-secondary via-dark-bg-secondary/50" : "from-white via-white/50"} to-transparent pointer-events-none`} />

                  <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                    <div>
                      <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} drop-shadow-sm`}>
                        {selectedCommunityData.name}
                      </h2>
                      {selectedCommunityData.description && (
                        <p className={`mt-1 text-sm max-w-xl line-clamp-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"} drop-shadow-sm`}>
                          {selectedCommunityData.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleDeleteCommunity}
                      disabled={isUpdating}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl backdrop-blur-md transition-colors border border-red-500/20"
                      title="Delete Community"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isChangingCommunity ? (
                  <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-100"}`}>
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Members</div>
                        <div className={`text-2xl font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{selectedCommunityData.memberCount}</div>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/5" : "bg-gray-50 border-gray-100"}`}>
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Moderators</div>
                        <div className={`text-2xl font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{selectedCommunityData.moderatorCount}</div>
                      </div>
                    </div>

                    {/* Moderators Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Moderators</h3>
                        {/* Add Moderator */}
                        <div className="flex gap-2">
                          <div className="relative">
                            <select
                              value={newModerator}
                              onChange={(e) => setNewModerator(e.target.value)}
                              className={`w-64 pl-3 pr-8 py-2 rounded-lg border text-sm appearance-none outline-none ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="">Select user to promote...</option>
                              {moderators?.map((mod) => (
                                <option key={mod._id} value={mod._id}>{mod.name} ({mod.email})</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={handleAddModerator}
                            disabled={!newModerator || isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedCommunityData.moderators?.length === 0 ? (
                          <div className={`col-span-full py-8 text-center border border-dashed rounded-xl ${isDarkMode ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"}`}>
                            No moderators assigned.
                          </div>
                        ) : (
                          selectedCommunityData.moderators?.map((mod) => (
                            <div key={mod._id} className={`group relative p-4 rounded-xl border flex items-center gap-3 transition-all ${isDarkMode ? "bg-dark-bg border-white/5 hover:border-white/10" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br from-indigo-500 to-purple-500`}>
                                {mod.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className={`font-semibold text-sm truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{mod.name}</div>
                                <div className={`text-xs truncate ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>{mod.email}</div>
                              </div>
                              <button
                                onClick={() => handleRemoveModerator(mod)}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 bg-transparent hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove Moderator"
                              >
                                <HiXMark className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className={`h-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed ${isDarkMode ? "bg-dark-bg-secondary/30 border-white/5 text-gray-500" : "bg-gray-50/50 border-gray-300 text-gray-400"}`}>
                <div className={`p-6 rounded-full mb-6 ${isDarkMode ? "bg-white/5" : "bg-white shadow-sm"}`}>
                  <HiUserGroup className="w-16 h-16 opacity-50" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>No Community Selected</h3>
                <p className="max-w-xs text-center text-sm opacity-70">
                  Select a community from the list to view details, create announcements, or manage moderators.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border border-white/10" : "bg-white"}`}
            >
              <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Create New Community</h3>
                <button onClick={() => setShowCreateModal(false)} className={`p-1 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-200 text-gray-500"}`}>
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleCreateCommunity} className="space-y-5">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Community Name</label>
                    <input
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDarkMode ? "bg-dark-bg border-white/10 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"}`}
                      placeholder="e.g. Coding Club"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Description</label>
                    <textarea
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${isDarkMode ? "bg-dark-bg border-white/10 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"}`}
                      placeholder="What is this community about?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Banner Image URL</label>
                    <div className="flex gap-2">
                      <input
                        value={newCommunity.banner}
                        onChange={(e) => setNewCommunity({ ...newCommunity, banner: e.target.value })}
                        className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-all ${isDarkMode ? "bg-dark-bg border-white/10 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"}`}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all transform active:scale-[0.98]"
                    >
                      {isUpdating ? "Creating..." : "Create Community"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityManagement;
