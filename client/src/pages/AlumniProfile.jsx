import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { API } from '../redux/api/utils';
import { sendConnectionRequest, removeConnection } from '../redux/api/connectionAPI';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiUserAdd,
    HiCheckCircle
} from 'react-icons/hi';
import { Linkedin, Github } from 'lucide-react';

const AlumniProfile = () => {
    const { id } = useParams();

    const { isDarkMode } = useTheme();
    const { userData: currentUser } = useSelector((state) => state.auth);

    const [alumni, setAlumni] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [connectionId, setConnectionId] = useState(null);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [activeTab, setActiveTab] = useState('academic');

    const [removingConnection, setRemovingConnection] = useState(false);

    useEffect(() => {
        fetchAlumniProfile();
        checkConnectionStatus();
    }, [id]);

    const fetchAlumniProfile = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/alumni/profile/${id}`);
            setAlumni(response.data);
        } catch (err) {
            console.error('Error fetching alumni profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const checkConnectionStatus = async () => {
        try {
            const response = await API.get(`/connections/status/${id}`);
            setConnectionStatus(response.data.status);
            setConnectionId(response.data.connectionId);
        } catch (err) {
            console.error('Error checking connection status:', err);
        }
    };

    const handleSendConnectionRequest = async () => {
        if (!currentUser) {
            alert('Please sign in to connect.');
            return;
        }

        setSendingRequest(true);
        try {
            const { error, data } = await sendConnectionRequest({ recipientId: id });
            if (!error && data) {
                setConnectionStatus(data.connection.status);
                if (data.connection.status === 'accepted') {
                    alert('Connection established successfully!');
                } else {
                    alert('Connection request sent successfully!');
                }
            } else {
                alert('Failed to send connection request');
            }
        } catch (err) {
            console.error('Error sending connection request:', err);
            alert('Failed to send connection request');
        } finally {
            setSendingRequest(false);
        }
    };

    const handleRemoveConnection = async () => {
        if (!currentUser || !connectionId) return;

        setRemovingConnection(true);
        try {
            const { error } = await removeConnection(connectionId);
            if (!error) {
                setConnectionStatus(null);
                setConnectionId(null);
                alert('Connection removed successfully!');
            } else {
                alert('Failed to remove connection');
            }
        } catch (err) {
            console.error('Error removing connection:', err);
            alert('Failed to remove connection');
        } finally {
            setRemovingConnection(false);
        }
    };



    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !alumni) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Profile Not Found
                    </h2>
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {error || 'The alumni profile you are looking for does not exist.'}
                    </p>
                    <Link
                        to="/alumni-hub"
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-block"
                    >
                        Back to Alumni Hub
                    </Link>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?._id === alumni._id;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Profile Header */}
                <div className={`${isDarkMode ? 'bg-dark-bg-secondary border-b border-white/10' : 'bg-white border-b border-gray-100'}`}>
                    <div className="px-4 sm:px-6 pt-6 pb-4">
                        {/* Profile Info */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
                            {/* Avatar with gradient border */}
                            <div className="relative mx-auto sm:mx-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-3xl blur-sm"></div>
                                <img
                                    src={alumni.avatar || `https://ui-avatars.com/api/?name=${alumni.name}&size=200&background=random`}
                                    alt={alumni.name}
                                    className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-3xl object-cover ring-4 ring-white dark:ring-dark-bg-secondary"
                                />
                            </div>

                            {/* Name and Actions */}
                            <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {alumni.name}
                                        </h1>
                                        {alumni.position && (
                                            <p className={`text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {alumni.position}
                                                {alumni.currentEmployer && ` at ${alumni.currentEmployer}`}
                                            </p>
                                        )}

                                        {/* Social Icons */}
                                        {(alumni.linkedinUrl || alumni.githubUrl) && (
                                            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                                                {alumni.linkedinUrl && (
                                                    <a
                                                        href={alumni.linkedinUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
                                                        title="LinkedIn Profile"
                                                    >
                                                        <Linkedin className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {alumni.githubUrl && (
                                                    <a
                                                        href={alumni.githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                        title="GitHub Profile"
                                                    >
                                                        <Github className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 sm:gap-6 mb-4 justify-center sm:justify-start flex-wrap">
                                    <div>
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>0</span>
                                        <span className={`ml-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>posts</span>
                                    </div>
                                    <div>
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>0</span>
                                        <span className={`ml-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>followers</span>
                                    </div>
                                    <div>
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>0</span>
                                        <span className={`ml-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>following</span>
                                    </div>
                                    <div>
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1</span>
                                        <span className={`ml-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>connections</span>
                                    </div>
                                </div>

                                {/* Username/Email with Social Icons */}
                                <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start flex-wrap">
                                    {alumni.email && (
                                        <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                            @{alumni.email.split('@')[0]}
                                        </p>
                                    )}

                                    {/* Social Icons */}
                                    {(alumni.linkedinUrl || alumni.githubUrl) && (
                                        <div className="flex items-center gap-2">
                                            {alumni.linkedinUrl && (
                                                <a
                                                    href={alumni.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
                                                    title="LinkedIn Profile"
                                                >
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                            {alumni.githubUrl && (
                                                <a
                                                    href={alumni.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                    title="GitHub Profile"
                                                >
                                                    <Github className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 justify-center sm:justify-start">
                                    {!isOwnProfile && (
                                        <>
                                            {connectionStatus === 'connected' || connectionStatus === 'accepted' ? (
                                                <button
                                                    onClick={handleRemoveConnection}
                                                    disabled={removingConnection}
                                                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm ${isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {removingConnection ? (
                                                        <>
                                                            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                                            Disconnecting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiCheckCircle className="w-4 h-4 text-green-500" />
                                                            Connected
                                                        </>
                                                    )}
                                                </button>
                                            ) : connectionStatus === 'pending' ? (
                                                <button disabled className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm ${isDarkMode ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-gray-50 text-gray-500 border border-gray-200'} shadow-sm`}>
                                                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                                    Pending
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleSendConnectionRequest}
                                                    disabled={sendingRequest}
                                                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {sendingRequest ? (
                                                        <>
                                                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                                            Connecting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiUserAdd className="w-4 h-4" />
                                                            Connect
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {isOwnProfile && (
                                        <button className={`px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm ${isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'}`}>
                                            Edit profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-4 sm:gap-8 border-t border-gray-200 dark:border-white/10 px-4 sm:px-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'academic'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <HiOutlineAcademicCap size={20} />
                            <span className="font-semibold text-xs sm:text-sm">Academic Details</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('professional')}
                            className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'professional'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <HiOutlineBriefcase size={20} />
                            <span className="font-semibold text-xs sm:text-sm">Professional Info</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    <div className="max-w-3xl mx-auto">


                        {/* Academic Details Tab */}
                        {activeTab === 'academic' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Education Card */}
                                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-dark-bg-secondary border border-white/10' : 'bg-white border border-gray-200'}`}>
                                    <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Education</h3>

                                    {/* College Info */}
                                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                                        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                                            <HiOutlineAcademicCap className="w-6 h-6 text-purple-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-semibold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {alumni.collegeId?.name || "Campus Connect"}
                                            </h4>
                                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {alumni.department || "Department not specified"}
                                            </p>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Graduated {alumni.graduationYear || "Year unknown"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Academic Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>College</p>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {alumni.collegeId?.name || "Not specified"}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Graduation Year</p>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {alumni.graduationYear || "Not specified"}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Department</p>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {alumni.department || "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Interests */}
                                {alumni.interests && (
                                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-dark-bg-secondary border border-white/10' : 'bg-white border border-gray-200'}`}>
                                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Interests</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {alumni.interests.split(',').map(s => s.trim()).filter(Boolean).map((interest, index) => (
                                                <span key={index} className={`px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bio */}
                                {alumni.bio && (
                                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-dark-bg-secondary border border-white/10' : 'bg-white border border-gray-200'}`}>
                                        <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bio</h3>
                                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed whitespace-pre-wrap`}>
                                            {alumni.bio}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Professional Info Tab */}
                        {activeTab === 'professional' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Professional Details Card */}
                                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-dark-bg-secondary border border-white/10' : 'bg-white border border-gray-200'}`}>
                                    <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Professional Information</h3>

                                    {/* Current Position */}
                                    {(alumni.currentEmployer || alumni.position) && (
                                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                                            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                                <HiOutlineBriefcase className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-semibold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {alumni.position || "Position not specified"}
                                                </h4>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {alumni.currentEmployer || "Company not specified"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Current Employer</p>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {alumni.currentEmployer || "Not specified"}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Position</p>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {alumni.position || "Not specified"}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Industry</p>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {alumni.industry || "Not specified"}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Years of Experience</p>
                                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {Array.isArray(alumni.experience) ? `${alumni.experience.length} Roles` : alumni.experience ? `${alumni.experience} Years` : "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills */}
                                {alumni.skills && alumni.skills.length > 0 && (
                                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-dark-bg-secondary border border-white/10' : 'bg-white border border-gray-200'}`}>
                                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skills & Expertise</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(alumni.skills) ? alumni.skills : alumni.skills.split(',').map(s => s.trim())).filter(Boolean).map((skill, index) => (
                                                <span key={index} className={`px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Professional Links */}
                                {(alumni.linkedinUrl || alumni.githubUrl) && (
                                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-dark-bg-secondary border border-white/10' : 'bg-white border border-gray-200'}`}>
                                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Professional Links</h3>
                                        <div className="space-y-3">
                                            {alumni.linkedinUrl && (
                                                <a href={alumni.linkedinUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/50 hover:bg-white/80'}`}>
                                                    <div className="p-2 rounded-lg bg-blue-600">
                                                        <Linkedin className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LinkedIn</p>
                                                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{alumni.linkedinUrl}</p>
                                                    </div>
                                                </a>
                                            )}
                                            {alumni.githubUrl && (
                                                <a href={alumni.githubUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/50 hover:bg-white/80'}`}>
                                                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-800'}`}>
                                                        <Github className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>GitHub</p>
                                                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{alumni.githubUrl}</p>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniProfile;
