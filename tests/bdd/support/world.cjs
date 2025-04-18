// World class for sharing context between Cucumber steps
// Connects Cucumber with Playwright

/**
 * World class for sharing context between Cucumber steps
 */
class World {
  constructor({ attach, log, parameters }) {
    this.attach = attach;
    this.log = log;
    this.parameters = parameters;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Initialize the browser for the test
   */
  async init() {
    const { chromium } = require('@playwright/test');
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

// No React components in CommonJS module
module.exports = { World };