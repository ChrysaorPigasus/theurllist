import React from 'react';
import { setWorldConstructor } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';

/**
 * World class voor het delen van context tussen Cucumber stappen
 * Dit verbindt Cucumber met Playwright
 */
export class World {
  constructor(options) {
    this.options = options;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Initialiseert de browser voor de test
   */
  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: 50,
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    return this.page;
  }

  /**
   * Simulates user login for testing
   */
  async login() {
    // Mock login implementation for tests
    await this.page.goto('http://localhost:3000');
    // Add actual login implementation here when needed
    // This is a placeholder as we're assuming user is logged in for tests
  }

  /**
   * Creates a new list for testing
   */
  async createList(name) {
    await this.page.goto('http://localhost:3000/lists');
    await this.page.getByText('Create New List').click();
    await this.page.getByLabel('List Name').fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  /**
   * Clean up after the test
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(World);

// React component wrapper for testing (example)
export const WorldProvider = ({ children }) => {
  return (
    <div className="test-world-provider">
      {children}
    </div>
  );
};