import React from 'react';

const defaultConfig = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  timeouts: {
    defaultTimeout: 30000,
    navigationTimeout: 45000,
    apiTimeout: 15000,
  },
  retries: {
    testRetries: 2,
    actionRetries: 3,
  },
  viewport: {
    width: 1280,
    height: 720,
    isMobile: false,
  },
  screenshots: {
    takeOnFailure: true,
    directory: './test-results/screenshots',
  },
  testData: {
    cleanupAfterTest: true,
    useRealApi: false,
    seedDatabase: true,
  },
  database: {
    connectionString: 'postgres://postgres:postgres@localhost:5432/theurllist',
    resetBetweenTests: true,
  }
};

const environments = {
  local: {
    // Local overrides
  },
  development: {
    baseUrl: 'https://dev.theurllist.com',
    apiUrl: 'https://dev.theurllist.com/api',
  },
  staging: {
    baseUrl: 'https://staging.theurllist.com',
    apiUrl: 'https://staging.theurllist.com/api',
    testData: {
      cleanupAfterTest: true,
      useRealApi: true,
      seedDatabase: false,
    },
  },
  production: {
    baseUrl: 'https://theurllist.com',
    apiUrl: 'https://theurllist.com/api',
    testData: {
      cleanupAfterTest: true,
      useRealApi: true,
      seedDatabase: false,
    },
    database: {
      resetBetweenTests: false,
    },
  },
};

function deepMerge(target, source) {
  const result = { ...target };

  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (sourceValue && targetValue && typeof sourceValue === 'object' && typeof targetValue === 'object') {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    });
  }

  return result;
}

export function getConfig(env = process.env.TEST_ENV || 'local') {
  const environmentConfig = environments[env] || {};
  let config = deepMerge(defaultConfig, environmentConfig);

  if (process.env.BASE_URL) {
    config.baseUrl = process.env.BASE_URL;
  }

  if (process.env.API_URL) {
    config.apiUrl = process.env.API_URL;
  }

  if (process.env.AUTH_TOKEN) {
    config.authToken = process.env.AUTH_TOKEN;
  }

  if (process.env.DEFAULT_TIMEOUT) {
    config.timeouts.defaultTimeout = parseInt(process.env.DEFAULT_TIMEOUT, 10);
  }

  if (process.env.USE_REAL_API) {
    config.testData.useRealApi = process.env.USE_REAL_API === 'true';
  }

  return config;
}

export const config = getConfig();
