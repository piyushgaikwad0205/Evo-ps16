import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiPlus, HiTrash, HiQrCode, HiMagnifyingGlass, HiUser } from 'react-icons/hi2';
import eventService from '../../services/eventService';
import userService from '../../services/userService';
import { useSelector } from 'react-redux';

const EventRegistrationModal = ({ event, onClose, onSuccess }) => {
    const { accessToken } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teamName: '',
        transactionId: '',
        paymentProof: null,
    });
    const [members, setMembers] = useState([{ name: '', contact: '', userId: null, isManual: true }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeSearchIndex, setActiveSearchIndex] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, paymentProof: e.target.files[0] });
    };

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        // If changing name or contact manually, mark as manual entry
        if (field === 'name' || field === 'contact') {
            newMembers[index].isManual = true;
            newMembers[index].userId = null;
        }
        setMembers(newMembers);
    };

    const handleSearchUser = async (query, index) => {
        setSearchQuery(query);
        setActiveSearchIndex(index);

        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);
            const results = await userService.searchUsers(query, accessToken);
            setSearchResults(results);
        } catch (error) {
            console.error('User search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const selectUser = (index, user) => {
        const newMembers = [...members];
        newMembers[index] = {
            name: user.name,
            contact: '', // Will be filled manually
            userId: user._id,
            isManual: false,
            avatar: user.avatar
        };
        setMembers(newMembers);
        setSearchResults([]);
        setSearchQuery('');
        setActiveSearchIndex(null);
    };

    const addMember = () => {
        if (members.length < (event.maxTeamSize || 5)) {
            setMembers([...members, { name: '', contact: '', userId: null, isManual: true }]);
        } else {
            alert(`Maximum team size is ${event.maxTeamSize || 5}`);
        }
    };

    const removeMember = (index) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.paymentProof) {
            alert('Please upload payment proof');
            return;
        }

        // Validate all members have contact numbers
        const missingContacts = members.filter(m => !m.contact.trim());
        if (missingContacts.length > 0) {
            alert('Please provide contact numbers for all team members');
            return;
        }

        try {
            setLoading(true);
            const submissionData = new FormData();
            submissionData.append('teamName', formData.teamName);
            submissionData.append('teamSize', members.length);

            // Prepare members data with userId if available
            const membersData = members.map(m => ({
                name: m.name,
                contact: m.contact,
                ...(m.userId && { userId: m.userId })
            }));

            submissionData.append('members', JSON.stringify(membersData));
            submissionData.append('transactionId', formData.transactionId);
            submissionData.append('paymentProof', formData.paymentProof);

            await eventService.registerForEvent(event._id, submissionData, accessToken);
            alert('Registration submitted successfully! Waiting for admin approval.');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMessage = error.response?.data?.message || 'Registration failed';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8"
            >
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register for {event.title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <HiXMark className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-sm">
                            {event.qrCodeUrl ? (
                                <img src={event.qrCodeUrl} alt="Payment QR Code" className="w-32 h-32 object-contain" />
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                                    <HiQrCode className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Scan to Pay</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                Please scan the QR code to pay the registration fee.
                                Keep the transaction ID and a screenshot of the payment handy.
                            </p>
                            <div className="text-xs font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded inline-block border border-blue-200 dark:border-blue-800">
                                {event.helpContact ? `Help: ${event.helpContact}` : 'Contact admin for help'}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Team Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name</label>
                            <input
                                type="text"
                                name="teamName"
                                required
                                value={formData.teamName}
                                onChange={handleInputChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your team name"
                            />
                        </div>

                        {/* Members */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Team Members (Max: {event.maxTeamSize || 5})
                                </label>
                                <button
                                    type="button"
                                    onClick={addMember}
                                    disabled={members.length >= (event.maxTeamSize || 5)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiPlus className="w-4 h-4" /> Add Member
                                </button>
                            </div>
                            <div className="space-y-4">
                                {members.map((member, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Member {index + 1}
                                            </span>
                                            {members.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(index)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* User Search */}
                                        <div className="relative">
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Search User (Optional)
                                            </label>
                                            <div className="relative">
                                                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search by name or email..."
                                                    value={activeSearchIndex === index ? searchQuery : ''}
                                                    onChange={(e) => handleSearchUser(e.target.value, index)}
                                                    onFocus={() => setActiveSearchIndex(index)}
                                                    className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            {/* Search Results Dropdown */}
                                            {activeSearchIndex === index && searchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {searchResults.map((user) => (
                                                        <button
                                                            key={user._id}
                                                            type="button"
                                                            onClick={() => selectUser(index, user)}
                                                            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                        >
                                                            {user.avatar ? (
                                                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                                    <HiUser className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected User Display */}
                                        {member.userId && !member.isManual && (
                                            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                {member.avatar && <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />}
                                                <span className="text-sm text-blue-700 dark:text-blue-300">Selected: {member.name}</span>
                                            </div>
                                        )}

                                        {/* Manual Entry Fields */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    required
                                                    value={member.name}
                                                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                                    className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    required
                                                    value={member.contact}
                                                    onChange={(e) => handleMemberChange(index, 'contact', e.target.value)}
                                                    className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
                                <input
                                    type="text"
                                    name="transactionId"
                                    required
                                    value={formData.transactionId}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., UPI Ref ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Proof (Screenshot)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default EventRegistrationModal;
