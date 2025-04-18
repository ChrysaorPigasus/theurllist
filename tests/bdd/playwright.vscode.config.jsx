import React from 'react';
import { defineConfig } from '@playwright/test';
import path from 'path';
import baseConfig from '../config/playwright.config.base.jsx';

/**
 * VS Code specifieke Playwright configuratie voor BDD tests
 * Deze configuratie maakt BDD tests direct zichtbaar in de Test Explorer
 */
const vscodeConfig = defineConfig({
  ...baseConfig,
  testDir: path.join(__dirname),
  // Wijzig het testMatch patroon om beter herkend te worden door VS Code
  testMatch: ['**/*cucumber-playwright-adapter.spec.jsx'],
  timeout: 60000, // Langere timeout voor BDD tests
  use: {
    ...baseConfig.use,
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../test-results/bdd-report' }]
  ],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    }
  ]
});

const PlaywrightVSCodeConfig = () => {
  return null; // Deze component rendert niets
};

export default vscodeConfig;
