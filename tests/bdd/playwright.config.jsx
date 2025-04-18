import React from 'react';
import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import baseConfig from '../config/playwright.config.base.jsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * BDD-specific Playwright configuration
 * Extends the base configuration with BDD testing specifics
 */
const bddConfig = defineConfig({
  ...baseConfig,
  testDir: path.join(__dirname),
  testMatch: ['**/cucumber-playwright-adapter.spec.jsx'],
  timeout: 60000, // Override the base timeout for BDD tests
  use: {
    ...baseConfig.use,
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  reporter: [
    ...(baseConfig.reporter || []),
    ['html', { outputFolder: '../../test-results/bdd-report' }]
  ],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    }
  ]
});

const PlaywrightBddConfig = () => {
  return null; // This component does not render anything
};

export default bddConfig;
