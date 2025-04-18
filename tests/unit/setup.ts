// Add type declaration for vitest-dom
declare global {
  var __vitest_dom_installed: boolean | undefined;
}

// Voorkom dubbele registratie van jest-dom matchers
const jestDomAlreadyRegistered = globalThis.__vitest_dom_installed;
if (!jestDomAlreadyRegistered) {
  globalThis.__vitest_dom_installed = true;
  import('@testing-library/jest-dom/vitest');
}

import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { initTestEnvironment, teardownAll } from '../utils/test-setup.jsx';
import { logIntegrationConfig } from '../utils/environment.jsx';

// Initialize the test environment before any tests run
beforeAll(async () => {
  // Load environment variables and initialize services
  await initTestEnvironment();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Tear down all services after tests are complete
afterAll(async () => {
  await teardownAll();
});

// Log the current integration configuration
logIntegrationConfig();