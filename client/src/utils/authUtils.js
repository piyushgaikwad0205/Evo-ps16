/**
 * Check if a token is valid based on its expiration time.
 * @param {string} token - The token to check.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
const isValidToken = (token) => {
  if (!token) {
    return false;
  }

  const payload = token.split(".")[1];
  if (!payload) {
    return false;
  }

  const decodedPayload = JSON.parse(window.atob(payload));

  const expiryTime = decodedPayload.exp * 1000;
  const currentTime = Date.now();
  return expiryTime > currentTime;
};

/**
 * Get authentication profile from cookie
 * @returns {object|null} profile object or null
 */
const getAuthFromCookie = () => {
  try {
    const cookieName = 'campus_auth_token';
    const name = cookieName + '=';
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
    console.error('Error reading auth from cookie:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * Checks localStorage for authentication
 * @returns {boolean} true if user is logged in
 */
const isUserAuthenticated = () => {
  try {
    // Check localStorage first
    const localProfile = localStorage.getItem('profile');
    if (localProfile) {
      const profile = JSON.parse(localProfile);
      if (profile && profile.accessToken && profile.user) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get user profile from localStorage or cookie
 * @returns {object|null} user profile or null
 */
const getUserProfile = () => {
  try {
    // Try localStorage first
    const localProfile = localStorage.getItem('profile');
    if (localProfile) {
      return JSON.parse(localProfile);
    }

    // Try cookie as fallback
    return getAuthFromCookie();
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export { isValidToken, isUserAuthenticated, getUserProfile };
