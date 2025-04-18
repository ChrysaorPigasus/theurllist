import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world';
import * as commonSteps from './common-steps';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';
import { UrlListPage } from '@tests/bdd/pages/UrlListPage.jsx';

/**
 * Steps for editing URLs in a list (FR004)
 */

const feature = loadFeature('@tests/bdd/features/edit-urls-in-list.feature');

defineFeature(feature, (test) => {
  let world;
  let homePage;
  let listsPage;
  let listEditorPage;
  let urlListPage;

  beforeEach(() => {
    world = commonSteps.setupWorld();
    homePage = new HomePage(world.page);
    listsPage = new ListsPage(world.page);
    listEditorPage = new ListEditorPage(world.page);
    urlListPage = new UrlListPage(world.page);
  });

  afterEach(async () => {
    await commonSteps.cleanupWorld();
  });

  test('Edit a URL\'s address', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have added the following URLs to the list:', async (dataTable) => {
      const rows = dataTable.hashes();
      
      for (const row of rows) {
        await listEditorPage.addUrl(row.URL, row.Title, row.Description);
      }
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I click the "Edit" button for "https://example.com"', async () => {
      await urlListPage.clickEditButtonForUrl('https://example.com');
    });

    and('I change the URL to "https://updated-example.com"', async () => {
      await urlListPage.editUrl('https://updated-example.com');
    });

    and('I click the "Save" button', async () => {
      await urlListPage.clickSaveButton();
    });

    then('I should see "https://updated-example.com" in the URL list', async () => {
      await expect(urlListPage.getUrlItem('https://updated-example.com')).toBeVisible();
    });

    and('I should see a success message', async () => {
      await expect(urlListPage.getUpdateSuccessMessage()).toBeVisible();
    });
  });

  test('Edit a URL\'s title and description', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have added the following URLs to the list:', async (dataTable) => {
      const rows = dataTable.hashes();
      
      for (const row of rows) {
        await listEditorPage.addUrl(row.URL, row.Title, row.Description);
      }
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I click the "Edit" button for "https://test.org"', async () => {
      await urlListPage.clickEditButtonForUrl('https://test.org');
    });

    and('I change the title to "Updated Test Site"', async () => {
      await urlListPage.editTitle('Updated Test Site');
    });

    and('I change the description to "An updated testing website"', async () => {
      await urlListPage.editDescription('An updated testing website');
    });

    and('I click the "Save" button', async () => {
      await urlListPage.clickSaveButton();
    });

    then('I should see the URL with title "Updated Test Site"', async () => {
      await expect(urlListPage.getUrlItemTitle('Updated Test Site')).toBeVisible();
    });

    and('I should see the URL with description "An updated testing website"', async () => {
      await expect(urlListPage.getUrlItemDescription('An updated testing website')).toBeVisible();
    });

    and('I should see a success message', async () => {
      await expect(urlListPage.getUpdateSuccessMessage()).toBeVisible();
    });
  });

  test('Try to save a URL with empty address', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have added the following URLs to the list:', async (dataTable) => {
      const rows = dataTable.hashes();
      
      for (const row of rows) {
        await listEditorPage.addUrl(row.URL, row.Title, row.Description);
      }
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I click the "Edit" button for "https://example.com"', async () => {
      await urlListPage.clickEditButtonForUrl('https://example.com');
    });

    and('I clear the URL field', async () => {
      await urlListPage.clearUrlField();
    });

    and('I click the "Save" button', async () => {
      await urlListPage.clickSaveButton();
    });

    then('I should see an error message indicating that URL cannot be empty', async () => {
      await expect(urlListPage.getErrorMessage()).toBeVisible();
    });

    and('the URL should not be updated', async () => {
      // Cancel the edit to return to the list view
      await urlListPage.clickCancelButton();
      
      // Verify the original URL is still there
      await expect(urlListPage.getUrlItem('https://example.com')).toBeVisible();
    });
  });

  test('Cancel editing a URL', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have added the following URLs to the list:', async (dataTable) => {
      const rows = dataTable.hashes();
      
      for (const row of rows) {
        await listEditorPage.addUrl(row.URL, row.Title, row.Description);
      }
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I click the "Edit" button for "https://example.com"', async () => {
      await urlListPage.clickEditButtonForUrl('https://example.com');
    });

    and('I change the URL to "https://should-not-be-saved.com"', async () => {
      await urlListPage.editUrl('https://should-not-be-saved.com');
    });

    and('I click the "Cancel" button', async () => {
      await urlListPage.clickCancelButton();
    });

    then('I should still see "https://example.com" in the URL list', async () => {
      await expect(urlListPage.getUrlItem('https://example.com')).toBeVisible();
    });

    and('I should not see "https://should-not-be-saved.com"', async () => {
      await expect(urlListPage.getUrlItem('https://should-not-be-saved.com')).toHaveCount(0);
    });
  });
});