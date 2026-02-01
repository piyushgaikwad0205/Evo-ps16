import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSurveys } from '../hooks/useApi';
import { useTheme } from '../contexts/ThemeContext';
import { FileText, Plus } from 'lucide-react';
import AppLoader from '../components/loader/AppLoader';

const Surveys = () => {
  const { isDarkMode } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryParams = {
    page: currentPage,
    limit: 12,
    category: filters.category,
    status: filters.status,
    search: debouncedSearch
  };

  // Prevent fetching with empty search if raw search is not empty but debounce hasn't fired?
  // No, actually we want to show results.

  const { data, isLoading } = useSurveys(queryParams);
  const surveys = data?.surveys || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const { userData: user } = useSelector((state) => state.auth);

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'campus-life', label: 'Campus Life' },
    { value: 'career', label: 'Career' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'general', label: 'General' },
    { value: 'research', label: 'Research' },
    { value: 'social', label: 'Social' },
    { value: 'technical', label: 'Technical' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: ''
    });
    setCurrentPage(1);
  };

  const filteredSurveys = surveys; // API handles filtering

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-green-100 text-green-700 border-green-300';
      case 'draft': return isDarkMode ? 'bg-gray-500/20 text-gray-400 border-gray-500/40' : 'bg-gray-100 text-gray-700 border-gray-300';
      case 'paused': return isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'closed': return isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-red-100 text-red-700 border-red-300';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400 border-gray-500/40' : 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 border border-orange-500/30" : "bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300"}`}>
              <FileText className={`w-6 h-6 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Surveys
              </h1>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {filteredSurveys.length} {filteredSurveys.length === 1 ? 'survey' : 'surveys'} available
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm md:max-w-md`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`px-4 py-2.5 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer`}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`px-4 py-2.5 border ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer`}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>

              {(filters.search || filters.category || filters.status) && (
                <button
                  onClick={clearFilters}
                  className={`px-4 py-2.5 text-sm font-medium ${isDarkMode ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl transition-colors whitespace-nowrap`}
                >
                  Clear
                </button>
              )}

              {user && user.role === 'alumni' && (
                <Link
                  to="/surveys/create"
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${isDarkMode
                    ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                    }`}
                >
                  <Plus className="w-4 h-4" />
                  Create Survey
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Showing {filteredSurveys.length} survey{filteredSurveys.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Surveys Grid */}
        {isLoading && filteredSurveys.length === 0 ? (
          <AppLoader />
        ) : filteredSurveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`p-4 rounded-full mb-4 ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`}>
              <svg className={`w-8 h-8 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>No surveys found</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {filteredSurveys.map((survey) => (
              <div key={survey._id} className={`group flex flex-col ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} rounded-2xl border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                {/* Survey Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors`}>
                      {survey.title}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
                      {survey.description}
                    </p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(survey.status)}`}>
                    {survey.status}
                  </span>
                </div>

                {/* Survey Meta */}
                <div className={`mt-auto space-y-3`}>
                  <div className="flex flex-wrap gap-2">
                    {survey.tags && survey.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 ${isDarkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-700"} rounded-md text-xs font-medium`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className={`pt-4 border-t ${isDarkMode ? "border-white/5" : "border-gray-100"} grid grid-cols-2 gap-4 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Category</span>
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{survey.category || 'General'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Questions</span>
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{survey.questions?.length || 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Responses</span>
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{survey.responseCount || 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Deadline</span>
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                        {survey.endDate ? new Date(survey.endDate).toLocaleDateString() : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Link
                      to={`/surveys/${survey._id}`}
                      className={`flex-1 px-4 py-2.5 text-center rounded-xl text-sm font-medium transition-all ${isDarkMode
                        ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                        : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                        }`}
                    >
                      View Survey
                    </Link>

                    {survey.status === 'active' && survey.responseCount > 0 && (
                      <Link
                        to={`/surveys/${survey._id}/analytics`}
                        className={`px-4 py-2.5 border ${isDarkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"} rounded-xl transition-colors text-sm font-medium`}
                      >
                        Analytics
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center pb-10">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-gray-400 hover:bg-white/5" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"} border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                Previous
              </button>

              <span className={`px-4 py-2 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium ${isDarkMode ? "bg-dark-bg-secondary border-white/10 text-gray-400 hover:bg-white/5" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"} border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Surveys;