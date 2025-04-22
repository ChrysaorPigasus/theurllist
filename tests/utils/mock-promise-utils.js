/**
 * Utility functions for better promise rejection mocking
 * 
 * This file provides utilities for more consistent and debuggable
 * promise rejection mocking in tests.
 */

import { vi } from 'vitest';

/**
 * Creates a properly structured error with the given message for mocking rejected promises
 * This provides better stack traces and error info than just using Promise.reject()
 * 
 * @param {string} message - The error message
 * @param {object} options - Additional error properties
 * @returns {Function} A mock implementation that rejects with the error
 */
export const mockRejectedPromise = (message, options = {}) => {
  return vi.fn().mockImplementation(() => {
    const error = new Error(message);
    
    // Add additional properties to the error
    Object.entries(options).forEach(([key, value]) => {
      error[key] = value;
    });
    
    return Promise.reject(error);
  });
};

/**
 * Creates a network error for fetch failures
 * 
 * @param {string} message - Optional custom message
 * @returns {Function} A mock implementation that rejects with a network error
 */
export const mockNetworkError = (message = 'Network error') => {
  return mockRejectedPromise(message, { name: 'NetworkError' });
};

/**
 * Creates a validation error for form/input validation failures
 * 
 * @param {string} message - The validation error message
 * @param {object} fieldErrors - Field-specific errors
 * @returns {Function} A mock implementation that rejects with a validation error
 */
export const mockValidationError = (message, fieldErrors = {}) => {
  return mockRejectedPromise(message, { 
    name: 'ValidationError', 
    fieldErrors 
  });
};

/**
 * Creates a server error for API failures
 * 
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Function} A mock implementation that rejects with a server error
 */
export const mockServerError = (statusCode = 500, message = 'Server error') => {
  return mockRejectedPromise(message, { 
    name: 'ServerError', 
    statusCode 
  });
};

/**
 * Creates a timeout error for slow responses
 * 
 * @param {string} message - Error message
 * @returns {Function} A mock implementation that rejects with a timeout error
 */
export const mockTimeoutError = (message = 'Request timed out') => {
  return mockRejectedPromise(message, { 
    name: 'TimeoutError' 
  });
};