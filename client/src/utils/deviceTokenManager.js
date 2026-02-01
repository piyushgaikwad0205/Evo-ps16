/**
 * Device Token Manager for Persistent Login
 * Uses device-specific token to maintain login across app restarts
 */

class DeviceTokenManager {
    constructor() {
        this.deviceToken = null;
        this.init();
    }

    init() {
        // Get or create device token
        this.deviceToken = this.getDeviceToken();
        console.log('📱 Device Token:', this.deviceToken);
    }

    // Generate unique device token
    generateDeviceToken() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const userAgent = navigator.userAgent;
        const screen = `${window.screen.width}x${window.screen.height}`;

        // Create unique fingerprint
        const fingerprint = btoa(`${userAgent}-${screen}-${timestamp}-${random}`);
        return fingerprint;
    }

    // Get device token (create if doesn't exist)
    getDeviceToken() {
        // Try to get from multiple sources
        let token = this.getFromCookie('device_token');

        if (!token) {
            token = localStorage.getItem('device_token');
        }

        if (!token) {
            token = sessionStorage.getItem('device_token');
        }

        // If still no token, create new one
        if (!token) {
            token = this.generateDeviceToken();
            this.saveDeviceToken(token);
        }

        return token;
    }

    // Save device token to all storage locations
    saveDeviceToken(token) {
        try {
            // Save to localStorage
            localStorage.setItem('device_token', token);

            // Save to sessionStorage
            sessionStorage.setItem('device_token', token);

            // Save to cookie (1 year expiry)
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            document.cookie = `device_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;

            console.log('✅ Device token saved');
        } catch (error) {
            console.error('❌ Error saving device token:', error);
        }
    }

    // Get from cookie
    getFromCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    // Auto-login using device token
    async autoLogin() {
        try {
            const response = await fetch('/api/auth/device-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceToken: this.deviceToken
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.profile) {
                    // Save profile to localStorage
                    localStorage.setItem('profile', JSON.stringify(data.profile));
                    console.log('✅ Auto-login successful');
                    return data.profile;
                }
            }

            console.log('ℹ️ No saved session found');
            return null;
        } catch (error) {
            console.error('❌ Auto-login error:', error);
            return null;
        }
    }

    // Save session on login
    async saveSession(profile) {
        try {
            await fetch('/api/auth/save-device-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${profile.accessToken}`
                },
                body: JSON.stringify({
                    deviceToken: this.deviceToken,
                    userId: profile.user._id
                })
            });

            console.log('✅ Session saved to server');
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    }

    // Clear session on logout
    async clearSession() {
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');

            await fetch('/api/auth/clear-device-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${profile.accessToken}`
                },
                body: JSON.stringify({
                    deviceToken: this.deviceToken
                })
            });

            console.log('✅ Session cleared from server');
        } catch (error) {
            console.error('❌ Error clearing session:', error);
        }
    }
}

// Create global instance
const deviceTokenManager = new DeviceTokenManager();

// Export
window.deviceTokenManager = deviceTokenManager;

export default deviceTokenManager;
