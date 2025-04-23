// Page Navigation Steps Definition
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { setupWorld, 
         onHomePage,
         clickOn,
         enterAs,
         clickButton,
         shouldSee } from './common-steps.jsx';

// Import page objects
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';

// Setup shared test context
const testContext = setupWorld();
let lastAddedUrl = 'https://example.com';
let createdListNames = [];

// Background: I am on the home page
Given('I am on the home page', onHomePage);

// When I navigate back to the home page
When('I navigate back to the home page', async () => {
  await testContext.homePage.navigateToHomePage();
  await testContext.page.waitForLoadState('networkidle');
  
  // Verify no hydration errors occurred during navigation
  await testContext.homePage.verifyNoHydrationErrors('navigation to home page');
  
  // Check that we're actually on the home page
  await expect(testContext.page).toHaveURL(/.*\/$/);
});

// Then I should see the home page without errors
Then('I should see the home page without errors', async () => {
  await testContext.page.waitForSelector('[data-testid="home-page"]', { timeout: 5000 });
  
  // Verify no error messages are visible
  const errorMessages = await testContext.page.locator('.text-red-800, .text-red-600').count();
  expect(errorMessages).toBe(0);
  
  // Check for console errors
  const consoleErrors = testContext.homePage.checkForNewErrors();
  expect(consoleErrors.length).toBe(0);
  
  // Check for React hydration errors
  const hydrationErrors = await testContext.homePage.checkForHydrationErrors();
  expect(hydrationErrors.length).toBe(0);
});

// When I add a URL to the list
When('I add a URL to the list', async () => {
  // Focus on URL input field
  const urlInput = testContext.page.locator('input[name="url"], input[placeholder*="https://"]').first();
  await urlInput.click();
  
  // Type in a URL
  lastAddedUrl = `https://example.com/test-${Date.now()}`;
  await urlInput.fill(lastAddedUrl);
  
  // Click Add button
  await testContext.page.locator('button:has-text("Add"), button:has-text("Add URL")').first().click();
  
  // Wait for the URL to be added
  await testContext.page.waitForSelector(`text=${lastAddedUrl}`);
});

// When I return to the "[list name]" list
When('I return to the {string} list', async (listName) => {
  // Save list name for later verification
  if (!createdListNames.includes(listName)) {
    createdListNames.push(listName);
  }
  
  await testContext.listsPage.navigateToListsPage();
  await testContext.page.waitForLoadState('networkidle');
  
  // Find and click on the list with the given name
  const listLink = testContext.page.locator(`a:has-text("${listName}"), tr:has-text("${listName}") button:has-text("View")`).first();
  await listLink.click();
  
  // Wait for list page to load
  await testContext.page.waitForSelector(`h1:has-text("${listName}"), h2:has-text("${listName}")`);
  await testContext.page.waitForLoadState('networkidle');
  
  // Verify no hydration errors occurred during list navigation
  await testContext.listEditorPage.verifyNoHydrationErrors(`navigation to list "${listName}"`);
});

// Then I should see the previously added URL
Then('I should see the previously added URL', async () => {
  await testContext.page.waitForSelector(`text=${lastAddedUrl}`);
});

// When I click the browser back button
When('I click the browser back button', async () => {
  await testContext.page.goBack();
  await testContext.page.waitForLoadState('networkidle');
  
  // Check for hydration errors after browser navigation
  await testContext.page.evaluate(() => {
    // Allow time for any hydration errors to be logged
    return new Promise(resolve => setTimeout(resolve, 500));
  });
  
  const hydrationErrors = await testContext.page.evaluate(() => {
    return window.hydrationErrors || [];
  });
  
  if (hydrationErrors.length > 0) {
    console.warn('Hydration errors detected during browser back navigation:', hydrationErrors);
  }
});

// When I click the browser forward button
When('I click the browser forward button', async () => {
  await testContext.page.goForward();
  await testContext.page.waitForLoadState('networkidle');
  
  // Allow time for any hydration errors to be logged
  await testContext.page.evaluate(() => {
    return new Promise(resolve => setTimeout(resolve, 500));
  });
});

// Then I should see the "[list name]" list without errors
Then('I should see the {string} list without errors', async (listName) => {
  // Check if we're on the list page
  await testContext.page.waitForSelector(`h1:has-text("${listName}"), h2:has-text("${listName}")`, { timeout: 5000 });
  
  // Verify no error messages are visible
  const errorMessages = await testContext.page.locator('.text-red-800, .text-red-600').count();
  expect(errorMessages).toBe(0);
  
  // Check for React hydration errors
  const hydrationErrors = await testContext.listEditorPage.checkForHydrationErrors();
  expect(hydrationErrors.length).toBe(0);
});

// Reuse existing steps
When('I click on {string}', clickOn);
When('I enter {string} as the list name', enterAs);
When('I click the {string} button', clickButton);
Then('I should see a new empty list with the name {string}', shouldSee);