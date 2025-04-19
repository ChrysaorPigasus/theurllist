import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world.cjs';
import * as commonSteps from './common-steps';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';
import { UrlListPage } from '@tests/bdd/pages/UrlListPage.jsx';

/**
 * Steps for viewing URLs in a list (FR008)
 */

const feature = loadFeature('@tests/bdd/features/view-urls-in-list.feature');

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

  test('View all URLs in a list', ({ given, when, and, then }) => {
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

    then('I should see all 3 URLs in the list', async () => {
      expect(await urlListPage.getUrlCount()).toBe(3);
    });

    and('each URL should display its address and title', async () => {
      // Check that each URL and title in the table is visible
      await expect(urlListPage.getUrlItem('https://example.com')).toBeVisible();
      await expect(urlListPage.getUrlItemTitle('Example Site')).toBeVisible();
      
      await expect(urlListPage.getUrlItem('https://test.org')).toBeVisible();
      await expect(urlListPage.getUrlItemTitle('Test Website')).toBeVisible();
      
      await expect(urlListPage.getUrlItem('https://reference.net')).toBeVisible();
      await expect(urlListPage.getUrlItemTitle('Reference Site')).toBeVisible();
    });
  });

  test('Search for URLs in a list', ({ given, when, and, then }) => {
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

    and('I enter "test" in the search field', async () => {
      await urlListPage.searchUrlsInList('test');
    });

    then('I should see 1 URL in the filtered list', async () => {
      expect(await urlListPage.getUrlCount()).toBe(1);
    });

    and('I should see "https://test.org" in the list', async () => {
      await expect(urlListPage.getUrlItem('https://test.org')).toBeVisible();
    });
  });

  test('Sort URLs by different criteria', ({ given, when, and, then }) => {
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

    and('I click on the "Title" sort header', async () => {
      await urlListPage.clickSortHeader('Title');
    });

    then('the URLs should be sorted alphabetically by title', async () => {
      const urlTexts = await urlListPage.getUrlItemsInOrder();
      
      // Expect "Example Site" to come before "Reference Site" and "Test Website" alphabetically
      const exampleIndex = urlTexts.findIndex(text => text.includes('Example Site'));
      const referenceIndex = urlTexts.findIndex(text => text.includes('Reference Site'));
      const testIndex = urlTexts.findIndex(text => text.includes('Test Website'));
      
      expect(exampleIndex).toBeLessThan(referenceIndex);
      expect(referenceIndex).toBeLessThan(testIndex);
    });

    when('I click on the "Title" sort header again', async () => {
      await urlListPage.clickSortHeader('Title');
    });

    then('the URLs should be sorted in reverse alphabetical order by title', async () => {
      const urlTexts = await urlListPage.getUrlItemsInOrder();
      
      // Expect "Test Website" to come before "Reference Site" and "Example Site" in reverse alphabetical order
      const testIndex = urlTexts.findIndex(text => text.includes('Test Website'));
      const referenceIndex = urlTexts.findIndex(text => text.includes('Reference Site'));
      const exampleIndex = urlTexts.findIndex(text => text.includes('Example Site'));
      
      expect(testIndex).toBeLessThan(referenceIndex);
      expect(referenceIndex).toBeLessThan(exampleIndex);
    });
  });

  test('View empty list', ({ given, when, then, and }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    given('I have created a list named "Empty List"', async () => {
      await world.createList('Empty List');
      // No URLs are added to this list intentionally
    });

    when('I navigate to the "Empty List" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("Empty List").first().click();
    });

    then('I should see a message indicating there are no URLs in the list', async () => {
      await expect(urlListPage.getEmptyStateIndicator()).toBeVisible();
    });

    and('I should see an option to add URLs', async () => {
      await expect(urlListPage.getAddUrlOption()).toBeVisible();
    });
  });
});