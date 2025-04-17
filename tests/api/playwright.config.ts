import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: '.', // Run tests in the current directory
  testMatch: '**/*.spec.ts', // Only run files with .spec.ts extension
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  },
  reporter: [['list'], ['json', { outputFile: 'test-results.json' }]],
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts'
});