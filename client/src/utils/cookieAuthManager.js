/**
 * Cookie-based Authentication Manager for Median Apps
 * Saves auth tokens to cookies for 30-day persistence
 */

class CookieAuthManager {
    constructor() {
        this.cookieName = 'campus_auth_token';
        this.init();
    }

    init() {
        console.log('🍪 Cookie Auth Manager initialized');

        // Try to restore auth from cookie on app start
        this.restoreAuthFromCookie();

        // Intercept localStorage setItem for 'profile'
        this.interceptProfileStorage();
    }

    // Save auth to cookie (30 days)
    saveAuthToCookie(profile) {
        try {
            const authData = JSON.stringify(profile);
            const expires = new Date();
            expires.setDate(expires.getDate() + 30); // 30 days

            // Set cookie with all necessary flags
            document.cookie = `${this.cookieName}=${encodeURIComponent(authData)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

            console.log('✅ Auth saved to cookie (30 days)');
            return true;
        } catch (error) {
            console.error('❌ Error saving auth to cookie:', error);
            return false;
        }
    }

    // Get auth from cookie
    getAuthFromCookie() {
        try {
            const name = this.cookieName + '=';
            const decodedCookie = decodeURIComponent(document.cookie);
            const ca = decodedCookie.split(';');

            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    const cookieValue = c.substring(name.length, c.length);
                    return JSON.parse(cookieValue);
                }
            }
            return null;
        } catch (error) {
            console.error('❌ Error reading auth from cookie:', error);
            return null;
        }
    }

    // Restore auth from cookie to localStorage
    restoreAuthFromCookie() {
        try {
            const existingProfile = localStorage.getItem('profile');

            // Only restore if localStorage is empty
            if (!existingProfile) {
                const cookieProfile = this.getAuthFromCookie();

                if (cookieProfile) {
                    console.log('✅ Restoring auth from cookie');
                    localStorage.setItem('profile', JSON.stringify(cookieProfile));
                    sessionStorage.setItem('profile', JSON.stringify(cookieProfile));

                    // Reload to apply authentication
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                } else {
                    console.log('ℹ️ No auth cookie found');
                }
            }
        } catch (error) {
            console.error('❌ Error restoring from cookie:', error);
        }
    }

    // Intercept localStorage.setItem to auto-save to cookie
    interceptProfileStorage() {
        const originalSetItem = Storage.prototype.setItem;
        const self = this;

        Storage.prototype.setItem = function (key, value) {
            // Call original setItem
            originalSetItem.call(this, key, value);

            // If it's the profile, also save to cookie
            if (key === 'profile') {
                try {
                    const profile = JSON.parse(value);
                    self.saveAuthToCookie(profile);
                } catch (e) {
                    console.error('Error intercepting profile save:', e);
                }
            }
        };
    }

    // Clear auth cookie (for logout)
    clearAuthCookie() {
        try {
            document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            console.log('✅ Auth cookie cleared');
        } catch (error) {
            console.error('❌ Error clearing cookie:', error);
        }
    }

    // Check if auth is valid
    isAuthValid() {
        const profile = this.getAuthFromCookie();
        if (!profile || !profile.accessToken) {
            return false;
        }

        // Check if token is expired (basic check)
        try {
            const tokenParts = profile.accessToken.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const exp = payload.exp * 1000; // Convert to milliseconds
                return Date.now() < exp;
            }
        } catch (e) {
            console.error('Error checking token validity:', e);
        }

        return true; // Assume valid if can't parse
    }

    // Refresh auth from cookie periodically
    startPeriodicRefresh() {
        setInterval(() => {
            const cookieProfile = this.getAuthFromCookie();
            const localProfile = localStorage.getItem('profile');

            // If cookie exists but localStorage doesn't, restore
            if (cookieProfile && !localProfile) {
                console.log('🔄 Periodic refresh: Restoring from cookie');
                localStorage.setItem('profile', JSON.stringify(cookieProfile));
            }
        }, 5000); // Check every 5 seconds
    }
}

// Create global instance
const cookieAuthManager = new CookieAuthManager();

// Start periodic refresh
cookieAuthManager.startPeriodicRefresh();

// Export for use in logout
window.cookieAuthManager = cookieAuthManager;

export default cookieAuthManager;
