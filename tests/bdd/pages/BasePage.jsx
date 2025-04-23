import { Page } from '@playwright/test';
import { injectHydrationTracker, verifyNoHydrationErrors, clearHydrationErrors } from '../../utils/hydration-tracker';

/**
 * BasePage - A base class for page objects with built-in error tracking
 * 
 * This class provides common functionality for all page objects,
 * including automatic console error detection between test steps.
 */
export class BasePage {
  page: Page;
  errorMessages: string[] = [];
  previousErrorCount: number = 0;
  hasInjectedTracker: boolean = false;

  constructor(page: Page) {
    this.page = page;
    this.setupErrorTracking();
  }

  /**
   * Set up console error tracking on the page
   */
  private async setupErrorTracking() {
    // Start listening for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errorMessages.push(`${new Date().toISOString()} - ${msg.text()}`);
      }
    });

    // Also track page errors
    this.page.on('pageerror', error => {
      this.errorMessages.push(`${new Date().toISOString()} - Page Error: ${error.message}`);
    });
  }

  /**
   * Check for new console errors since the last check
   * @returns {Array} Array of new errors, empty if none
   */
  checkForNewErrors() {
    const currentErrorCount = this.errorMessages.length;
    const newErrors = this.errorMessages.slice(this.previousErrorCount);
    this.previousErrorCount = currentErrorCount;
    return newErrors;
  }

  /**
   * Verify no new console errors occurred
   * @param {string} stepDescription - Description of the step being verified
   * @throws {Error} If new console errors were detected
   */
  verifyNoConsoleErrors(stepDescription = 'previous step') {
    const newErrors = this.checkForNewErrors();
    
    if (newErrors.length > 0) {
      const errorMessages = newErrors.join('\n  - ');
      throw new Error(
        `Console errors detected during ${stepDescription}:\n  - ${errorMessages}\n` +
        `This indicates an unexpected error occurred in the application.`
      );
    }
    
    return true;
  }

  /**
   * Reset error tracking
   */
  resetErrorTracking() {
    this.errorMessages = [];
    this.previousErrorCount = 0;
  }

  /**
   * Clear tracked errors without disabling tracking
   */
  clearErrors() {
    this.errorMessages = [];
    this.previousErrorCount = 0;
  }

  /**
   * Wrapper for actions to automatically track console errors
   * @param {Function} actionFn - The action to perform
   * @param {string} description - Description of the action
   */
  async performAction(actionFn: () => Promise<any>, description: string) {
    // Store the current error count before the action
    const beforeCount = this.errorMessages.length;
    
    // Also clear any existing hydration errors before the action
    if (this.hasInjectedTracker) {
      await clearHydrationErrors(this.page);
    }
    
    // Perform the action
    const result = await actionFn();
    
    // Check for any new errors
    const afterCount = this.errorMessages.length;
    if (afterCount > beforeCount) {
      const newErrors = this.errorMessages.slice(beforeCount);
      console.warn(`⚠️ Console errors detected during "${description}":\n`, newErrors);
    }
    
    // Also check for hydration errors if tracker is injected
    if (this.hasInjectedTracker) {
      try {
        await verifyNoHydrationErrors(this.page, description);
      } catch (error) {
        console.error(`⚠️ Hydration errors detected during "${description}":\n`, error.message);
        throw error;
      }
    }
    
    return result;
  }

  /**
   * Navigate to a URL and inject hydration error tracking
   * @param {string} url - The URL to navigate to
   */
  async navigateTo(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    // Inject hydration error tracking script if not already injected
    if (!this.hasInjectedTracker) {
      await injectHydrationTracker(this.page);
      this.hasInjectedTracker = true;
    }
    
    // Clear any errors that occurred during navigation
    await clearHydrationErrors(this.page);
  }

  /**
   * Check for React hydration errors
   * @returns {Array} Array of hydration errors, empty if none
   */
  async checkForHydrationErrors() {
    if (!this.hasInjectedTracker) {
      await injectHydrationTracker(this.page);
      this.hasInjectedTracker = true;
    }
    
    return await this.page.evaluate(() => {
      return window.hydrationErrors || [];
    });
  }

  /**
   * Verify no hydration errors occurred
   * @param {string} context - Description of the context being verified
   * @throws {Error} If hydration errors were detected
   */
  async verifyNoHydrationErrors(context = 'page navigation') {
    if (!this.hasInjectedTracker) {
      await injectHydrationTracker(this.page);
      this.hasInjectedTracker = true;
    }
    
    await verifyNoHydrationErrors(this.page, context);
  }

  /**
   * Performs a page action and checks for hydration errors before and after
   * This is useful for detecting hydration errors that occur after interactions
   * @param {Function} actionFn - The action to perform
   * @param {string} description - Description of the action for error reporting
   * @param {boolean} expectHydrationErrors - Whether hydration errors are expected (for negative testing)
   */
  async performHydrationCheck(actionFn, description, expectHydrationErrors = false) {
    // Make sure tracker is injected
    if (!this.hasInjectedTracker) {
      await injectHydrationTracker(this.page);
      this.hasInjectedTracker = true;
    }
    
    // Clear existing errors
    await clearHydrationErrors(this.page);
    
    // Perform the action
    await actionFn();
    
    // Check for hydration errors
    const errors = await this.checkForHydrationErrors();
    
    if (!expectHydrationErrors && errors.length > 0) {
      // Throw with detailed error information
      const errorMessages = errors.map(err => 
        `- Component: ${err.component}, URL: ${err.url}\n  Message: ${err.message.split('\n')[0]}`
      ).join('\n');
      
      throw new Error(
        `Hydration errors detected after ${description}:\n${errorMessages}\n` +
        `This indicates a mismatch between server and client rendering.`
      );
    } else if (expectHydrationErrors && errors.length === 0) {
      throw new Error(`Expected hydration errors during ${description}, but none occurred.`);
    }
    
    return errors;
  }
}
