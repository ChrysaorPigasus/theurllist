import { Page } from '@playwright/test';

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
    
    // Perform the action
    const result = await actionFn();
    
    // Check for any new errors
    const afterCount = this.errorMessages.length;
    if (afterCount > beforeCount) {
      const newErrors = this.errorMessages.slice(beforeCount);
      console.warn(`⚠️ Console errors detected during "${description}":\n`, newErrors);
    }
    
    return result;
  }
}
