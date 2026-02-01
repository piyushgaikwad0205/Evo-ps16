/**
 * Frontend utility functions for handling image URLs and fallbacks
 */

// Base URL for the backend server
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://campus-connects-final-1.onrender.com';

/**
 * Gets a placeholder image URL for missing images
 * @param {string} type - Type of placeholder ('avatar', 'banner', 'post')
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (type = 'avatar') => {
  const placeholders = {
    avatar: 'https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg',
    banner: 'https://placehold.co/400x200/6366f1/ffffff?text=Club+Banner',
    post: 'https://placehold.co/400x300?text=No+Image'
  };

  return placeholders[type] || placeholders.avatar;
};

/**
 * Ensures an image URL is complete and valid
 * @param {string} imageUrl - The image URL to process
 * @param {string} type - Type of image ('avatar', 'banner', 'post')
 * @returns {string} Valid image URL or placeholder
 */
export const getValidImageUrl = (imageUrl, type = 'avatar') => {
  // Return placeholder if no URL provided
  if (!imageUrl || imageUrl === '' || imageUrl === 'undefined' || imageUrl === 'null') {
    return getPlaceholderImage(type);
  }

  // If it's already a full URL (http/https or Cloudinary), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  // If it starts with /assets/, it's a relative path from backend
  if (imageUrl.startsWith('/assets/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  // If it's just a filename (no slashes), construct the full URL
  if (!imageUrl.includes('/')) {
    const folder = type === 'banner' ? 'clubBanners' : type === 'post' ? 'userFiles' : 'userAvatars';
    return `${BACKEND_URL}/assets/${folder}/${imageUrl}`;
  }

  // If it's any other relative path, prepend backend URL
  return `${BACKEND_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

/**
 * Gets a valid avatar URL with fallback
 * @param {string} avatarUrl - The avatar URL
 * @returns {string} Valid avatar URL or placeholder
 */
export const getAvatarUrl = (avatarUrl) => {
  return getValidImageUrl(avatarUrl, 'avatar');
};

/**
 * Gets a valid banner URL with fallback
 * @param {string} bannerUrl - The banner URL
 * @returns {string} Valid banner URL or placeholder
 */
export const getBannerUrl = (bannerUrl) => {
  return getValidImageUrl(bannerUrl, 'banner');
};

/**
 * Gets a valid post image URL with fallback
 * @param {string} imageUrl - The post image URL
 * @returns {string} Valid image URL or placeholder
 */
export const getPostImageUrl = (imageUrl) => {
  return getValidImageUrl(imageUrl, 'post');
};

/**
 * Handles image loading errors by setting a fallback
 * @param {Event} event - The error event
 * @param {string} type - Type of fallback image
 */
export const handleImageError = (event, type = 'avatar') => {
  event.target.src = getPlaceholderImage(type);
  event.target.onerror = null; // Prevent infinite loop
};

/**
 * Preloads an image to check if it's valid
 * @param {string} url - The image URL to check
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const preloadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};