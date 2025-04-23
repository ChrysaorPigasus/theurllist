/**
 * Console Error Spy Utility
 * 
 * A utility to track and capture console errors during testing or debugging
 */

/**
 * Creates a spy for console.error that captures all errors
 * @returns {Object} The error spy object with methods to control and access error data
 */
export const createErrorSpy = () => {
  // Store the original console.error method
  const originalError = console.error;
  
  // Collection to store captured errors
  const errors = [];
  
  const spy = {
    // Initialize the spy by replacing console.error
    init() {
      console.error = (...args) => {
        // Store the error with metadata
        errors.push({
          timestamp: new Date(),
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
          stack: new Error().stack,
          args: [...args] // Store the original arguments
        });
        
        // Call the original console.error to maintain normal behavior
        originalError.apply(console, args);
      };
      
      return this;
    },
    
    // Reset the spy and restore original console.error
    reset() {
      errors.length = 0; // Clear the errors array
      console.error = originalError;
      return this;
    },
    
    // Get all captured errors
    getErrors() {
      return [...errors]; // Return a copy to prevent modification
    },
    
    // Check if specific error patterns were captured
    hasErrorMatching(pattern) {
      if (typeof pattern === 'string') {
        return errors.some(error => error.message.includes(pattern));
      } else if (pattern instanceof RegExp) {
        return errors.some(error => pattern.test(error.message));
      }
      return false;
    },
    
    // Get the count of errors
    count() {
      return errors.length;
    },
    
    // Clear captured errors without resetting the spy
    clear() {
      errors.length = 0;
      return this;
    }
  };
  
  return spy;
};

// Singleton instance for global use
let globalErrorSpy = null;

export const getGlobalErrorSpy = () => {
  if (!globalErrorSpy) {
    globalErrorSpy = createErrorSpy();
  }
  return globalErrorSpy;
};

export default createErrorSpy;