/**
 * Persistent Storage Manager for Median Apps
 * Uses multiple storage strategies to ensure data persistence
 */

class PersistentStorage {
    constructor() {
        this.storageKey = 'campus_connects_auth';
        this.init();
    }

    init() {
        // Try to restore from any available storage
        this.restoreAuth();

        // Prevent storage from being cleared
        this.preventClear();

        // Save auth data periodically
        this.startAutoSave();
    }

    // Save authentication data to multiple locations
    saveAuth(authData) {
        try {
            const dataString = JSON.stringify(authData);

            // 1. localStorage
            localStorage.setItem('profile', dataString);
            localStorage.setItem(this.storageKey, dataString);

            // 2. sessionStorage as backup
            sessionStorage.setItem('profile', dataString);
            sessionStorage.setItem(this.storageKey, dataString);

            // 3. IndexedDB for more persistent storage
            this.saveToIndexedDB(authData);

            // 4. Cookie as last resort
            this.saveToCookie(dataString);

            console.log('✅ Auth data saved to all storage locations');
            return true;
        } catch (error) {
            console.error('❌ Error saving auth:', error);
            return false;
        }
    }

    // Restore authentication from any available source
    restoreAuth() {
        try {
            // Try localStorage first
            let authData = localStorage.getItem('profile') || localStorage.getItem(this.storageKey);

            // Try sessionStorage
            if (!authData) {
                authData = sessionStorage.getItem('profile') || sessionStorage.getItem(this.storageKey);
            }

            // Try cookie
            if (!authData) {
                authData = this.getFromCookie();
            }

            // Try IndexedDB (async, will restore later)
            if (!authData) {
                this.restoreFromIndexedDB();
            }

            if (authData) {
                // Restore to all storage locations
                localStorage.setItem('profile', authData);
                sessionStorage.setItem('profile', authData);
                console.log('✅ Auth data restored');
                return JSON.parse(authData);
            }

            return null;
        } catch (error) {
            console.error('❌ Error restoring auth:', error);
            return null;
        }
    }

    // Save to IndexedDB for persistent storage
    saveToIndexedDB(data) {
        if (!window.indexedDB) return;

        const request = indexedDB.open('CampusConnectsDB', 1);

        request.onerror = () => console.error('IndexedDB error');

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('auth')) {
                db.createObjectStore('auth');
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['auth'], 'readwrite');
            const store = transaction.objectStore('auth');
            store.put(data, 'profile');
            console.log('✅ Saved to IndexedDB');
        };
    }

    // Restore from IndexedDB
    restoreFromIndexedDB() {
        if (!window.indexedDB) return;

        const request = indexedDB.open('CampusConnectsDB', 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('auth')) return;

            const transaction = db.transaction(['auth'], 'readonly');
            const store = transaction.objectStore('auth');
            const getRequest = store.get('profile');

            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    const dataString = JSON.stringify(getRequest.result);
                    localStorage.setItem('profile', dataString);
                    sessionStorage.setItem('profile', dataString);
                    console.log('✅ Restored from IndexedDB');
                    window.location.reload();
                }
            };
        };
    }

    // Save to cookie (30 days expiry)
    saveToCookie(data) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        document.cookie = `${this.storageKey}=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }

    // Get from cookie
    getFromCookie() {
        const name = this.storageKey + '=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }

    // Prevent storage from being cleared
    preventClear() {
        // Override localStorage.clear to preserve auth data
        const originalClear = Storage.prototype.clear;
        Storage.prototype.clear = function () {
            const profile = this.getItem('profile');
            const authKey = this.getItem('campus_connects_auth');
            originalClear.call(this);
            if (profile) this.setItem('profile', profile);
            if (authKey) this.setItem('campus_connects_auth', authKey);
        };

        // Save before page unload
        window.addEventListener('beforeunload', () => {
            const profile = localStorage.getItem('profile');
            if (profile) {
                sessionStorage.setItem('profile_backup', profile);
                this.saveToCookie(profile);
            }
        });

        // Restore after page load
        window.addEventListener('load', () => {
            const backup = sessionStorage.getItem('profile_backup');
            if (backup && !localStorage.getItem('profile')) {
                localStorage.setItem('profile', backup);
            }
        });
    }

    // Auto-save every 30 seconds
    startAutoSave() {
        setInterval(() => {
            const profile = localStorage.getItem('profile');
            if (profile) {
                try {
                    const data = JSON.parse(profile);
                    this.saveAuth(data);
                } catch (e) {
                    console.error('Auto-save error:', e);
                }
            }
        }, 30000); // 30 seconds
    }

    // Clear all auth data (for logout)
    clearAuth() {
        localStorage.removeItem('profile');
        localStorage.removeItem(this.storageKey);
        sessionStorage.removeItem('profile');
        sessionStorage.removeItem(this.storageKey);
        sessionStorage.removeItem('profile_backup');

        // Clear cookie
        document.cookie = `${this.storageKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

        // Clear IndexedDB
        if (window.indexedDB) {
            const request = indexedDB.open('CampusConnectsDB', 1);
            request.onsuccess = (event) => {
                const db = event.target.result;
                if (db.objectStoreNames.contains('auth')) {
                    const transaction = db.transaction(['auth'], 'readwrite');
                    const store = transaction.objectStore('auth');
                    store.delete('profile');
                }
            };
        }
    }
}

// Create global instance
const persistentStorage = new PersistentStorage();

// Intercept localStorage.setItem for 'profile'
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (key === 'profile') {
        try {
            const data = JSON.parse(value);
            persistentStorage.saveAuth(data);
        } catch (e) {
            console.error('Error intercepting setItem:', e);
        }
    }
};

// Export for use in logout
window.persistentStorage = persistentStorage;

export default persistentStorage;
