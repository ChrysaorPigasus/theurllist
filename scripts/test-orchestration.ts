import { execSync } from 'child_process';
import dotenvFlow from 'dotenv-flow';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenvFlow.config({
  path: path.resolve(process.cwd()),
  node_env: process.env.TEST_ENV || 'local'
});

// Test types configuration
const TEST_TYPES = {
  unit: {
    command: 'npm run test:unit',
    turboCommand: 'npm run test:turbo:unit',
    parallelCommand: 'run-s test:unit',
    enabled: true,
    environments: ['local', 'dev', 'tst', 'acc']
  },
  api: {
    command: 'npm run test:api',
    turboCommand: 'npm run test:turbo:api',
    parallelCommand: 'run-s test:api',
    enabled: true,
    environments: ['local', 'tst']
  },
  e2e: {
    command: 'npm run test:e2e',
    turboCommand: 'npm run test:turbo:e2e',
    parallelCommand: 'run-s test:e2e',
    enabled: true,
    environments: ['local', 'acc']
  },
  bdd: {
    command: 'npm run test:bdd',
    turboCommand: 'npm run test:turbo:bdd',
    parallelCommand: 'run-s test:bdd',
    enabled: true,
    environments: ['local', 'acc']
  }
};

// Get current environment
const currentEnv = process.env.TEST_ENV || 'local';
console.log(`🚀 Running tests in ${currentEnv.toUpperCase()} environment`);

// Parse command line arguments
const args = process.argv.slice(2);
const specificTestTypes = args.filter(arg => Object.keys(TEST_TYPES).includes(arg));
const options = args.filter(arg => arg.startsWith('--'));

// Options
const useTurbo = options.includes('--turbo');
const useParallel = options.includes('--parallel');
const testTypes = specificTestTypes.length > 0 ? specificTestTypes : Object.keys(TEST_TYPES);

// Run tests
if (useParallel && testTypes.length > 1) {
  // Run selected test types in parallel
  const enabledTests = testTypes
    .filter(type => {
      const config = TEST_TYPES[type];
      return config.enabled && config.environments.includes(currentEnv);
    })
    .map(type => `test:${type}`)
    .join(' ');

  if (enabledTests) {
    console.log(`▶️ Running tests in parallel: ${enabledTests}`);
    try {
      execSync(`npm-run-all --parallel ${enabledTests}`, { stdio: 'inherit' });
      console.log('✅ All parallel tests completed successfully');
    } catch (error) {
      console.error('❌ Some tests failed in parallel execution');
      process.exit(1);
    }
  } else {
    console.log('⏭️ No tests to run for this environment');
  }
} else {
  // Run tests sequentially
  let hasFailures = false;
  
  for (const testType of testTypes) {
    const testConfig = TEST_TYPES[testType];
    
    if (!testConfig) {
      console.error(`❌ Unknown test type: ${testType}`);
      continue;
    }
    
    if (!testConfig.enabled || !testConfig.environments.includes(currentEnv)) {
      console.log(`⏭️ Skipping ${testType} tests in ${currentEnv} environment`);
      continue;
    }
    
    console.log(`▶️ Running ${testType} tests...`);
    
    try {
      // Choose command based on options
      const command = useTurbo ? testConfig.turboCommand : testConfig.command;
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ ${testType} tests passed`);
    } catch (error) {
      console.error(`❌ ${testType} tests failed`);
      hasFailures = true;
      
      if (process.env.FAIL_FAST === 'true') {
        process.exit(1);
      }
    }
  }
  
  process.exit(hasFailures ? 1 : 0);
}