import React from 'react';
import { useFollowRequests, useRespondToRequest } from '../hooks/useFollow';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Check, X, User } from 'lucide-react';

const FollowRequests = () => {
    const { isDarkMode } = useTheme();
    const { data: requests, isLoading } = useFollowRequests();
    const respondMutation = useRespondToRequest();

    const handleRespond = async (requestId, action) => {
        try {
            await respondMutation.mutateAsync({ requestId, action });
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading requests...</div>;
    }

    return (
        <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Follow Requests</h1>

                {requests && requests.length > 0 ? (
                    <div className={`rounded-2xl overflow-hidden shadow-sm ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        {requests.map((req) => (
                            <div key={req._id} className={`p-4 flex items-center justify-between border-b last:border-0 ${isDarkMode ? 'border-gray-800 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <Link to={`/user/${req.requester._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                        {req.requester.avatar ? (
                                            <img src={req.requester.avatar} alt={req.requester.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{req.requester.username}</h3>
                                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {req.requester.name}
                                        </p>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRespond(req._id, 'accept')}
                                        disabled={respondMutation.isLoading}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Confirm"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleRespond(req._id, 'reject')}
                                        disabled={respondMutation.isLoading}
                                        className={`p-2 rounded-lg transition-colors border ${isDarkMode ? 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                        title="Delete"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                            <User size={40} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No pending requests</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>When people ask to follow you, you'll see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowRequests;
