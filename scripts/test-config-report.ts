import dotenvFlow from 'dotenv-flow';
import path from 'path';
import fs from 'fs';
import { env, integrations, logIntegrationConfig } from '../tests/utils/environment';
import chalk from 'chalk';

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

// Display a detailed report of the current test configuration
function reportTestConfiguration() {
  const envName = env.currentEnv.toUpperCase();
  
  console.log(chalk.bold('\n╔════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold(`║ ${chalk.blue('TEST CONFIGURATION REPORT')}                                      ║`));
  console.log(chalk.bold('╠════════════════════════════════════════════════════════════════╣'));
  
  // Environment info
  console.log(chalk.bold(`║ ${chalk.yellow('Environment:')} ${getEnvironmentLabel(envName)}                                    ║`));
  console.log(chalk.bold('╠════════════════════════════════════════════════════════════════╣'));
  
  // Integration status
  console.log(chalk.bold(`║ ${chalk.yellow('Integration Status:')}                                          ║`));
  
  // Database integration
  const dbStatus = integrations.database === 'integration' 
    ? chalk.green('REAL') 
    : chalk.red('MOCK');
  console.log(chalk.bold(`║   Database:           ${dbStatus.padEnd(46, ' ')}║`));
  
  // API integration
  const apiStatus = integrations.api === 'integration' 
    ? chalk.green('REAL') 
    : chalk.red('MOCK');
  console.log(chalk.bold(`║   API Server:         ${apiStatus.padEnd(46, ' ')}║`));
  
  // Auth integration
  const authStatus = integrations.auth === 'integration' 
    ? chalk.green('REAL') 
    : chalk.red('MOCK');
  console.log(chalk.bold(`║   Authentication:     ${authStatus.padEnd(46, ' ')}║`));
  
  // External services integration
  const extStatus = integrations.externalServices === 'integration' 
    ? chalk.green('REAL') 
    : chalk.red('MOCK');
  console.log(chalk.bold(`║   External Services:  ${extStatus.padEnd(46, ' ')}║`));
  
  console.log(chalk.bold('╠════════════════════════════════════════════════════════════════╣'));
  
  // Test types
  const testTypes = (process.env.TEST_TYPES || '').split(',').map(t => t.trim()).filter(Boolean);
  console.log(chalk.bold(`║ ${chalk.yellow('Enabled Test Types:')}                                          ║`));
  
  if (testTypes.length === 0) {
    console.log(chalk.bold(`║   ${chalk.red('No test types specified')}                                    ║`));
  } else {
    testTypes.forEach(type => {
      console.log(chalk.bold(`║   ${chalk.green('✓')} ${type.padEnd(44, ' ')}║`));
    });
  }
  
  console.log(chalk.bold('╠════════════════════════════════════════════════════════════════╣'));
  
  // Connection info
  console.log(chalk.bold(`║ ${chalk.yellow('Connection Info:')}                                             ║`));
  console.log(chalk.bold(`║   Base URL:           ${env.baseUrl.padEnd(40, ' ')}║`));
  console.log(chalk.bold(`║   API Version:        ${env.apiVersion.padEnd(40, ' ')}║`));
  
  console.log(chalk.bold('╚════════════════════════════════════════════════════════════════╝'));
}

// Helper function to get a nicely formatted environment label
function getEnvironmentLabel(env: string): string {
  switch (env.toLowerCase()) {
    case 'dev':
      return chalk.cyan('DEVELOPMENT');
    case 'tst':
      return chalk.blue('TEST       ');
    case 'acc':
      return chalk.magenta('ACCEPTANCE ');
    case 'local':
      return chalk.green('LOCAL      ');
    default:
      return env.padEnd(11, ' ');
  }
}

// Execute the report
reportTestConfiguration();