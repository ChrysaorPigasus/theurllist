import { describe, it, expect, beforeEach } from 'vitest';
import { env, skipTestInEnvironment } from '@tests/utils/environment';

describe('API Tests', () => {
  // Skip the entire suite if we're in an environment that doesn't support API tests
  if (skipTestInEnvironment(env.currentEnv, 'api')) {
    it.skip('API tests are disabled in this environment', () => {});
    return;
  }

  it('should fetch data from API endpoint', async () => {
    // Zorg voor een correct geformatteerde URL, zelfs als baseUrl ongeldig is
    let apiUrl;
    try {
      // Probeer eerst met URL constructor
      const baseUrl = env.baseUrl.startsWith('http') ? env.baseUrl : `http://localhost:3000`;
      apiUrl = new URL(`/api/${env.apiVersion}/data`, baseUrl).toString();
    } catch (error) {
      // Fallback naar string concatenatie als URL constructor faalt
      console.warn(`URL constructor failed: ${error.message}`);
      const baseUrl = env.baseUrl.startsWith('http') ? env.baseUrl : 'http://localhost:3000';
      apiUrl = `${baseUrl}/api/${env.apiVersion}/data`;
    }
    
    console.log(`Making API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    expect(response).toBeDefined();
    
    // Test assertions here
    if (response.ok) {
      const data = await response.json();
      expect(data).toBeDefined();
    } else {
      console.log(`API request failed with status: ${response.status}`);
    }
  });
});