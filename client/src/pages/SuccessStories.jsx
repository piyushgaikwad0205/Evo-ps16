import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { API } from '../redux/api/utils';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Star, ThumbsUp, MessageCircle, BookOpen, Plus } from 'lucide-react';

const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    featured: false,
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStories: 0
  });

  const { userData: user } = useSelector((state) => state.auth);
  const { isDarkMode } = useTheme();

  const isAlumni = user && user.role === 'alumni';

  const accessDenied = (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <div className={`text-center p-8 rounded-2xl ${isDarkMode ? 'bg-dark-bg-secondary' : 'bg-white'} shadow-xl max-w-md`}>
        <div className="text-6xl mb-4">🚫</div>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Access Denied</h2>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Success Stories are available to users. Alumni can upload from Home.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          Go Home
        </Link>
      </div>
    </div>
  );

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'career_achievement', label: 'Career Achievement' },
    { value: 'entrepreneurship', label: 'Entrepreneurship' },
    { value: 'social_impact', label: 'Social Impact' },
    { value: 'academic_excellence', label: 'Academic Excellence' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (isAlumni) return;
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage, isAlumni]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.currentPage);
      params.append('limit', 10);

      const response = await API.get(`/success-stories?${params}`);
      setStories(response.data.stories);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching success stories:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (isAlumni) return accessDenied;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} size={32} />
              <h1 className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Success Stories
              </h1>
            </div>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Inspiring achievements from our alumni community
            </p>
          </div>
          {user && user.role === 'alumni' && (
            <Link
              to="/success-stories/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
            >
              <Plus size={20} />
              Share Your Story
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className={`rounded-2xl shadow-sm border p-6 mb-8 ${isDarkMode ? 'bg-dark-bg-secondary border-white/5' : 'bg-white border-gray-200'
          }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode
                      ? 'bg-dark-bg border-white/10 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${isDarkMode
                    ? 'bg-dark-bg border-white/10 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Featured */}
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Featured stories only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Stories */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`rounded-2xl shadow-sm border p-6 animate-pulse ${isDarkMode ? 'bg-dark-bg-secondary border-white/5' : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className={`h-4 rounded mb-2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <div className={`h-3 rounded mb-4 w-1/2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <div className="space-y-2">
                      <div className={`h-3 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                      <div className={`h-3 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                      <div className={`h-3 rounded w-3/4 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div key={story._id} className={`rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border p-6 group ${isDarkMode
                  ? 'bg-dark-bg-secondary border-white/5 hover:border-white/10'
                  : 'bg-white border-gray-200 hover:border-blue-200'
                }`}>
                <div className="flex items-start space-x-4">
                  <img
                    src={story.author?.avatar || "https://via.placeholder.com/48x48"}
                    alt={story.author?.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-500/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div>
                        <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {story.author?.name}
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatDate(story.createdAt)}
                        </p>
                      </div>
                      {story.featured && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-medium shadow-sm">
                          <Star size={12} fill="currentColor" />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isDarkMode
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                        {categories.find(cat => cat.value === story.category)?.label || story.category}
                      </span>
                    </div>

                    <h4 className={`text-lg font-bold mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {story.title}
                    </h4>

                    <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {truncateText(story.content)}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <span className="flex items-center gap-1.5">
                          <ThumbsUp size={16} />
                          {story.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle size={16} />
                          {story.comments?.length || 0}
                        </span>
                      </div>

                      <Link
                        to={`/success-stories/${story._id}`}
                        className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${isDarkMode
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className={`inline-flex rounded-xl shadow-sm p-1 ${isDarkMode ? 'bg-dark-bg-secondary' : 'bg-white'}`}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrev}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode
                    ? 'text-gray-400 hover:text-white disabled:opacity-30'
                    : 'text-gray-500 hover:text-gray-900 disabled:opacity-30'
                  }`}
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page =>
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.currentPage) <= 1
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className={`px-2 py-2 text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
                    )}
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === pagination.currentPage
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : (isDarkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50')
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNext}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode
                    ? 'text-gray-400 hover:text-white disabled:opacity-30'
                    : 'text-gray-500 hover:text-gray-900 disabled:opacity-30'
                  }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {!loading && stories.length === 0 && (
          <div className={`text-center py-16 rounded-2xl border border-dashed ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
            <div className="text-6xl mb-4">📖</div>
            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No success stories found
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filters.search || filters.category !== 'all' || filters.featured
                ? 'Try adjusting your filters to see more stories.'
                : 'Be the first to share your success story with the community!'}
            </p>
            {user && user.role === 'alumni' && (
              <Link
                to="/success-stories/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Plus size={20} />
                Share Your Story
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessStories;