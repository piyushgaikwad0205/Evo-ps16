import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getMyConnections, getPendingRequests, respondToConnectionRequest, removeConnection } from '../redux/api/connectionAPI';

const Connections = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState({});

  const { userData: user } = useSelector((state) => state.auth);

  /* Removed accessDenied check as all users can now connect */

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'connections') {
        const { error, data } = await getMyConnections();
        if (error) {
          console.error('Error fetching connections:', error);
        } else {
          setConnections(data.connections);
        }
      } else {
        const { error, data } = await getPendingRequests();
        if (error) {
          console.error('Error fetching pending requests:', error);
        } else {
          setPendingRequests(data.pendingRequests);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleRespondToRequest = async (connectionId, status) => {
    setRequestLoading(prev => ({ ...prev, [connectionId]: true }));

    try {
      const { error } = await respondToConnectionRequest(connectionId, status);

      if (error) {
        console.error('Error responding to request:', error);
        alert('Failed to respond to request');
      } else {
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(req => req._id !== connectionId));

        // If accepted, add to connections
        if (status === 'accepted') {
          // Fetch the updated connection
          const { error, data } = await getMyConnections();
          if (!error) {
            setConnections(data.connections);
          }
        }

        alert(`Connection request ${status}!`);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to request');
    } finally {
      setRequestLoading(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;

    try {
      const { error } = await removeConnection(connectionId);

      if (error) {
        console.error('Error removing connection:', error);
        alert('Failed to remove connection');
      } else {
        setConnections(prev => prev.filter(conn => conn._id !== connectionId));
        alert('Connection removed successfully');
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
          <p className="mt-2 text-gray-600">
            Manage your connections and pending requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                My Connections ({connections.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Pending Requests ({pendingRequests.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'connections' ? (
              <div>
                {connections.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start connecting with fellow students and alumni to build your network!
                    </p>
                    <Link
                      to="/users/discover"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Discover People
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <div key={connection._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={connection.otherUser.avatar}
                            alt={connection.otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {connection.otherUser.name}
                            </h3>
                            <div className="text-sm text-gray-600">
                              {connection.otherUser.position && connection.otherUser.currentEmployer && (
                                <p>{connection.otherUser.position} at {connection.otherUser.currentEmployer}</p>
                              )}
                              {connection.otherUser.graduationYear && (
                                <p>Class of {connection.otherUser.graduationYear} • {connection.otherUser.department}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Connected since {formatDate(connection.acceptedAt || connection.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/user/${connection.otherUser._id}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => handleRemoveConnection(connection._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📨</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-600">
                      You're all caught up! No pending connection requests.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={request.requester.avatar}
                            alt={request.requester.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.requester.name}
                            </h3>
                            <div className="text-sm text-gray-600">
                              {request.requester.position && request.requester.currentEmployer && (
                                <p>{request.requester.position} at {request.requester.currentEmployer}</p>
                              )}
                              {request.requester.graduationYear && (
                                <p>Class of {request.requester.graduationYear} • {request.requester.department}</p>
                              )}
                            </div>
                            {request.message && (
                              <p className="text-sm text-gray-700 mt-2 italic">
                                "{request.message}"
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Requested {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/user/${request.requester._id}`}
                            className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => handleRespondToRequest(request._id, 'accepted')}
                            disabled={requestLoading[request._id]}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {requestLoading[request._id] ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleRespondToRequest(request._id, 'rejected')}
                            disabled={requestLoading[request._id]}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {requestLoading[request._id] ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections; 