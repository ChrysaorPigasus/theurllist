import dotenvFlow from "dotenv-flow";
import path from "path";

// Load environment variables based on NODE_ENV
dotenvFlow.config({
  path: path.resolve(process.cwd()),
  node_env: process.env.TEST_ENV || 'local'
});

interface EnvironmentConfig {
  baseUrl: string;
  apiVersion: string;
  isTestTypeEnabled: (testType: string) => boolean;
  currentEnv: string;
}

const testTypes = (process.env.TEST_TYPES || '').split(',').map(type => type.trim());

export const env: EnvironmentConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiVersion: process.env.API_VERSION || 'v1',
  isTestTypeEnabled: (testType: string): boolean => {
    return testTypes.includes(testType);
  },
  currentEnv: process.env.TEST_ENV || 'local'
};

// Helper functions
export function skipTestInEnvironment(env: string, testType: string): boolean {
  if (process.env.TEST_ENV !== env) return false;
  return !testTypes.includes(testType);
}

export function runTestInEnvironment(env: string): boolean {
  return process.env.TEST_ENV === env;
}