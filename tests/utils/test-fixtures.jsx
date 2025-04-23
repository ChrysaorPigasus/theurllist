import React from 'react';
import { test as base } from '@playwright/test';
import { getGlobalErrorSpy } from '@utils/errorSpy';
import { UrlListPage } from './UrlListPage';

/**
 * Extended test fixture with console error tracking
 */
export const test = base.extend({
  // Initialize error tracking before each test
  errorTracker: async ({}, use) => {
    // Get and initialize the global error spy
    const errorSpy = getGlobalErrorSpy().init();

    // Clear any existing errors
    errorSpy.clear();

    // Provide the error spy to the test
    await use(errorSpy);

    // Optional: Check for any uncaught errors at the end of the test
    const errors = errorSpy.getErrors();
    if (errors.length > 0) {
      console.warn(
        `⚠️ ${errors.length} console errors were detected during the test but not caught by verifications:`,
        errors.map((e) => e.message)
      );
    }
  },

  // Provide the URL list page with error tracking
  urlListPage: async ({ page, errorTracker }, use) => {
    // Create an instance of the UrlListPage with default options
    const urlListPage = new UrlListPage(page);

    // Provide the page to the test
    await use(urlListPage);
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
