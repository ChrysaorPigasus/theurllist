import { FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initTestEnvironment } from '@tests/utils/test-setup';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup(config: FullConfig) {
  // Load environment variables based on TEST_ENV
  if (process.env.TEST_ENV) {
    const envFile = `.env.${process.env.TEST_ENV}`;
    console.log(`Loading environment from ${envFile}`);
    dotenv.config({ path: path.resolve(__dirname, `../../../${envFile}`) });
  } else {
    console.log('Loading default environment');
    dotenv.config();
  }
  
  console.log(`Running API tests in ${process.env.TEST_ENV || 'default'} environment`);
  
  // Initialize the test environment with appropriate mocks/integrations
  await initTestEnvironment();
}

export default globalSetup;