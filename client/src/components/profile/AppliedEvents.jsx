import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import eventService from '../../services/eventService';
import { Calendar, MapPin, Users, CreditCard, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AppliedEvents = () => {
    const { accessToken } = useSelector((state) => state.auth);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) {
            eventService.getUserRegistrations(accessToken)
                .then(data => {
                    setRegistrations(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch registrations:', err);
                    setLoading(false);
                });
        }
    }, [accessToken]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pending' },
            approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Approved' },
            rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Rejected' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border border-white/20 shadow-sm`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (registrations.length === 0) {
        return (
            <div className="text-center py-12 px-4 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No Event Registrations
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    You haven't registered for any events yet. Check out upcoming events on the home page!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Applied Events</h2>

            {registrations.map((registration, index) => (
                <motion.div
                    key={registration._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/70 dark:bg-black/20 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Event Banner */}
                        {registration.event?.bannerUrl && (
                            <div className="md:w-48 h-48 md:h-auto flex-shrink-0 relative">
                                <img
                                    src={registration.event.bannerUrl}
                                    alt={registration.event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r"></div>
                            </div>
                        )}

                        {/* Registration Details */}
                        <div className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {registration.event?.title || 'Event'}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            {new Date(registration.event?.eventDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-orange-500" />
                                            {registration.event?.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            Applied {new Date(registration.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(registration.status)}
                            </div>

                            {/* Team Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-orange-500" />
                                        Team Information
                                    </h4>
                                    <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                                        {registration.teamName}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {registration.teamSize} {registration.teamSize === 1 ? 'member' : 'members'}
                                    </p>
                                </div>

                                <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-orange-500" />
                                        Payment Details
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Transaction ID
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-black/30 px-2 py-1 rounded-lg inline-block">
                                        {registration.transactionId}
                                    </p>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="border-t border-gray-100 dark:border-white/10 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Team Members
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {registration.members?.map((member, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 text-sm bg-white/50 dark:bg-white/5 rounded-xl p-2 border border-gray-50 dark:border-white/5"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 dark:text-white font-medium truncate">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {member.contact}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Proof Link */}
                            {registration.paymentProofUrl && (
                                <div className="mt-4">
                                    <a
                                        href={registration.paymentProofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium flex items-center gap-1"
                                    >
                                        View Payment Proof →
                                    </a>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {registration.status === 'rejected' && registration.rejectionReason && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        <strong>Rejection Reason:</strong> {registration.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default AppliedEvents;
