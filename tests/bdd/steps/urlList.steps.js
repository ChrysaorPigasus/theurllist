import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ListManagementPage } from '../pages/ListManagementPage';
import { UrlListPage } from '../pages/UrlListPage';

let urlListPage;

// Add hook to verify no console errors after each step
After(async function({ result, pickle }) {
  if (urlListPage) {
    // Check for console errors that happened during the step
    const errors = urlListPage.checkForNewErrors();
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

Given('I am on the URL list page for {string}', async function (listId) {
  urlListPage = new UrlListPage(this.page);
  
  // Use performAction to track errors during navigation
  await urlListPage.performAction(
    async () => {
      await this.page.goto(`/list/${listId}`);
      await this.page.waitForLoadState('networkidle');
    },
    `navigating to list ${listId}`
  );
});

When('I delete the URL {string}', async function (url) {
  await urlListPage.performAction(
    async () => {
      await urlListPage.clickDeleteButtonForUrl(url);
      await urlListPage.confirmDeletion();
    },
    `deleting URL: ${url}`
  );
});

When('I click delete for the URL {string} but cancel', async function (url) {
  await urlListPage.performAction(
    async () => {
      await urlListPage.clickDeleteButtonForUrl(url);
      await urlListPage.cancelDeletion();
    },
    `canceling deletion of URL: ${url}`
  );
});

When('I edit the URL {string} to {string}', async function (oldUrl, newUrl) {
  await urlListPage.performAction(
    async () => {
      await urlListPage.clickEditButtonForUrl(oldUrl);
      await urlListPage.editUrl(newUrl);
      await urlListPage.clickSaveButton();
    },
    `editing URL from ${oldUrl} to ${newUrl}`
  );
});

When('I edit the title of URL {string} to {string}', async function (url, newTitle) {
  await urlListPage.performAction(
    async () => {
      await urlListPage.clickEditButtonForUrl(url);
      await urlListPage.editTitle(newTitle);
      await urlListPage.clickSaveButton();
    },
    `editing title of URL ${url} to "${newTitle}"`
  );
});

When('I edit the description of URL {string} to {string}', async function (url, newDescription) {
  await urlListPage.performAction(
    async () => {
      await urlListPage.clickEditButtonForUrl(url);
      await urlListPage.editDescription(newDescription);
      await urlListPage.clickSaveButton();
    },
    `editing description of URL ${url} to "${newDescription}"`
  );
});

When('I search for {string} in the list', async function (searchTerm) {
  await urlListPage.performAction(
    async () => {
      await urlListPage.searchUrlsInList(searchTerm);
      await urlListPage.waitForListUpdate();
    },
    `searching for "${searchTerm}" in list`
  );
});

When('I sort the list by {string}', async function (sortColumn) {
  await urlListPage.performAction(
    async () => {
      await urlListPage.clickSortHeader(sortColumn);
      await urlListPage.waitForListUpdate();
    },
    `sorting list by ${sortColumn}`
  );
});

Then('I should see the URL {string} in the list', async function (url) {
  await urlListPage.performAction(
    async () => {
      const urlItem = urlListPage.getUrlItem(url);
      await expect(urlItem).toBeVisible();
    },
    `verifying URL ${url} is visible`
  );
});

Then('I should not see the URL {string} in the list', async function (url) {
  await urlListPage.performAction(
    async () => {
      const urlItem = urlListPage.getUrlItem(url);
      await expect(urlItem).toBeHidden();
    },
    `verifying URL ${url} is not visible`
  );
});

Then('I should see a success message for URL deletion', async function () {
  await urlListPage.performAction(
    async () => {
      const successMessage = urlListPage.getDeletionSuccessMessage();
      await expect(successMessage).toBeVisible();
    },
    'verifying deletion success message'
  );
});

Then('I should see a success message for URL update', async function () {
  await urlListPage.performAction(
    async () => {
      const successMessage = urlListPage.getUpdateSuccessMessage();
      await expect(successMessage).toBeVisible();
    },
    'verifying update success message'
  );
});

Then('I should see {int} URLs in the list', async function (count) {
  await urlListPage.performAction(
    async () => {
      const urlCount = await urlListPage.getUrlCount();
      expect(urlCount).toBe(count);
    },
    `verifying list contains ${count} URLs`
  );
});

Then('the URLs should be sorted alphabetically', async function () {
  await urlListPage.performAction(
    async () => {
      const sorted = await urlListPage.areUrlsSortedAlphabetically();
      expect(sorted).toBe(true);
    },
    'verifying URLs are sorted alphabetically'
  );
});

Then('the URLs should be sorted in reverse alphabetical order', async function () {
  await urlListPage.performAction(
    async () => {
      const sorted = await urlListPage.areUrlsSortedReverseAlphabetically();
      expect(sorted).toBe(true);
    },
    'verifying URLs are sorted in reverse alphabetical order'
  );
});

Then('each URL should display its address and title', async function () {
  await urlListPage.performAction(
    async () => {
      const result = await urlListPage.verifyUrlsHaveAddressAndTitle();
      expect(result).toBe(true);
    },
    'verifying each URL displays address and title'
  );
});