/**
 * Cucumber hooks for console error tracking and reporting
 * 
 * This file contains hooks that handle console error tracking
 * across all scenarios, regardless of the specific page objects used.
 */

import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';

// Store error logs for the entire test run
const errorLogs = [];

// Before each scenario, initialize tracking
Before(async function() {
  // Initialize console logs collection in the world object
  this.consoleLogs = [];
});

// After each scenario, check for any error logs 
After(async function({ result, pickle }) {
  // Get any console errors from the world object
  const logs = this.consoleLogs || [];
  
  if (logs.length > 0) {
    // Store scenario errors in the global error log
    errorLogs.push({
      scenario: pickle.name,
      steps: logs
    });
    
    // If we want to fail tests with console errors, uncomment the following:
    // if (result.status === Status.PASSED) {
    //   result.status = Status.FAILED;
    //   result.message = `Scenario passed but had ${logs.length} console errors. Check logs for details.`;
    // }
    
    // Add warning to scenario output
    console.warn(`⚠️ Scenario "${pickle.name}" had console errors in ${logs.length} steps`);
  }
});

// After all scenarios complete, output a summary of errors
AfterAll(async function() {
  if (errorLogs.length > 0) {
    console.warn('\n========== CONSOLE ERROR SUMMARY ==========');
    console.warn(`Found console errors in ${errorLogs.length} scenarios:`);
    
    errorLogs.forEach((scenarioErrors, index) => {
      console.warn(`\n${index + 1}. Scenario: ${scenarioErrors.scenario}`);
      scenarioErrors.steps.forEach(stepErrors => {
        console.warn(`   - Step: ${stepErrors.step}`);
        stepErrors.errors.forEach(error => {
          console.warn(`     * ${error}`);
        });
      });
    });
    
    console.warn('\n===========================================');
  } else {
    console.log('\n✅ No console errors detected in any scenarios');
  }
});