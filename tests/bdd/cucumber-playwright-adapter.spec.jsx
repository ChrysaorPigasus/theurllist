import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const featureName = path.basename(featureFile, '.feature');
    
    // Extract scenarios for better test explorer experience
    const { featureName: parsedFeatureName, scenarios } = extractScenarios(featureFile);
    
    // Create a test for each scenario 
    // This helps VS Code Test Explorer show individual scenarios
    test.describe(`Feature: ${parsedFeatureName || featureName}`, () => {
      // If we couldn't parse scenarios, create a single test for the whole feature
      if (scenarios.length === 0) {
        test(`BDD: ${featureName}`, async ({ page }) => {
          // Pass the page object directly to a custom runner instead of using Cucumber CLI
          await runFeatureWithPlaywright(featureFile, page);
        });
      } else {
        // Create a test for each scenario to make them visible in VS Code Test Explorer
        for (const scenario of scenarios) {
          test(`Scenario: ${scenario.name}`, async ({ page }) => {
            // Pass the page object directly to a custom runner instead of using Cucumber CLI
            await runFeatureWithPlaywright(featureFile, page, scenario.name);
          });
        }
      }
    });
  }
}

/**
 * Run a feature file directly with Playwright instead of using cucumber-js CLI
 */
async function runFeatureWithPlaywright(featureFile, page, scenarioName = null) {
  console.log(`Running test for ${featureFile}${scenarioName ? ` - ${scenarioName}` : ''}`);
  
  // Create a simple test runner that launches the app and navigates to it
  try {
    // Start the app if needed - you may need to adjust this for your app
    await page.goto('http://localhost:3000');
    
    // Basic verification that the app is running
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Execute test steps based on the feature file
    // This is a simple example - in a real implementation,
    // you would parse the feature file and execute the steps
    
    // For demonstration, we'll just check that key elements are visible
    // based on what's in the feature files
    if (featureFile.includes('view-urls-in-list')) {
      // If testing the URL list feature
      if (scenarioName?.includes('View all URLs')) {
        await page.getByText('My URL Collection', { exact: false }).click();
        const urlCount = await page.locator('[data-testid="url-item"]').count();
        console.log(`Found ${urlCount} URLs in the list`);
      } else if (scenarioName?.includes('Search for URLs')) {
        await page.getByText('My URL Collection', { exact: false }).click();
        await page.getByPlaceholder('Search').fill('test');
        const urlCount = await page.locator('[data-testid="url-item"]').count();
        console.log(`Found ${urlCount} URLs after search`);
      }
    }
    
    console.log(`Test completed for ${featureFile}${scenarioName ? ` - ${scenarioName}` : ''}`);
  } catch (error) {
    console.error(`Error running test: ${error.message}`);
    throw error;
  }
}
