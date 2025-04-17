import dotenvFlow from "dotenv-flow";
import path from "path";

// Load environment variables based on NODE_ENV
dotenvFlow.config({
  path: path.resolve(process.cwd()),
  node_env: process.env.TEST_ENV || 'local'
});

// Environment settings
const ENV = process.env.TEST_ENV || 'local';
const testTypes = (process.env.TEST_TYPES || '').split(',').map(type => type.trim());
const FORCE_MOCKS = process.env.FORCE_MOCKS === 'true';
const FORCE_INTEGRATIONS = process.env.FORCE_INTEGRATIONS === 'true';

// Define integration levels for different environments
// Each service can be: 'mock', 'integration', or 'auto' (based on environment)
export interface IntegrationConfig {
  database: 'mock' | 'integration' | 'auto';
  api: 'mock' | 'integration' | 'auto';
  auth: 'mock' | 'integration' | 'auto';
  externalServices: 'mock' | 'integration' | 'auto';
}

// Default configurations for each environment
const environmentConfigs: Record<string, IntegrationConfig> = {
  // Development: Mock everything
  dev: {
    database: 'mock',
    api: 'mock',
    auth: 'mock', 
    externalServices: 'mock',
  },
  
  // Test: Mix of mocks and integrations
  tst: {
    database: 'integration',
    api: 'integration',
    auth: 'mock',
    externalServices: 'mock',
  },
  
  // Acceptance: Fully integrated
  acc: {
    database: 'integration',
    api: 'integration',
    auth: 'integration',
    externalServices: 'integration',
  },
  
  // Local: Default to development-like but overridable
  local: {
    database: 'auto',
    api: 'auto',
    auth: 'auto',
    externalServices: 'auto',
  },
};

// Resolve 'auto' settings based on environment
function resolveIntegrationMode(service: 'mock' | 'integration' | 'auto'): 'mock' | 'integration' {
  // Force overrides
  if (FORCE_MOCKS) return 'mock';
  if (FORCE_INTEGRATIONS) return 'integration';
  
  // If not auto, use the specified value
  if (service !== 'auto') return service;
  
  // Auto defaults based on environment
  switch (ENV) {
    case 'dev': return 'mock';
    case 'tst': 
      // In test, database and API are integrated, rest is mocked
      return service === 'database' || service === 'api' ? 'integration' : 'mock';
    case 'acc': return 'integration';
    default: return 'mock'; // Default to mocks for safety
  }
}

// Resolve the current integration configuration
export const integrations: Record<keyof IntegrationConfig, 'mock' | 'integration'> = {
  database: resolveIntegrationMode(environmentConfigs[ENV]?.database || 'auto'),
  api: resolveIntegrationMode(environmentConfigs[ENV]?.api || 'auto'),
  auth: resolveIntegrationMode(environmentConfigs[ENV]?.auth || 'auto'),
  externalServices: resolveIntegrationMode(environmentConfigs[ENV]?.externalServices || 'auto'),
};

// Main environment configuration
interface EnvironmentConfig {
  baseUrl: string;
  apiVersion: string;
  isTestTypeEnabled: (testType: string) => boolean;
  currentEnv: string;
  integrations: Record<keyof IntegrationConfig, 'mock' | 'integration'>;
  shouldMock: (service: keyof IntegrationConfig) => boolean;
}

export const env: EnvironmentConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiVersion: process.env.API_VERSION || 'v1',
  isTestTypeEnabled: (testType: string): boolean => {
    return testTypes.includes(testType);
  },
  currentEnv: ENV,
  integrations,
  shouldMock: (service: keyof IntegrationConfig): boolean => {
    return integrations[service] === 'mock';
  }
};

// Helper functions
export function skipTestInEnvironment(env: string, testType: string): boolean {
  if (process.env.TEST_ENV !== env) return false;
  return !testTypes.includes(testType);
}

export function runTestInEnvironment(env: string): boolean {
  return process.env.TEST_ENV === env;
}

// New helper to check if a specific service should be mocked
export function shouldMock(service: keyof IntegrationConfig): boolean {
  return env.shouldMock(service);
}

// Helper for logging current integration configuration
export function logIntegrationConfig(): void {
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
}