import dotenvFlow from 'dotenv-flow';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenvFlow.config({
  path: path.resolve(process.cwd()),
  node_env: process.env.TEST_ENV || 'local'
});

// Test types and environments
const testTypes = ['unit', 'api', 'e2e', 'bdd'];
const environments = ['local', 'dev', 'tst', 'acc'];

// Configuration mapping (from your orchestration script)
const TEST_TYPES = {
  unit: {
    command: 'npm run test:unit',
    enabled: true,
    environments: ['local', 'dev', 'tst', 'acc']
  },
  api: {
    command: 'npm run test:api',
    enabled: true,
    environments: ['local', 'tst']
  },
  e2e: {
    command: 'npm run test:e2e',
    enabled: true,
    environments: ['local', 'acc']
  },
  bdd: {
    command: 'npm run test:bdd',
    enabled: true,
    environments: ['local', 'acc']
  }
};

// Generate report
console.log('Test Configuration Report');
console.log('========================\n');

console.log('Test Type Matrix:');
console.log('--------------');
console.log('Environment | Unit | API  | E2E  | BDD  |');
console.log('------------|------|------|------|------|');

environments.forEach(env => {
  const line = testTypes.map(type => {
    return TEST_TYPES[type].environments.includes(env) ? ' ✅  ' : ' ❌  ';
  });
  console.log(`${env.padEnd(12)}|${line.join('|')}|`);
});

console.log('\nCurrent Environment:');
console.log('-------------------');
console.log(`Running in: ${process.env.TEST_ENV || 'local'}`);
console.log('Enabled test types:');
testTypes.forEach(type => {
  const enabled = TEST_TYPES[type].environments.includes(process.env.TEST_ENV || 'local');
  console.log(`- ${type}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
});