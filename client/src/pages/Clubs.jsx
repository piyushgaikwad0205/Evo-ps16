import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getBannerUrl, handleImageError } from "../utils/imageUtils";
import { useTheme } from "../contexts/ThemeContext";
import useAppStore from "../store/useAppStore";
import { useClubs } from "../hooks/useApi";
import AppLoader from "../components/loader/AppLoader";

const Clubs = () => {
  const { isDarkMode } = useTheme();
  // Bypass store state if onSuccess is unreliable in v5
  // const { clubs } = useAppStore(); 
  const { data: responseData, isLoading: queryLoading } = useClubs();
  const clubs = responseData?.clubs || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loading = clubs.length === 0 && queryLoading;

  const categories = [
    'Academic',
    'Cultural',
    'Sports',
    'Technology',
    'Business',
    'Arts',
    'Social',
    'Professional',
    'Other'
  ];

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2.5 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`flex-1 md:w-48 px-4 py-2.5 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer`}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className={`px-4 py-2.5 text-sm font-medium ${isDarkMode ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl transition-colors whitespace-nowrap`}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Showing {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`p-4 rounded-full mb-4 ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`}>
              <svg className={`w-8 h-8 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>No clubs found</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {filteredClubs.map((club) => (
              <Link
                to={`/clubs/${club._id}`}
                key={club._id}
                className={`group relative flex flex-col ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Club Banner */}
                <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10">
                  {club.banner ? (
                    <img
                      src={getBannerUrl(club.banner)}
                      alt={club.name}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, 'banner')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`text-4xl font-bold ${isDarkMode ? "text-white/20" : "text-gray-300"}`}>{club.name.charAt(0)}</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/10">
                      {club.category || 'General'}
                    </span>
                  </div>
                </div>

                {/* Club Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-auto">
                    <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors`}>
                      {club.name}
                    </h3>

                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} line-clamp-2 mb-4 h-10`}>
                      {club.description || 'No description available.'}
                    </p>
                  </div>

                  {/* Footer Info */}
                  <div className={`pt-4 border-t ${isDarkMode ? "border-white/5" : "border-gray-100"} flex items-center justify-between text-xs`}>
                    <div className={`flex items-center gap-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {club.members?.length || 0} members
                    </div>

                    {club.foundedYear && (
                      <div className={isDarkMode ? "text-gray-500" : "text-gray-400"}>
                        Est. {club.foundedYear}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clubs;
