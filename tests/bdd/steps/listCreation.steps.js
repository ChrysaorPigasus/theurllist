import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ListManagementPage } from '../pages/ListManagementPage';

let listManagementPage;

// Add hook to verify no console errors after each step
After(async function({ result, pickle }) {
  if (listManagementPage) {
    // Check for console errors that happened during the step
    const errors = listManagementPage.checkForNewErrors();
    if (errors.length > 0) {
      // Report errors in the step output but don't fail the test automatically
      console.warn(`⚠️ Console errors detected during step "${pickle.name}":`);
      errors.forEach(error => console.warn(`  - ${error}`));
      
      // Store errors in the world object for reporting
      this.consoleLogs = this.consoleLogs || [];
      this.consoleLogs.push({
        step: pickle.name,
        errors: errors
      });
    }
  }
});

Given('I am on the list management page', async function () {
  listManagementPage = new ListManagementPage(this.page);
  
  await listManagementPage.performAction(
    async () => {
      await this.page.goto('/lists');
      await this.page.waitForLoadState('networkidle');
    },
    'navigating to list management page'
  );
});

When('I create a new list with name {string}', async function (listName) {
  await listManagementPage.performAction(
    async () => {
      await listManagementPage.createList({ name: listName });
    },
    `creating list with name "${listName}"`
  );
});

When('I create a new list with name {string} and description {string}', async function (listName, description) {
  await listManagementPage.performAction(
    async () => {
      await listManagementPage.createList({ name: listName, description });
    },
    `creating list with name "${listName}" and description`
  );
});

When('I create a new list with name {string}, description {string}, and custom URL {string}', async function (listName, description, customUrl) {
  await listManagementPage.performAction(
    async () => {
      await listManagementPage.createList({ name: listName, description, slug: customUrl });
    },
    `creating list with name "${listName}", description, and custom URL "${customUrl}"`
  );
});

Then('I should see the list {string} in my lists', async function (listName) {
  await listManagementPage.performAction(
    async () => {
      const listElement = listManagementPage.getListByName(listName);
      await expect(listElement).toBeVisible();
    },
    `verifying list "${listName}" is visible`
  );
});

Then('I should see a success message for list creation', async function () {
  await listManagementPage.performAction(
    async () => {
      const successMessage = listManagementPage.getSuccessMessage();
      await expect(successMessage).toBeVisible();
    },
    'verifying list creation success message'
  );
});