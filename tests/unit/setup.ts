// Add type declaration for vitest-dom
declare global {
  var __vitest_dom_installed: boolean | undefined;
}

// Dynamische imports voor Vitest en test libraries
async function setupTestEnvironment() {
  // Voorkom dubbele registratie van jest-dom matchers
  const jestDomAlreadyRegistered = globalThis.__vitest_dom_installed;
  if (!jestDomAlreadyRegistered) {
    globalThis.__vitest_dom_installed = true;
    // Dynamic import voor jest-dom
    await import('@testing-library/jest-dom/vitest');
  }

  // Dynamic imports voor test libraries
  const { cleanup } = await import('@testing-library/react');
  const { afterEach, beforeAll, afterAll } = await import('vitest');
  const { initTestEnvironment, teardownAll } = await import('../utils/test-setup.jsx');
  const { logIntegrationConfig } = await import('../utils/environment.jsx');

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
}

// Start setup proces
setupTestEnvironment().catch(error => {
  console.error('Error during test setup:', error);
});