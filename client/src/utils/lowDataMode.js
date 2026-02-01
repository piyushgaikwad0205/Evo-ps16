// Low Data Mode Configuration
export const LOW_DATA_CONFIG = {
    // Image optimization
    imageQuality: {
        thumbnail: 30, // Very low quality for thumbnails
        preview: 50,   // Medium quality for previews
        full: 70       // Good quality for full view
    },

    // Video optimization
    videoQuality: {
        maxBitrate: '500k',  // Low bitrate for slow connections
        resolution: '480p',   // Lower resolution
        preload: 'metadata'   // Only load metadata initially
    },

    // Network settings
    timeout: 30000,        // 30 second timeout
    retryAttempts: 3,      // Retry failed requests 3 times
    retryDelay: 1000,      // 1 second between retries

    // Pagination
    postsPerPage: 5,       // Fewer posts per load
    messagesPerPage: 20,   // Fewer messages

    // Caching
    cacheExpiry: 3600000,  // 1 hour cache
    enableServiceWorker: true,

    // Features
    autoPlayVideos: false, // Disable auto-play on slow connections
    loadImagesOnDemand: true,
    compressUploads: true
};

// Detect network speed
export const getNetworkSpeed = () => {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const effectiveType = connection?.effectiveType;

        // slow-2g, 2g, 3g, 4g
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            return 'slow';
        } else if (effectiveType === '3g') {
            return 'medium';
        }
        return 'fast';
    }
    return 'unknown';
};

// Check if low data mode should be enabled
export const shouldUseLowDataMode = () => {
    const speed = getNetworkSpeed();
    const savedPreference = localStorage.getItem('lowDataMode');

    // User preference overrides auto-detection
    if (savedPreference !== null) {
        return savedPreference === 'true';
    }

    // Auto-enable for slow connections
    return speed === 'slow';
};

// Optimize image URL with compression
export const optimizeImageUrl = (url, quality = 'preview') => {
    if (!url) return url;

    const qualityValue = LOW_DATA_CONFIG.imageQuality[quality];

    // If using Cloudinary or similar CDN
    if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', `/upload/q_${qualityValue},f_auto/`);
    }

    // If using imgix
    if (url.includes('imgix.net')) {
        return `${url}?q=${qualityValue}&auto=format`;
    }

    // For other URLs, return as-is (backend should handle compression)
    return url;
};

// Compress video for upload
export const compressVideo = async (file) => {
    // This would use a library like browser-image-compression
    // For now, return the file as-is
    return file;
};

// Retry failed requests
export const retryRequest = async (requestFn, retries = LOW_DATA_CONFIG.retryAttempts) => {
    try {
        return await requestFn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, LOW_DATA_CONFIG.retryDelay));
            return retryRequest(requestFn, retries - 1);
        }
        throw error;
    }
};

export default LOW_DATA_CONFIG;
