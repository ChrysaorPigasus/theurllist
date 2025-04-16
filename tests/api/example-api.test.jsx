import { describe, it, beforeEach } from 'vitest';
import { env, skipTestInEnvironment } from '@utils/environment';

describe('API Tests', () => {
  // Skip the entire suite if we're in an environment that doesn't support API tests
  if (skipTestInEnvironment(env.currentEnv, 'api')) {
    it.skip('API tests are disabled in this environment', () => {});
    return;
  }

  it('should fetch data from API endpoint', async () => {
    const response = await fetch(`${env.baseUrl}/api/${env.apiVersion}/data`);
    // Test assertions here
  });
});