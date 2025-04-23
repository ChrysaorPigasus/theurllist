/**
 * Tracks React hydration errors in a browser context
 * This script will be injected into the page to capture and log hydration errors
 */
export const trackHydrationErrors = `
  window.hydrationErrors = [];
  window.lastNavigationTime = new Date().getTime();
  
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Function to check if a message contains hydration-related terms
  const isHydrationIssue = (msg) => {
    const lowerMsg = msg.toLowerCase();
    return (
      lowerMsg.includes('hydration failed') || 
      lowerMsg.includes('did not match') ||
      lowerMsg.includes('hydration') ||
      lowerMsg.includes('hydratable') ||
      lowerMsg.includes('expected server html') ||
      lowerMsg.includes('server: ') && lowerMsg.includes('client: ')
    );
  };
  
  // Capture location and component information when possible
  const extractComponentInfo = (stack) => {
    if (!stack) return 'Unknown component';
    
    const lines = stack.split('\\n');
    // Look for component names in the stack trace
    for (const line of lines) {
      // Find React component names (usually capitalized)
      const componentMatch = line.match(/at ([A-Z][a-zA-Z0-9]+)/);
      if (componentMatch && componentMatch[1]) {
        return componentMatch[1];
      }
    }
    
    return 'Unknown component';
  };
  
  // Intercept console.error calls
  console.error = function(...args) {
    // Call original console.error
    originalConsoleError.apply(console, args);
    
    // Check if this is a hydration error
    const errorString = args.join(' ');
    if (isHydrationIssue(errorString)) {
      const error = new Error();
      window.hydrationErrors.push({
        timestamp: new Date().toISOString(),
        message: errorString,
        url: window.location.href,
        component: extractComponentInfo(error.stack),
        timeSinceNavigation: new Date().getTime() - window.lastNavigationTime
      });
      
      // Dispatch custom event for test frameworks
      window.dispatchEvent(new CustomEvent('hydration-error', { 
        detail: { message: errorString }
      }));
    }
  };
  
  // Also monitor console.warn for hydration issues
  console.warn = function(...args) {
    // Call original console.warn
    originalConsoleWarn.apply(console, args);
    
    // Check if this is a hydration warning
    const warnString = args.join(' ');
    if (isHydrationIssue(warnString)) {
      const error = new Error();
      window.hydrationErrors.push({
        timestamp: new Date().toISOString(),
        message: warnString,
        url: window.location.href,
        component: extractComponentInfo(error.stack),
        timeSinceNavigation: new Date().getTime() - window.lastNavigationTime,
        level: 'warning'
      });
      
      // Dispatch custom event for test frameworks
      window.dispatchEvent(new CustomEvent('hydration-warning', { 
        detail: { message: warnString }
      }));
    }
  };
  
  // Track navigation
  const originalPushState = history.pushState;
  history.pushState = function() {
    window.lastNavigationTime = new Date().getTime();
    return originalPushState.apply(this, arguments);
  };
  
  // Listen for actual navigation events
  window.addEventListener('popstate', () => {
    window.lastNavigationTime = new Date().getTime();
  });
`;

/**
 * Injects the hydration tracker script into the page
 */
export const injectHydrationTracker = async (page) => {
  await page.evaluate(trackHydrationErrors);
};

/**
 * Checks if there are any hydration errors on the page
 * @returns Promise<Array> Array of hydration errors
 */
export const checkForHydrationErrors = async (page) => {
  return await page.evaluate(() => window.hydrationErrors || []);
};

/**
 * Clears the hydration errors on the page
 */
export const clearHydrationErrors = async (page) => {
  await page.evaluate(() => {
    window.hydrationErrors = [];
  });
};

/**
 * Verifies that there are no hydration errors and throws if any are found
 * @param {Page} page - Playwright page object
 * @param {string} context - Description of what was being tested
 * @throws Error if hydration errors are found
 */
export const verifyNoHydrationErrors = async (page, context = 'test') => {
  const errors = await checkForHydrationErrors(page);
  
  if (errors.length > 0) {
    // Format the errors for better readability
    const formattedErrors = errors.map(err => 
      `- ${err.component || 'Unknown'}: ${err.message.split('\n')[0]}`
    ).join('\n');
    
    throw new Error(
      `Hydration errors detected during ${context}:\n${formattedErrors}\n` +
      `This indicates a mismatch between server and client rendering.`
    );
  }
  
  return true;
};