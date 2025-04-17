import { FullConfig } from '@playwright/test';
import { teardownAll } from '@tests/utils/test-setup';
import { fileURLToPath } from 'url';
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

// Convert exec to promise-based
const exec = promisify(execCallback);

async function globalTeardown(config: FullConfig) {
  console.log('Running global teardown...');
  
  // Use the shared teardown utility to properly shut down all services
  await teardownAll();
  
  console.log('All services shut down successfully');
}

export default globalTeardown;