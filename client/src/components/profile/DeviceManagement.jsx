import { useState, useEffect } from 'react';
import { API } from '../../redux/api/utils';
import {
    HiDesktopComputer,
    HiDeviceMobile,
    HiLocationMarker,
    HiShieldCheck,
    HiShieldExclamation,
    HiTrash,
    HiCheckCircle,
    HiXCircle
} from 'react-icons/hi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const DeviceManagement = () => {
    const [loading, setLoading] = useState(true);
    const [primaryDevices, setPrimaryDevices] = useState([]);
    const [trustedDevices, setTrustedDevices] = useState([]);
    const [blockedDevices, setBlockedDevices] = useState([]);
    const [activeTab, setActiveTab] = useState('primary');

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        setLoading(true);

        try {
            // Fetch primary device
            try {
                const primaryRes = await API.get('/auth/context-data/primary');
                // Primary endpoint returns a single object, wrap it in array
                setPrimaryDevices(primaryRes.data ? [primaryRes.data] : []);
            } catch (err) {
                console.log('Primary device not found or error:', err);
                setPrimaryDevices([]);
            }

            // Fetch trusted devices
            try {
                const trustedRes = await API.get('/auth/context-data/trusted');
                setTrustedDevices(trustedRes.data || []);
            } catch (err) {
                console.log('Trusted devices error:', err);
                setTrustedDevices([]);
            }

            // Fetch blocked devices
            try {
                const blockedRes = await API.get('/auth/context-data/blocked');
                setBlockedDevices(blockedRes.data || []);
            } catch (err) {
                console.log('Blocked devices error:', err);
                setBlockedDevices([]);
            }
        } catch (error) {
            console.error('Error in fetchDevices:', error);
        }

        setLoading(false);
    };

    const handleBlockDevice = async (contextId) => {
        if (!window.confirm('Are you sure you want to block this device?')) return;

        try {
            await API.patch(`/auth/context-data/block/${contextId}`);
            await fetchDevices();
        } catch (error) {
            console.error('Error blocking device:', error);
            alert('Failed to block device');
        }
    };

    const handleUnblockDevice = async (contextId) => {
        try {
            await API.patch(`/auth/context-data/unblock/${contextId}`);
            await fetchDevices();
        } catch (error) {
            console.error('Error unblocking device:', error);
            alert('Failed to unblock device');
        }
    };

    const handleDeleteDevice = async (contextId) => {
        if (!window.confirm('Are you sure you want to delete this device?')) return;

        try {
            await API.delete(`/auth/context-data/${contextId}`);
            await fetchDevices();
        } catch (error) {
            console.error('Error deleting device:', error);
            alert('Failed to delete device');
        }
    };

    const getDeviceIcon = (deviceType) => {
        if (deviceType?.toLowerCase().includes('mobile') || deviceType?.toLowerCase().includes('phone')) {
            return <HiDeviceMobile className="w-6 h-6" />;
        }
        return <HiDesktopComputer className="w-6 h-6" />;
    };

    const DeviceCard = ({ device, showActions = true, type = 'primary' }) => (
        <div className="border border-gray-100 dark:border-white/10 rounded-3xl p-6 bg-white/70 dark:bg-black/20 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-2xl bg-orange-50 dark:bg-white/5 text-orange-600 dark:text-orange-400">
                        {getDeviceIcon(device.device)}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                {device.device || 'Unknown Device'}
                            </h4>
                            {type === 'primary' && (
                                <span className="px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 rounded-full border border-orange-200 dark:border-orange-800">
                                    Primary
                                </span>
                            )}
                            {type === 'trusted' && (
                                <HiShieldCheck className="w-5 h-5 text-green-500" />
                            )}
                            {type === 'blocked' && (
                                <HiShieldExclamation className="w-5 h-5 text-red-500" />
                            )}
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <HiLocationMarker className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">
                                    {device.city || 'Unknown'}, {device.country || 'Unknown'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="font-medium text-xs uppercase tracking-wider text-gray-500">IP:</span> <span className="font-mono">{device.ip || 'N/A'}</span>
                                </div>
                                <div className="bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="font-medium text-xs uppercase tracking-wider text-gray-500">Browser:</span> {device.browser || 'Unknown'}
                                </div>
                                <div className="bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="font-medium text-xs uppercase tracking-wider text-gray-500">OS:</span> {device.os || 'Unknown'}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                Last active: {dayjs(device.lastLogin || device.createdAt).fromNow()}
                            </div>
                        </div>
                    </div>
                </div>

                {showActions && (
                    <div className="flex flex-col gap-2 ml-4">
                        {type !== 'blocked' && (
                            <button
                                onClick={() => handleBlockDevice(device._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                title="Block device"
                            >
                                <HiXCircle className="w-5 h-5" />
                            </button>
                        )}

                        {type === 'blocked' && (
                            <button
                                onClick={() => handleUnblockDevice(device._id)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors border border-transparent hover:border-green-100 dark:hover:border-green-900/30"
                                title="Unblock device"
                            >
                                <HiCheckCircle className="w-5 h-5" />
                            </button>
                        )}

                        <button
                            onClick={() => handleDeleteDevice(device._id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                            title="Delete device"
                        >
                            <HiTrash className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'primary', label: 'Primary Devices', count: primaryDevices.length },
        { id: 'trusted', label: 'Trusted Devices', count: trustedDevices.length },
        { id: 'blocked', label: 'Blocked Devices', count: blockedDevices.length },
    ];

    return (
        <div className="space-y-6 p-1">
            {/* Info Banner */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 border border-orange-100 dark:border-orange-900/20 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm">
                        <HiShieldCheck className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                            Context-Based Authentication Enabled
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            By enabling context-based authentication, you gain control over your devices, their locations,
                            and can manage trusted and blocked devices. This adds an extra layer of security to your account.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/30'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5'
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Device Lists */}
            <div className="space-y-4">
                {activeTab === 'primary' && (
                    <>
                        {primaryDevices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <HiDesktopComputer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No primary devices found</p>
                            </div>
                        ) : (
                            primaryDevices.map((device) => (
                                <DeviceCard key={device._id} device={device} type="primary" />
                            ))
                        )}
                    </>
                )}

                {activeTab === 'trusted' && (
                    <>
                        {trustedDevices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <HiShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No trusted devices found</p>
                                <p className="text-sm mt-2">Devices you mark as trusted will appear here</p>
                            </div>
                        ) : (
                            trustedDevices.map((device) => (
                                <DeviceCard key={device._id} device={device} type="trusted" />
                            ))
                        )}
                    </>
                )}

                {activeTab === 'blocked' && (
                    <>
                        {blockedDevices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <HiShieldExclamation className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No blocked devices</p>
                                <p className="text-sm mt-2">Devices you block will appear here</p>
                            </div>
                        ) : (
                            blockedDevices.map((device) => (
                                <DeviceCard key={device._id} device={device} type="blocked" />
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DeviceManagement;
