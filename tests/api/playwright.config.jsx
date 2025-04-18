import React from 'react';
import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import baseConfig from '@tests/config/playwright.config.base.jsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * API-specific Playwright configuration
 * Extends the base configuration with API testing specifics
 */
const apiConfig = defineConfig({
  ...baseConfig,
  testDir: '@tests/api',
  testMatch: '**/*.spec.ts',
  use: {
    ...baseConfig.use,
    extraHTTPHeaders: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  },
  reporter: [
    ...(baseConfig.reporter || []),
    ['json', { outputFile: 'test-results.json' }]
  ],
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts'
});

const PlaywrightApiConfig = () => {
  return null; // This component does not render anything
};

export default apiConfig;
