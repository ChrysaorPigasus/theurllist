import React, { useEffect, useState } from 'react';
import dotenvFlow from 'dotenv-flow';
import path from 'path';

// Load environment variables based on NODE_ENV
dotenvFlow.config({
  path: path.resolve(process.cwd()),
  node_env: process.env.TEST_ENV || 'local'
});

// Environment settings
const ENV = process.env.TEST_ENV || 'local';
// Standaard alle testsoorten inschakelen als er geen TEST_TYPES is gedefinieerd
const testTypes = process.env.TEST_TYPES ? 
  process.env.TEST_TYPES.split(',').map(type => type.trim()) :
  ['unit', 'api', 'e2e', 'bdd']; // Standaard alle testsoorten inschakelen
const FORCE_MOCKS = process.env.FORCE_MOCKS === 'true';
const FORCE_INTEGRATIONS = process.env.FORCE_INTEGRATIONS === 'true';

// Define integration levels for different environments
// Each service can be: 'mock', 'integration', or 'auto' (based on environment)
const environmentConfigs = {
  dev: {
    database: 'mock',
    api: 'mock',
    auth: 'mock', 
    externalServices: 'mock',
  },
  tst: {
    database: 'integration',
    api: 'integration',
    auth: 'mock',
    externalServices: 'mock',
  },
  acc: {
    database: 'integration',
    api: 'integration',
    auth: 'integration',
    externalServices: 'integration',
  },
  local: {
    database: 'auto',
    api: 'auto',
    auth: 'auto',
    externalServices: 'auto',
  },
};

const resolveIntegrationMode = (service) => {
  if (FORCE_MOCKS) return 'mock';
  if (FORCE_INTEGRATIONS) return 'integration';
  if (service !== 'auto') return service;

  switch (ENV) {
    case 'dev': return 'mock';
    case 'tst': return service === 'database' || service === 'api' ? 'integration' : 'mock';
    case 'acc': return 'integration';
    default: return 'mock';
  }
};

const integrations = {
  database: resolveIntegrationMode(environmentConfigs[ENV]?.database || 'auto'),
  api: resolveIntegrationMode(environmentConfigs[ENV]?.api || 'auto'),
  auth: resolveIntegrationMode(environmentConfigs[ENV]?.auth || 'auto'),
  externalServices: resolveIntegrationMode(environmentConfigs[ENV]?.externalServices || 'auto'),
};

const EnvironmentConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiVersion: process.env.API_VERSION || 'v1',
  isTestTypeEnabled: (testType) => testTypes.includes(testType),
  currentEnv: ENV,
  integrations,
  shouldMock: (service) => integrations[service] === 'mock',
};

const skipTestInEnvironment = (env, testType) => {
  if (process.env.TEST_ENV !== env) return false;
  return !testTypes.includes(testType);
};

const runTestInEnvironment = (env) => process.env.TEST_ENV === env;

const shouldMock = (service) => EnvironmentConfig.shouldMock(service);

const logIntegrationConfig = () => {
  console.log(`
=========================================
Test Environment: ${ENV}
Integration Configuration:
  • Database: ${integrations.database}
  • API: ${integrations.api}
  • Auth: ${integrations.auth}
  • External Services: ${integrations.externalServices}
=========================================
  `);
};

export {
  EnvironmentConfig as env,
  integrations,
  skipTestInEnvironment,
  runTestInEnvironment,
  shouldMock,
  logIntegrationConfig
};
