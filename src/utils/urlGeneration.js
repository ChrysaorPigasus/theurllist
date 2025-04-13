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