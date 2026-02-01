/**
 * Utility functions for handling image URLs and file paths
 */

/**
 * Constructs a full URL for an uploaded image
 * @param {Object} req - Express request object
 * @param {string} filename - The uploaded filename
 * @param {string} folder - The folder name (e.g., 'userAvatars', 'clubBanners')
 * @returns {string} Full URL to the image
 */
const constructImageUrl = (req, filename, folder) => {
  if (!filename) return '';
  
  const protocol = req.protocol || 'http';
  const host = req.get("host") || 'localhost:4000';
  return `${protocol}://${host}/assets/${folder}/${filename}`;
};

/**
 * Constructs a full URL for an existing image URL or filename
 * @param {string} imagePath - Existing image path or filename
 * @param {string} folder - The folder name (e.g., 'userAvatars', 'clubBanners')
 * @param {string} baseUrl - Base URL for the server (optional)
 * @returns {string} Full URL to the image
 */
const getFullImageUrl = (imagePath, folder, baseUrl = null) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's just a filename, construct the full URL
  if (!imagePath.includes('/')) {
    const base = baseUrl || 'http://localhost:4000';
    return `${base}/assets/${folder}/${imagePath}`;
  }
  
  // If it's a relative path, construct the full URL
  const base = baseUrl || 'http://localhost:4000';
  return `${base}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Validates if an image URL is accessible
 * @param {string} url - Image URL to validate
 * @returns {boolean} True if URL is valid
 */
const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Basic URL validation
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets a placeholder image URL for missing images
 * @param {string} type - Type of placeholder ('avatar', 'banner', 'post')
 * @returns {string} Placeholder image URL
 */
const getPlaceholderImage = (type = 'avatar') => {
  const placeholders = {
    avatar: 'https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg',
    banner: 'https://via.placeholder.com/400x200?text=No+Banner',
    post: 'https://via.placeholder.com/400x300?text=No+Image'
  };
  
  return placeholders[type] || placeholders.avatar;
};

module.exports = {
  constructImageUrl,
  getFullImageUrl,
  isValidImageUrl,
  getPlaceholderImage
};