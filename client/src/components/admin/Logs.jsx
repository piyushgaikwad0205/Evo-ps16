import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getLogsAction,
  deleteLogsAction,
} from "../../redux/actions/adminActions";
import CurrentTime from "../shared/CurrentTime";
import ButtonLoadingSpinner from "../loader/ButtonLoadingSpinner";
import CommonLoading from "../loader/CommonLoading";
import { useTheme } from "../../contexts/ThemeContext";
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlineInformationCircle, HiOutlineExclamationTriangle, HiOutlineXCircle } from "react-icons/hi2";

const Logs = () => {
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  const dispatch = useDispatch();
  const logs = useSelector((state) => state.admin?.logs);
  const { isDarkMode } = useTheme();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      await dispatch(getLogsAction());
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setClearing(true);
      await dispatch(deleteLogsAction());
    } finally {
      setClearing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchLogs();
    } catch (error) {}
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs?.length]);

  const getLevelIcon = (level) => {
    switch (level) {
      case 'info':
        return <HiOutlineInformationCircle className="w-5 h-5 text-blue-500" />;
      case 'warn':
        return <HiOutlineExclamationTriangle className="w-5 h-5 text-orange-500" />;
      case 'error':
        return <HiOutlineXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiOutlineInformationCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'info':
        return isDarkMode ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warn':
        return isDarkMode ? 'bg-orange-600/20 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200';
      case 'error':
        return isDarkMode ? 'bg-red-600/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
      default:
        return isDarkMode ? 'bg-gray-600/20 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading || !logs) {
    return (
      <div className="flex items-center justify-center p-8">
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            User Activity Logs
          </h1>
          <p className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Monitor system activity and user actions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <CurrentTime />
        </div>
      </div>

      {/* Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 rounded-lg border ${
        isDarkMode ? 'bg-dark-bg-tertiary border-dark-border' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {`${logs.length} items from the last 7 days`}
          </span>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs rounded-md transition-colors duration-200 ${
                viewMode === 'table'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs rounded-md transition-colors duration-200 ${
                viewMode === 'cards'
                  ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDarkMode 
                ? 'hover:bg-dark-bg text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Refresh logs"
          >
            <HiOutlineArrowPath className="w-5 h-5" />
          </button>
          
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              clearing || logs.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            onClick={handleCleanup}
            disabled={clearing || logs.length === 0}
          >
            <HiOutlineTrash className="w-4 h-4" />
            <span className="hidden sm:inline">
              {clearing ? (
                <ButtonLoadingSpinner loadingText="Clearing..." />
              ) : (
                "Clear Logs"
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {logs.length === 0 ? (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <HiOutlineInformationCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No logs found</p>
          <p className="text-sm mt-2">System logs will appear here as users interact with the platform</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <div className={`rounded-lg border overflow-hidden ${
              isDarkMode ? 'border-dark-border' : 'border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300 border-dark-border' : 'text-gray-500 border-gray-200'
                      } border-b`}>
                        Timestamp
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300 border-dark-border' : 'text-gray-500 border-gray-200'
                      } border-b`}>
                        Message
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300 border-dark-border' : 'text-gray-500 border-gray-200'
                      } border-b`}>
                        Email
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300 border-dark-border' : 'text-gray-500 border-gray-200'
                      } border-b`}>
                        Level
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300 border-dark-border' : 'text-gray-500 border-gray-200'
                      } border-b`}>
                        Context
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-dark-border' : 'divide-gray-200'
                  }`}>
                    {logs.map((log) => (
                      <tr key={log._id} className={`${
                        isDarkMode ? 'bg-dark-bg-secondary hover:bg-dark-bg-tertiary' : 'bg-white hover:bg-gray-50'
                      } transition-colors duration-200`}>
                        <td className={`px-4 py-3 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <div className="text-center">
                            <p className="font-mono text-xs">{log.relativeTimestamp}</p>
                            <p className="text-xs text-gray-500">{log.formattedTimestamp}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-start space-x-2">
                            {getLevelIcon(log.level)}
                            <div>
                              <span className={`capitalize font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {log.type}:
                              </span>
                              <span className={`ml-1 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {log.message}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {log.email}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getLevelColor(log.level)
                          }`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {log.contextData && Object.keys(log.contextData).length > 0 ? (
                            <div className="space-y-1">
                              {Object.entries(log.contextData).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className={`font-medium ${
                                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                  }`}>
                                    {key}:
                                  </span>
                                  <span className={`ml-1 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className={`text-xs ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              No context
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className={`p-4 rounded-lg border transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-bg-secondary border-dark-border hover:bg-dark-bg-tertiary' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getLevelIcon(log.level)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        getLevelColor(log.level)
                      }`}>
                        {log.level}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {log.relativeTimestamp}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className={`text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {log.type}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {log.message}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      User Email
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {log.email}
                    </p>
                  </div>

                  {log.contextData && Object.keys(log.contextData).length > 0 && (
                    <div>
                      <p className={`text-xs font-medium mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Context Data
                      </p>
                      <div className="space-y-1">
                        {Object.entries(log.contextData).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className={`font-medium ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}>
                              {key}:
                            </span>
                            <span className={`ml-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`mt-3 pt-3 border-t text-xs ${
                    isDarkMode ? 'border-dark-border text-gray-500' : 'border-gray-200 text-gray-400'
                  }`}>
                    {log.formattedTimestamp}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className={`mt-6 text-center text-sm italic ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Logs are automatically deleted after 7 days
          </div>
        </>
      )}
    </div>
  );
};

export default Logs;
