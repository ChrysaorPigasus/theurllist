const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: [
    'api/**/*.spec.{ts,js}',
    'bdd/**/*cucumber-playwright-adapter.spec.{cjs,js}'
  ],
  reporter: [['list'], ['html', { outputFolder: './test-results/playwright-report' }]],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
  // Optioneel: stel baseURL in als je dat wilt
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    testIdAttribute: 'data-testid',
  },
});