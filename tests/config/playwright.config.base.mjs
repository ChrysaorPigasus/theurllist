import React from 'react';
import { defineConfig } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import dotenvFlow from 'dotenv-flow';

// Laad omgevingsvariabelen op basis van TEST_ENV
const TEST_ENV = process.env.TEST_ENV || 'local';
dotenvFlow.config({
  path: path.resolve(process.cwd()),
  node_env: TEST_ENV
});

// Log configuratie voor debugging
console.log(`
Playwright Base Configuration:
- Test Environment: ${TEST_ENV}
- Test Type: ${process.env.TEST_TYPE || 'not set'}
- Force Mocks: ${process.env.FORCE_MOCKS === 'true' ? 'Yes' : 'No'}
- Force Integrations: ${process.env.FORCE_INTEGRATIONS === 'true' ? 'Yes' : 'No'}
`);

/**
 * Base configuration for Playwright tests
 * This file contains common settings shared between API and BDD tests
 */
const baseConfig = defineConfig({
  testDir: '@tests',
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    // Pas testgegevens aan op basis van de huidige testomgeving
    testIdAttribute: 'data-testid',
    // Stel omgevingsvariabelen beschikbaar voor de tests
    contextOptions: {
      env: {
        TEST_ENV: TEST_ENV,
        TEST_TYPE: process.env.TEST_TYPE || '',
        FORCE_MOCKS: process.env.FORCE_MOCKS || 'false',
        FORCE_INTEGRATIONS: process.env.FORCE_INTEGRATIONS || 'false',
      }
    }
  },
  reporter: [['list'], ['html', { outputFolder: './test-results/playwright-report' }]],
  // Projecten configureren op basis van verschillende omgevingen
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    // Voeg eventueel andere browsers toe indien nodig
    // {
    //   name: 'firefox',
    //   use: { browserName: 'firefox' },
    // },
  ],
});

const PlaywrightBaseConfig = () => {
  return null; // This component does not render anything
};

export default baseConfig;
