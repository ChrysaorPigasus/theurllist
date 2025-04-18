import { test } from '@playwright/test';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find all feature files in a directory recursively
 */
const findFeatureFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFeatureFiles(filePath));
    } else if (path.extname(filePath) === '.feature') {
      results.push(filePath);
    }
  });
  
  return results;
};

const featuresDir = path.join(__dirname, 'features');
const stepsDir = path.join(__dirname, 'steps');
const supportDir = path.join(__dirname, 'support');
const pagesDir = path.join(__dirname, 'pages');

// Ensure feature files were found
const featureFiles = findFeatureFiles(featuresDir);

if (featureFiles.length === 0) {
  test('No feature files found', async () => {
    console.log('No feature files found in', featuresDir);
    test.fail();
  });
} else {
  console.log(`Found ${featureFiles.length} feature files`);
  
  // Dynamically create a test for each feature file
  for (const featureFile of featureFiles) {
    const relativePath = path.relative(__dirname, featureFile);
    const featureName = path.basename(featureFile, '.feature');
    
    test(`BDD: ${featureName}`, async ({ page }) => {
      console.log(`Running Cucumber tests for: ${relativePath}`);
      try {
        // Call cucumber-js directly with explicit paths
        const command = `npx cross-env TEST_TYPE=bdd cucumber-js "${featureFile}" --require=${stepsDir}/**/*.jsx --require=${supportDir}/**/*.jsx --require=${pagesDir}/**/*.jsx`;
        console.log(`Executing: ${command}`);
        const { stdout, stderr } = await execAsync(command);
        console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error) {
        console.error(`Error running Cucumber tests: ${error.message}`);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
        throw error;
      }
    });
  }
}
