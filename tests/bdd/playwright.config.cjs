// BDD-specific Playwright configuration using CommonJS
const { defineConfig } = require('@playwright/test');
const path = require('path');

/**
 * BDD-specific Playwright configuration
 * Configuration for running BDD feature tests with Playwright
 */
module.exports = defineConfig({
  testDir: path.join(__dirname),
  testMatch: '**/cucumber-playwright-adapter.spec.cjs',
  timeout: 60000,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'retain-on-failure',
    baseURL: 'http://localhost:3000'
  },
  reporter: [
    ['html', { outputFolder: '../../test-results/bdd-report' }],
    ['list']
  ],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    }
  ]
});