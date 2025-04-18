// Cucumber hooks for setup and teardown
const { Before, After, setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

/**
 * Custom World class for Playwright integration with Cucumber
 */
class CustomWorld {
  constructor({ attach, log, parameters }) {
    this.attach = attach;
    this.log = log;
    this.parameters = parameters;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    // Launch browser
    this.browser = await chromium.launch({ 
      headless: process.env.HEADLESS !== 'false',
      slowMo: 50 
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    return this.page;
  }
}

// Register custom world constructor
setWorldConstructor(CustomWorld);

// Before hook - runs before each scenario
Before(async function() {
  await this.init();
  // Add any other setup needed for all scenarios
});

// After hook - runs after each scenario
After(async function() {
  if (this.browser) {
    await this.browser.close();
  }
});

module.exports = { CustomWorld };