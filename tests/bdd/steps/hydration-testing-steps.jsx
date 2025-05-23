import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import * as commonSteps from '@tests/bdd/steps/common-steps';
import { injectHydrationTracker, checkForHydrationErrors, clearHydrationErrors } from '@tests/utils/hydration-tracker';

/**
 * Steps for hydration error detection and testing
 * These steps can be used in any feature file to verify hydration integrity
 */

export const givenHydrationTrackingIsEnabled = async function() {
  // Get the page from the world object
  const page = this.page;
  if (!page) {
    throw new Error('Page object not found in world');
  }
  
  // Inject the hydration tracker into the page
  await injectHydrationTracker(page);
  
  // Clear any existing hydration errors
  await clearHydrationErrors(page);
  
  // Store in world for later checks
  this.hydrationTrackingEnabled = true;
};

export const whenIPerformAction = async function(action) {
  // Ensure tracking is enabled
  if (!this.hydrationTrackingEnabled) {
    await givenHydrationTrackingIsEnabled.call(this);
  }
  
  // Clear existing errors before the action
  await clearHydrationErrors(this.page);
  
  // Record the action for error reporting
  this.lastAction = action;
};

export const thenNoHydrationErrorsOccur = async function() {
  const page = this.page;
  if (!page) {
    throw new Error('Page object not found in world');
  }
  
  // Check for hydration errors
  const errors = await checkForHydrationErrors(page);
  
  // If there are errors, format them for better readability
  if (errors.length > 0) {
    const errorMessages = errors.map(err => 
      `- Component: ${err.component}, URL: ${err.url}\n  Message: ${err.message.split('\n')[0]}`
    ).join('\n');
    
    const actionContext = this.lastAction ? `after "${this.lastAction}"` : 'during test';
    
    throw new Error(
      `Hydration errors detected ${actionContext}:\n${errorMessages}\n` +
      `This indicates a mismatch between server and client rendering.`
    );
  }
};

export const thenIVerifyNoHydrationErrorsOccurDuring = async function(actionDescription, actionFn) {
  // Make sure tracking is enabled
  if (!this.hydrationTrackingEnabled) {
    await givenHydrationTrackingIsEnabled.call(this);
  }
  
  // Clear any existing errors before the action
  await clearHydrationErrors(this.page);
  
  // Perform the action
  await actionFn();
  
  // Check for hydration errors
  await thenNoHydrationErrorsOccur.call(this);
};

// Register the steps with cucumber
export function registerHydrationTestingSteps({ given, when, then }) {
  given('hydration tracking is enabled', givenHydrationTrackingIsEnabled);
  when('I perform {string}', whenIPerformAction);
  then('no hydration errors occur', thenNoHydrationErrorsOccur);
}

// Export for direct use in tests
export default registerHydrationTestingSteps;
