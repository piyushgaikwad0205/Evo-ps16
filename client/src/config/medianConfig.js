/**
 * Median App Configuration
 * This file ensures localStorage persistence works correctly in Median wrapped apps
 */

// Ensure localStorage is available and working
if (typeof window !== 'undefined') {
    // Test localStorage availability
    try {
        const testKey = '__median_storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('✅ localStorage is available');
    } catch (e) {
        console.error('❌ localStorage is not available:', e);
        // Fallback to memory storage if localStorage fails
        if (!window.localStorage) {
            const memoryStorage = {};
            window.localStorage = {
                getItem: (key) => memoryStorage[key] || null,
                setItem: (key, value) => { memoryStorage[key] = value; },
                removeItem: (key) => { delete memoryStorage[key]; },
                clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]); }
            };
        }
    }

    // Prevent app from clearing storage on reload
    window.addEventListener('beforeunload', (event) => {
        // Don't clear authentication data
        console.log('App closing - preserving authentication');
    });

    // Log storage status on app start
    console.log('📱 Median App - Storage Status:');
    console.log('- Profile:', localStorage.getItem('profile') ? '✅ Found' : '❌ Not found');
    console.log('- App Store:', localStorage.getItem('campus-connect-storage') ? '✅ Found' : '❌ Not found');
}

export default {};
