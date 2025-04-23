/**
 * Cucumber hooks for console error tracking and reporting
 * 
 * This file contains hooks that handle console error tracking
 * across all scenarios, regardless of the specific page objects used.
 */

import { Before, After, BeforeAll, AfterAll, Status, AfterStep } from '@cucumber/cucumber';
import { injectHydrationTracker, checkForHydrationErrors, clearHydrationErrors } from '../../utils/hydration-tracker';

// Store error logs for the entire test run
const errorLogs = [];
// Store hydration errors separately
const hydrationErrorLogs = [];

// Before each scenario, initialize tracking
Before(async function() {
  // Initialize console logs collection in the world object
  this.consoleLogs = [];
  this.hydrationErrors = [];
  
  // Inject hydration error tracking into the page if available
  if (this.page) {
    await injectHydrationTracker(this.page);
    await clearHydrationErrors(this.page);
  }
});

// After each step, check for hydration errors
AfterStep(async function({ pickleStep }) {
  if (!this.page) return;
  
  try {
    // Check for hydration errors
    const errors = await checkForHydrationErrors(this.page);
    if (errors.length > 0) {
      // Create a formatted error log
      const stepHydrationErrors = {
        step: pickleStep.text,
        errors: errors.map(err => ({
          component: err.component || 'Unknown',
          message: err.message.split('\n')[0],
          url: err.url
        }))
      };
      
      // Add to the current scenario's hydration errors
      this.hydrationErrors.push(stepHydrationErrors);
      
      // Log immediately for visibility
      console.error(`⚠️ HYDRATION ERROR in step "${pickleStep.text}":`);
      stepHydrationErrors.errors.forEach(err => {
        console.error(`   - ${err.component}: ${err.message}`);
      });
      
      // Clear the errors so we don't count them twice
      await clearHydrationErrors(this.page);
    }
  } catch (error) {
    console.error(`Error checking for hydration issues: ${error.message}`);
  }
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
    
    // Add warning to scenario output
    console.warn(`⚠️ Scenario "${pickle.name}" had console errors in ${logs.length} steps`);
  }
  
  // Handle hydration errors
  const hydrationErrors = this.hydrationErrors || [];
  if (hydrationErrors.length > 0) {
    // Store hydration errors in the global log
    hydrationErrorLogs.push({
      scenario: pickle.name,
      steps: hydrationErrors
    });
    
    // ALWAYS fail tests with hydration errors
    if (result.status === Status.PASSED) {
      result.status = Status.FAILED;
      result.message = `Scenario failed due to ${hydrationErrors.length} hydration errors. See logs for details.`;
    }
    
    console.error(`⚠️ Scenario "${pickle.name}" had hydration errors in ${hydrationErrors.length} steps`);
  }
});

// After all scenarios complete, output a summary of errors
AfterAll(async function() {
  // Output console errors summary
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
  
  // Output hydration errors summary
  if (hydrationErrorLogs.length > 0) {
    console.error('\n========== HYDRATION ERROR SUMMARY ==========');
    console.error(`Found hydration errors in ${hydrationErrorLogs.length} scenarios:`);
    
    hydrationErrorLogs.forEach((scenarioErrors, index) => {
      console.error(`\n${index + 1}. Scenario: ${scenarioErrors.scenario}`);
      scenarioErrors.steps.forEach(stepErrors => {
        console.error(`   - Step: ${stepErrors.step}`);
        stepErrors.errors.forEach(error => {
          console.error(`     * ${error.component}: ${error.message}`);
        });
      });
    });
    
    console.error('\n=============================================');
    
    // Exit with a non-zero code to ensure CI pipelines fail
    if (process.exitCode === 0) {
      process.exitCode = 1;
    }
  } else {
    console.log('\n✅ No hydration errors detected in any scenarios');
  }
});