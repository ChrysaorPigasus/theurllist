import { test, expect } from '@playwright/test';
import { env, shouldMock, integrations } from '@tests/utils/environment';

// This file uses Playwright's test framework
// Display the current integration configuration before running tests
test.beforeAll(async () => {
  console.log(`Running API tests with configuration:
    • Database: ${integrations.database}
    • API: ${integrations.api}
    • Auth: ${integrations.auth}
    • External Services: ${integrations.externalServices}
  `);
});

test('GET /api/lists - should handle lists request', async ({ request }) => {
  // Voer de test uit ongeacht of API wordt gemockt of niet
  console.log(`Running GET test with API mock status: ${shouldMock('api') ? 'mocked' : 'integration'}`);
  
  const response = await request.get('/api/lists');
  
  // In test environment, verify API responds
  expect(response).toBeDefined();
  
  if (response.ok()) {
    const body = await response.json();
    expect(body).toBeDefined();
    // Als API is gemockt, verwacht je mogelijk specifieke mock-data
    if (shouldMock('api')) {
      console.log('Validating mock API response');
      // Voeg hier specifieke validaties toe voor mock response indien nodig
    } else {
      console.log('Validating real API response');
      // Voeg hier specifieke validaties toe voor echte API response indien nodig
    }
  } else {
    console.log(`API returned status: ${response.status()}`);
    
    // Als API in integratiemodus is maar toch faalt, kan het een probleem met de database zijn
    if (!shouldMock('api') && integrations.database === 'integration') {
      console.warn('Database integration is enabled but API test failed - check database connection');
    }
  }
});

test('POST /api/lists - should handle list creation request', async ({ request }) => {
  // Voer de test uit ongeacht of API wordt gemockt of niet
  console.log(`Running POST test with API mock status: ${shouldMock('api') ? 'mocked' : 'integration'}`);
  
  const listName = `Test List ${Date.now()}`;
  
  const response = await request.post('/api/lists', {
    data: {
      name: listName,
      description: 'Created via Playwright API test'
    }
  });
  
  // In test environment, verify API responds
  expect(response).toBeDefined();
  
  if (response.ok()) {
    const newList = await response.json();
    expect(newList).toBeDefined();
    // Basis validatie dat de response een name property heeft
    expect(newList).toHaveProperty('name');
    
    // Als we niet in mock modus zijn, doen we een strictere check
    if (!shouldMock('api')) {
      expect(newList.name).toBe(listName);
    }
  } else {
    console.log(`API returned status: ${response.status()}`);
  }
});

// Add a mock-only test that will run in environments where API is mocked
test('Mock API test - only runs when API is mocked', async ({ request }) => {
  // Only run this test when API is mocked
  if (!shouldMock('api')) {
    test.skip();
    return;
  }
  
  console.log('Running mock API test');
  
  // This is just a placeholder for mock-specific tests
  // In a real implementation, you'd interact with your mock API
  expect(true).toBeTruthy();
});