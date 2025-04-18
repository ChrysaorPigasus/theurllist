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

/**
 * Parse feature file to extract scenario names 
 * This helps with better reporting in VS Code Test Explorer
 */
const extractScenarios = (featureFilePath) => {
  const content = fs.readFileSync(featureFilePath, 'utf-8');
  const scenarios = [];
  const lines = content.split('\n');
  
  // Extract Feature name
  let featureName = '';
  for (const line of lines) {
    if (line.trim().startsWith('Feature:')) {
      featureName = line.trim().substring('Feature:'.length).trim();
      break;
    }
  }
  
  // Extract scenarios
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
      const scenarioName = line.includes(':') ? line.substring(line.indexOf(':') + 1).trim() : '';
      if (scenarioName) {
        scenarios.push({ name: scenarioName, featureName });
      }
    }
  }
  
  return { featureName, scenarios };
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
    
    // Extract scenarios for better test explorer experience
    const { featureName: parsedFeatureName, scenarios } = extractScenarios(featureFile);
    
    // Create a test for each scenario 
    // This helps VS Code Test Explorer show individual scenarios
    test.describe(`Feature: ${parsedFeatureName || featureName}`, () => {
      // If we couldn't parse scenarios, create a single test for the whole feature
      if (scenarios.length === 0) {
        test(`BDD: ${featureName}`, async ({ page }) => {
          await runCucumberTest(featureFile);
        });
      } else {
        // Create a test for each scenario to make them visible in VS Code Test Explorer
        for (const scenario of scenarios) {
          test(`Scenario: ${scenario.name}`, async ({ page }) => {
            await runCucumberTest(featureFile, scenario.name);
          });
        }
      }
    });
  }
}

/**
 * Run cucumber test for a specific feature file and optional scenario
 */
async function runCucumberTest(featureFile, scenarioName = null) {
  console.log(`Running Cucumber tests for: ${featureFile}${scenarioName ? ` - ${scenarioName}` : ''}`);
  try {
    // Build the command with optional scenario name filter
    let command = `npx cross-env TEST_TYPE=bdd cucumber-js "${featureFile}" --require=${stepsDir}/**/*.jsx --require=${supportDir}/**/*.jsx --require=${pagesDir}/**/*.jsx`;
    
    // Add scenario name filter if provided
    if (scenarioName) {
      // Escape special characters in scenario name for the command line
      const escapedScenarioName = scenarioName.replace(/["']/g, match => `\\${match}`);
      command += ` --name "${escapedScenarioName}"`;
    }
    
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
}
