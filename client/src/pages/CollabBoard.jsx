import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCollabs, useInterestCollab } from '../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import CollabCreateModal from '../components/collabs/CollabCreateModal';
import AppLoader from '../components/loader/AppLoader';

const CollabBoard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { userData: currentUser } = useSelector((state) => state.auth);

  const queryClient = useQueryClient();
  const { data: collabs = [], isLoading } = useCollabs();
  const interestMutation = useInterestCollab();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [expandedCollabId, setExpandedCollabId] = useState(null); // Track which collab's interested users are shown

  const categories = ['Academic', 'Research', 'Project', 'Startup', 'Competition', 'Hackathon', 'Workshop', 'Other'];
  const statuses = ['Open', 'In Progress', 'Completed', 'On Hold'];

  // Filter user's own collaborations client-side
  const myCollabs = collabs.filter(collab => collab.user?._id === currentUser?._id);

  // In "All Collaborations", exclude user's own collabs
  const allCollabsExcludingMine = collabs.filter(collab => collab.user?._id !== currentUser?._id);

  const currentCollabs = activeTab === 'all' ? allCollabsExcludingMine : myCollabs;

  const filteredCollabs = currentCollabs.filter(collab => {
    const matchesSearch = collab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || collab.category === selectedCategory;
    const matchesStatus = !selectedStatus || collab.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 border-blue-200';
      case 'On Hold': return isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Completed': return isDarkMode ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-700 border-gray-200';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading && collabs.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AppLoader />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search collaborations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm md:max-w-md`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-3 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer`}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-3 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer`}
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {(searchTerm || selectedCategory || selectedStatus) && (
              <button
                onClick={clearFilters}
                className={`px-4 py-3 text-sm font-medium ${isDarkMode ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl transition-colors whitespace-nowrap`}
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Collab
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'all'
              ? 'bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white shadow-lg shadow-orange-500/30'
              : isDarkMode
                ? 'bg-dark-bg-secondary text-gray-400 hover:text-white border-2 border-white/10 hover:border-white/20'
                : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-gray-200 hover:border-gray-300'
              }`}
          >
            All Collaborations
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'my'
              ? 'bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white shadow-lg shadow-orange-500/30'
              : isDarkMode
                ? 'bg-dark-bg-secondary text-gray-400 hover:text-white border-2 border-white/10 hover:border-white/20'
                : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-gray-200 hover:border-gray-300'
              }`}
          >
            My Collaborations
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Showing {filteredCollabs.length} collaboration{filteredCollabs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Collaborations Grid */}
        {filteredCollabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`p-6 rounded-full mb-4 bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500 opacity-20`}>
              <svg className={`w-12 h-12 ${isDarkMode ? "text-white" : "text-gray-900"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>No collaborations found</h3>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollabs.map(collab => (
              <div
                key={collab._id}
                className={`group relative flex flex-col ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"} rounded-xl border-2 ${isDarkMode ? "border-white/5 hover:border-orange-500/30" : "border-gray-100 hover:border-orange-300"} p-4 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-1 line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:via-red-500 group-hover:to-yellow-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                      {collab.title}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"} line-clamp-2 leading-snug`}>
                      {collab.description}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-full border whitespace-nowrap ${getStatusColor(collab.status)}`}>
                    {collab.status}
                  </span>
                </div>

                {/* Skills */}
                {collab.requiredSkills?.length > 0 && (
                  <div className="mb-3">
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {collab.requiredSkills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 ${isDarkMode ? "bg-gradient-to-r from-orange-600/10 via-red-500/10 to-yellow-500/10 text-orange-400 border border-orange-500/20" : "bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700 border border-orange-200"} rounded text-[10px] font-semibold`}
                        >
                          {skill}
                        </span>
                      ))}
                      {collab.requiredSkills.length > 3 && (
                        <span className={`px-2 py-0.5 ${isDarkMode ? "bg-white/5 text-gray-400 border border-white/10" : "bg-gray-100 text-gray-600 border border-gray-200"} rounded text-[10px] font-semibold`}>
                          +{collab.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Creator Profile Section - Only in All Collaborations Tab */}
                {activeTab === 'all' && collab.user && (
                  <div
                    onClick={() => navigate(`/user/${collab.user._id}`)}
                    className={`mb-3 p-3 rounded-lg ${isDarkMode ? "bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/10 hover:border-orange-500/40" : "bg-gradient-to-r from-gray-50 to-orange-50/30 hover:from-orange-50 hover:to-orange-100/50 border border-gray-200 hover:border-orange-400"} transition-all cursor-pointer group/creator shadow-sm hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Creator Avatar */}
                      <div className="relative">
                        {collab.user.avatar ? (
                          <img
                            src={collab.user.avatar}
                            alt={collab.user.name}
                            className="w-11 h-11 rounded-full object-cover shadow-lg flex-shrink-0 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dark-bg-secondary ring-orange-500/30 group-hover/creator:ring-orange-500/60 group-hover/creator:scale-105 transition-all"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500 flex items-center justify-center text-white text-base font-bold shadow-lg flex-shrink-0 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dark-bg-secondary ring-orange-500/30 group-hover/creator:ring-orange-500/60 group-hover/creator:scale-105 transition-all"
                          style={{ display: collab.user.avatar ? 'none' : 'flex' }}
                        >
                          {collab.user.name?.charAt(0).toUpperCase() || collab.user.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg-secondary"></div>
                      </div>
                      {/* Creator Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isDarkMode ? "text-white group-hover/creator:text-orange-400" : "text-gray-900 group-hover/creator:text-orange-600"} truncate transition-colors mb-0.5`}>
                          {collab.user.name || 'Anonymous User'}
                        </p>
                        <p className={`text-[11px] ${isDarkMode ? "text-gray-400 group-hover/creator:text-gray-300" : "text-gray-600 group-hover/creator:text-gray-700"} truncate transition-colors`}>
                          {collab.user.email || collab.user.username || 'No contact info'}
                        </p>
                      </div>
                      {/* Arrow Icon */}
                      <svg
                        className={`w-4 h-4 ${isDarkMode ? "text-gray-500 group-hover/creator:text-orange-400" : "text-gray-400 group-hover/creator:text-orange-600"} transition-all group-hover/creator:translate-x-1`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className={`pt-2 border-t ${isDarkMode ? "border-white/5" : "border-gray-100"} grid grid-cols-2 gap-x-3 gap-y-2 mb-3`}>
                  <div>
                    <span className={`block text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Category
                    </span>
                    <span className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {collab.category}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Team Size
                    </span>
                    <span className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {collab.teamSizeNeeded || 'N/A'}
                    </span>
                  </div>
                  {activeTab === 'my' && (
                    <div>
                      <span className={`block text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        Interested
                      </span>
                      <span className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} truncate block`}>
                        {collab.interestedUsers?.length || 0} user{(collab.interestedUsers?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className={`block text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Deadline
                    </span>
                    <span className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {collab.deadline ? new Date(collab.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-2">
                  {activeTab === 'all' ? (
                    // Check if user has already expressed interest
                    collab.interestedUsers?.some(user => user._id === currentUser?._id || user === currentUser?._id) ? (
                      <div className={`w-full px-3 py-2 text-center rounded-lg text-xs font-bold ${isDarkMode ? "bg-green-500/10 text-green-400 border-2 border-green-500/20" : "bg-green-50 text-green-700 border-2 border-green-200"}`}>
                        ✓ Already Interested
                      </div>
                    ) : (
                      <button
                        onClick={() => interestMutation.mutate(collab._id)}
                        disabled={interestMutation.isPending}
                        className={`w-full px-3 py-2 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white rounded-lg hover:opacity-90 transition-all text-xs font-bold shadow-lg shadow-orange-500/30 disabled:opacity-50`}
                      >
                        {interestMutation.isPending ? 'Processing...' : 'Interested'}
                      </button>
                    )
                  ) : (
                    // In My Collaborations tab, show interested users with expandable list
                    <div className="w-full">
                      {collab.interestedUsers?.length > 0 ? (
                        <>
                          {/* Clickable header with avatars preview */}
                          <button
                            onClick={() => setExpandedCollabId(expandedCollabId === collab._id ? null : collab._id)}
                            className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${isDarkMode ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-2 border-blue-500/20 hover:border-blue-500/40" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 hover:border-blue-300"}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* Stacked avatars preview */}
                                <div className="flex -space-x-2">
                                  {collab.interestedUsers.slice(0, 3).map((user, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-6 h-6 rounded-full border-2 ${isDarkMode ? "border-dark-bg-secondary" : "border-white"} bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
                                      style={{ zIndex: 3 - idx }}
                                    >
                                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                  ))}
                                  {collab.interestedUsers.length > 3 && (
                                    <div
                                      className={`w-6 h-6 rounded-full border-2 ${isDarkMode ? "border-dark-bg-secondary bg-white/10" : "border-white bg-gray-200"} flex items-center justify-center text-[9px] font-bold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                                    >
                                      +{collab.interestedUsers.length - 3}
                                    </div>
                                  )}
                                </div>
                                <span>
                                  {collab.interestedUsers.length} User{collab.interestedUsers.length !== 1 ? 's' : ''} Interested
                                </span>
                              </div>
                              {/* Expand/Collapse icon */}
                              <svg
                                className={`w-4 h-4 transition-transform duration-300 ${expandedCollabId === collab._id ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* Expanded user list */}
                          {expandedCollabId === collab._id && (
                            <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"} space-y-2 animate-fadeIn`}>
                              <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Interested Users
                              </p>
                              {collab.interestedUsers.map((user, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg ${isDarkMode ? "bg-dark-bg-secondary hover:bg-white/5" : "bg-white hover:bg-gray-50"} transition-colors group cursor-pointer`}
                                  onClick={() => navigate(`/user/${user._id}`)}
                                >
                                  {/* User avatar */}
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  {/* User info */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-gray-900"} truncate`}>
                                      {user.name || 'Anonymous User'}
                                    </p>
                                    <p className={`text-[10px] ${isDarkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                                      {user.email || 'No email'}
                                    </p>
                                  </div>
                                  {/* Message icon - clickable */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent profile navigation
                                      navigate('/messages', { state: { selectedUser: user } });
                                    }}
                                    className={`w-6 h-6 rounded-full ${isDarkMode ? "bg-white/5 group-hover:bg-orange-500/20 hover:!bg-orange-500/30" : "bg-gray-100 group-hover:bg-orange-100 hover:!bg-orange-200"} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110`}
                                    title="Send message"
                                  >
                                    <svg className={`w-3 h-3 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={`w-full px-3 py-2 text-center rounded-lg text-xs font-bold ${isDarkMode ? "bg-white/5 text-gray-500 border-2 border-white/5" : "bg-gray-100 text-gray-500 border-2 border-gray-200"}`}>
                          No interested users yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Collaboration Modal */}
      <CollabCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['collabs'] });
          setActiveTab('my');
        }}
      />
    </div>
  );
};

export default CollabBoard;
