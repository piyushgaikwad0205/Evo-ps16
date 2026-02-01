import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { API } from '../redux/api/utils';
import { sendConnectionRequest } from '../redux/api/connectionAPI';
import { HiSearch, HiFilter, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineLocationMarker } from 'react-icons/hi';
import { useTheme } from '../contexts/ThemeContext';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    graduationYear: '',
    department: '',
    industry: '',
    location: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAlumni: 0
  });
  const [connectionLoading, setConnectionLoading] = useState({});
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  const { userData: user } = useSelector((state) => state.auth);
  const { isDarkMode } = useTheme();

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Business Administration',
    'Management Studies',
    'Commerce',
    'Arts',
    'Science',
    'Other'
  ];

  const industries = [
    'Technology/Software',
    'Finance/Banking',
    'Healthcare/Medical',
    'Education/Academia',
    'Manufacturing',
    'Consulting',
    'Government/Public Sector',
    'Non-profit/NGO',
    'Retail/E-commerce',
    'Media/Entertainment',
    'Real Estate',
    'Transportation/Logistics',
    'Energy/Utilities',
    'Telecommunications',
    'Other'
  ];

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.currentPage);
      params.append('limit', 12);

      const response = await API.get(`/alumni/directory?${params}`);
      // Filter out current user from the list
      const filteredAlumni = response.data.alumni.filter(a => a._id !== user?._id);
      setAlumni(filteredAlumni);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    }
    setLoading(false);
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      graduationYear: '',
      department: '',
      industry: '',
      location: '',
      search: ''
    });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleConnect = (alumni) => {
    if (!user) {
      alert('Please sign in to connect.');
      return;
    }
    setSelectedAlumni(alumni);
    setShowConnectionModal(true);
  };

  const handleSendConnectionRequest = async () => {
    if (!selectedAlumni) return;

    setConnectionLoading(prev => ({ ...prev, [selectedAlumni._id]: true }));

    try {
      const { error, data } = await sendConnectionRequest({
        recipientId: selectedAlumni._id,
        message: connectionMessage
      });
      if (error) {
        console.error('Error sending connection request:', error);
        alert(error || 'Failed to send connection request');
      } else {
        // Update the alumni list to reflect the new connection status
        setAlumni(prev => prev.map(a =>
          a._id === selectedAlumni._id
            ? { ...a, connectionStatus: { status: data?.connection?.status || 'accepted', isRequester: true } }
            : a
        ));

        setShowConnectionModal(false);
        setSelectedAlumni(null);
        setConnectionMessage('');
        alert('Connection established successfully!');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    } finally {
      setConnectionLoading(prev => ({ ...prev, [selectedAlumni._id]: false }));
    }
  };

  const getConnectionButton = (alumni) => {
    if (!user) return null;

    const { connectionStatus } = alumni;

    if (!connectionStatus || connectionStatus.status === 'none') {
      return (
        <button
          onClick={() => handleConnect(alumni)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          Connect
        </button>
      );
    }

    if (connectionStatus.status === 'pending') {
      if (connectionStatus.isRequester) {
        return (
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-lg text-sm font-medium border border-yellow-200 dark:border-yellow-800">
            Request Sent
          </span>
        );
      } else {
        return (
          <span className="px-4 py-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg text-sm font-medium border border-orange-200 dark:border-orange-800">
            Respond
          </span>
        );
      }
    }

    if (connectionStatus.status === 'accepted') {
      return (
        <span className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
          Connected
        </span>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} font-outfit`}>
            Alumni Directory
          </h1>
          <p className={`mt-2 text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect with <span className="font-semibold text-blue-600 dark:text-blue-400">{pagination.totalAlumni}</span> verified alumni from our community
          </p>
        </div>

        {/* Filters */}
        <div className={`rounded-2xl shadow-sm border p-6 mb-8 transition-all ${isDarkMode ? 'bg-dark-bg-secondary border-white/5' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <HiFilter className="w-4 h-4" /> Filters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alumni..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode
                    ? 'bg-dark-bg border-white/10 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                />
              </div>
            </div>

            {/* Graduation Year */}
            <div>
              <select
                value={filters.graduationYear}
                onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${isDarkMode
                  ? 'bg-dark-bg border-white/10 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
              >
                <option value="">All Years</option>
                {graduationYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${isDarkMode
                  ? 'bg-dark-bg border-white/10 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${isDarkMode
                  ? 'bg-dark-bg border-white/10 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <input
                type="text"
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDarkMode
                  ? 'bg-dark-bg border-white/10 text-white placeholder-gray-500'
                  : 'bg-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Alumni Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`rounded-2xl p-6 animate-pulse ${isDarkMode ? 'bg-dark-bg-secondary' : 'bg-white'}`}>
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                <div className={`h-4 rounded w-3/4 mx-auto mb-3 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                <div className={`h-3 rounded w-1/2 mx-auto mb-4 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                <div className="flex justify-center gap-2">
                  <div className={`h-8 w-24 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                  <div className={`h-8 w-24 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {alumni.map((person) => (
              <div
                key={person._id}
                className={`group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${isDarkMode
                  ? 'bg-dark-bg-secondary hover:bg-dark-bg-tertiary border border-white/5 hover:border-white/10 shadow-lg shadow-black/20'
                  : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10'
                  }`}
              >
                <div className="text-center relative z-10">
                  <div className="relative inline-block mb-4">
                    <img
                      src={person.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                      alt={person.name}
                      className={`w-24 h-24 rounded-full object-cover border-4 transition-colors ${isDarkMode ? 'border-dark-bg group-hover:border-blue-500/30' : 'border-white group-hover:border-blue-100'
                        } shadow-md`}
                    />
                    {person.linkedinUrl && (
                      <a
                        href={person.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-0 right-0 p-1.5 bg-[#0077b5] text-white rounded-full shadow-sm hover:scale-110 transition-transform"
                        title="LinkedIn Profile"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                      </a>
                    )}
                  </div>

                  <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {person.name}
                  </h3>

                  {person.position && person.currentEmployer && (
                    <div className="flex items-center justify-center gap-1.5 text-sm mb-3 text-blue-600 dark:text-blue-400 font-medium">
                      <HiOutlineBriefcase className="flex-shrink-0" />
                      <p className="truncate max-w-[200px]">
                        {person.position} @ {person.currentEmployer}
                      </p>
                    </div>
                  )}

                  <div className={`space-y-1.5 text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {person.graduationYear && (
                      <div className="flex items-center justify-center gap-1.5">
                        <HiOutlineAcademicCap />
                        <p>Class of {person.graduationYear}</p>
                      </div>
                    )}
                    {person.location && (
                      <div className="flex items-center justify-center gap-1.5">
                        <HiOutlineLocationMarker />
                        <p className="truncate max-w-[180px]">{person.location}</p>
                      </div>
                    )}
                  </div>

                  {person.skills && person.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mb-6 h-14 overflow-hidden">
                      {person.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode
                            ? 'bg-blue-900/20 text-blue-300 border border-blue-900/30'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}
                        >
                          {skill}
                        </span>
                      ))}
                      {person.skills.length > 3 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                          +{person.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/alumni/profile/${person._id}`}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      View Profile
                    </Link>
                    {getConnectionButton(person)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className={`inline-flex rounded-xl shadow-sm ${isDarkMode ? 'bg-dark-bg-secondary' : 'bg-white'} p-1`}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
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
                      onClick={() => handlePageChange(page)}
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
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
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
      </div>

      {/* Connection Modal */}
      {showConnectionModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all ${isDarkMode ? 'bg-dark-bg-secondary border border-white/10' : 'bg-white'
            }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Connect with {selectedAlumni.name}
            </h3>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Message (optional)
              </label>
              <textarea
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Hi, I'd like to connect with you..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${isDarkMode
                  ? 'bg-dark-bg border-white/10 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConnectionModal(false);
                  setSelectedAlumni(null);
                  setConnectionMessage('');
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDarkMode
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnectionRequest}
                disabled={connectionLoading[selectedAlumni._id]}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/25 transition-all"
              >
                {connectionLoading[selectedAlumni._id] ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;