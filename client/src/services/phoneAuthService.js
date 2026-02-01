import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Phone Authentication Service
 * Handles all phone auth related API calls
 */
class PhoneAuthService {
    /**
     * Verify Firebase phone token and login/register user
     * @param {string} firebaseToken - Firebase ID token
     * @param {string} phoneNumber - Phone number in E.164 format
     * @returns {Promise<object>} User data and session token
     */
    async verifyPhoneToken(firebaseToken, phoneNumber) {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/phone/verify`, {
                firebaseToken,
                phoneNumber,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Link phone number to existing account
     * @param {string} firebaseToken - Firebase ID token
     * @param {string} phoneNumber - Phone number in E.164 format
     * @param {string} sessionToken - User's session JWT token
     * @returns {Promise<object>} Updated user data
     */
    async linkPhoneToAccount(firebaseToken, phoneNumber, sessionToken) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/user/phone/link`,
                {
                    firebaseToken,
                    phoneNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Request OTP (Email or Phone)
     * @param {object} params - Request parameters
     * @param {string} params.email - Email address (optional)
     * @param {string} params.phoneNumber - Phone number (optional)
     * @param {string} params.method - Delivery method: 'email' | 'phone' | 'both'
     * @returns {Promise<object>} OTP request result
     */
    async requestOTP({ email, phoneNumber, method = 'email' }) {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/request-otp`, {
                email,
                phoneNumber,
                method,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Verify OTP code
     * @param {string} email - Email address
     * @param {string} otp - OTP code
     * @returns {Promise<object>} Verification result
     */
    async verifyOTP(email, otp) {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/verify-otp`, {
                email,
                otp,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Toggle 2FA settings
     * @param {boolean} enabled - Enable/disable 2FA
     * @param {string} method - 2FA method: 'email' | 'phone' | 'both'
     * @param {string} sessionToken - User's session JWT token
     * @returns {Promise<object>} Updated 2FA settings
     */
    async toggle2FA(enabled, method, sessionToken) {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/user/toggle-2fa`,
                {
                    enabled,
                    method,
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Update mobile number
     * @param {string} mobile - Mobile number (10 digits)
     * @param {string} sessionToken - User's session JWT token
     * @returns {Promise<object>} Updated user data
     */
    async updateMobile(mobile, sessionToken) {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/user/update-mobile`,
                {
                    mobile,
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     * @param {Error} error - Axios error
     * @returns {Error} Formatted error
     */
    handleError(error) {
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message || 'An error occurred';
            const err = new Error(message);
            err.status = error.response.status;
            err.data = error.response.data;
            return err;
        } else if (error.request) {
            // Request made but no response
            return new Error('No response from server. Please check your connection.');
        } else {
            // Error in request setup
            return new Error(error.message || 'An unexpected error occurred');
        }
    }
}

const phoneAuthServiceInstance = new PhoneAuthService();
export default phoneAuthServiceInstance;
