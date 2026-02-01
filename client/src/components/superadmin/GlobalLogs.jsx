import React, { useEffect, useState } from "react";
import { HiOutlineArrowPath, HiOutlineInformationCircle, HiOutlineExclamationTriangle, HiOutlineXCircle } from "react-icons/hi2";
import { getGlobalLogs } from "../../redux/api/adminAPI";
import CommonLoading from "../loader/CommonLoading";
import { useTheme } from "../../contexts/ThemeContext";

const GlobalLogs = () => {
    const { isDarkMode } = useTheme();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('table');

    const fetchLogs = async () => {
        setLoading(true);
        const { error, data } = await getGlobalLogs({ page, limit: 50 });
        if (data) {
            setLogs(data.logs);
            setTotalPages(data.totalPages);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const getLevelIcon = (level) => {
        switch (level) {
            case 'info': return <HiOutlineInformationCircle className="w-5 h-5 text-blue-500" />;
            case 'warn': return <HiOutlineExclamationTriangle className="w-5 h-5 text-orange-500" />;
            case 'error': return <HiOutlineXCircle className="w-5 h-5 text-red-500" />;
            default: return <HiOutlineInformationCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'info': return isDarkMode ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
            case 'warn': return isDarkMode ? 'bg-orange-600/20 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200';
            case 'error': return isDarkMode ? 'bg-red-600/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
            default: return isDarkMode ? 'bg-gray-600/20 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading && logs.length === 0) return <CommonLoading />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Logs</h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Global system activity monitoring</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                    <HiOutlineArrowPath className="w-5 h-5" />
                </button>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <table className="w-full">
                    <thead className={`${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Actor</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                        {logs.map((log) => (
                            <tr key={log._id} className={`${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                                        {getLevelIcon(log.level)}
                                        <span className="ml-1 uppercase">{log.level}</span>
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {log.message}
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {log.actor ? (
                                        <div className="flex flex-col gap-1">
                                            {/* Username */}
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    @{log.actor.username || log.actor.email?.split('@')[0]}
                                                </span>
                                            </div>

                                            {/* Name */}
                                            {log.actor.name && (
                                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {log.actor.name}
                                                </span>
                                            )}

                                            {/* Role Badge */}
                                            {log.actor.role && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit font-medium ${log.actor.role === 'superadmin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                        log.actor.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                                                    }`}>
                                                    {log.actor.role === 'superadmin' ? 'Super Admin' :
                                                        log.actor.role === 'admin' ? 'Admin' :
                                                            log.actor.role}
                                                </span>
                                            )}

                                            {/* Position/Details for Students */}
                                            {(log.actor.department || log.actor.course || log.actor.yearOfStudy) && (
                                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} flex flex-wrap gap-1`}>
                                                    {log.actor.department && (
                                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                            {log.actor.department}
                                                        </span>
                                                    )}
                                                    {log.actor.course && (
                                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                            {log.actor.course}
                                                        </span>
                                                    )}
                                                    {log.actor.yearOfStudy && (
                                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                            Year {log.actor.yearOfStudy}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                🤖 System
                                            </span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className={`px-4 py-2 text-sm rounded-lg ${isDarkMode ? 'bg-white/5 disabled:opacity-50' : 'bg-gray-100 disabled:opacity-50'}`}
                >
                    Previous
                </button>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className={`px-4 py-2 text-sm rounded-lg ${isDarkMode ? 'bg-white/5 disabled:opacity-50' : 'bg-gray-100 disabled:opacity-50'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default GlobalLogs;
