/**
 * Utilities for generating and validating URLs
 */

/**
 * Generate a URL-friendly slug from a list name
 * @param {string} listName - The name to generate a slug from
 * @returns {string} A URL-friendly slug
 */
export function generateUrlSlug(listName = '') {
  // Generate a URL-friendly slug from the list name
  const baseSlug = listName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Add random characters for uniqueness
  const randomChars = Math.random().toString(36).substring(2, 6);
  const timestamp = Date.now().toString(36).substring(-4);
  
  return `${baseSlug ? baseSlug + '-' : ''}${randomChars}-${timestamp}`;
}

/**
 * Generates a URL-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @param {number} maxLength - Maximum length of the slug (default: 60)
 * @return {string} The generated slug
 */
export function generateSlug(text, maxLength = 60) {
  if (!text) return '';
  
  // Convert to lowercase, remove special chars, replace spaces with hyphens
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single hyphen
  
  // Truncate to maxLength, but don't cut in the middle of a word
  if (slug.length <= maxLength) return slug;
  
  // Find the last hyphen before maxLength
  const truncated = slug.substring(0, maxLength);
  const lastHyphen = truncated.lastIndexOf('-');
  
  return lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated;
}

/**
 * Validate a custom URL
 * @param {string} url - The URL to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateCustomUrl(url) {
  if (!url.trim()) {
    return 'Custom URL cannot be empty';
  }
  if (!/^[a-zA-Z0-9-]+$/.test(url)) {
    return 'Custom URL can only contain letters, numbers, and hyphens';
  }
  if (url.length < 3) {
    return 'Custom URL must be at least 3 characters long';
  }
  if (url.length > 50) {
    return 'Custom URL must be less than 50 characters long';
  }
  return null;
}