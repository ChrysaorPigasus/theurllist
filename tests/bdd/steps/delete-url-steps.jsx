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
 * Steps for deleting URLs from a list (FR005)
 */

const feature = loadFeature('@tests/bdd/features/delete-urls-from-list.feature');

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

  test('Delete a single URL from the list', ({ given, when, and, then }) => {
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

    and('I click the "Delete" button for "https://example.com"', async () => {
      await urlListPage.clickDeleteButtonForUrl('https://example.com');
    });

    and('I confirm the deletion', async () => {
      await urlListPage.confirmDeletion();
    });

    then('I should see a success message', async () => {
      await expect(urlListPage.getDeletionSuccessMessage()).toBeVisible();
    });

    and('"https://example.com" should no longer appear in the list', async () => {
      await expect(urlListPage.getUrlItem('https://example.com')).toHaveCount(0);
    });

    and('I should see 2 URLs remaining in the list', async () => {
      expect(await urlListPage.getUrlCount()).toBe(2);
    });
  });

  test('Cancel the deletion of a URL', ({ given, when, and, then }) => {
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

    and('I click the "Delete" button for "https://test.org"', async () => {
      await urlListPage.clickDeleteButtonForUrl('https://test.org');
    });

    and('I cancel the deletion', async () => {
      await urlListPage.cancelDeletion();
    });

    then('"https://test.org" should still appear in the list', async () => {
      await expect(urlListPage.getUrlItem('https://test.org')).toBeVisible();
    });

    and('I should see 3 URLs in the list', async () => {
      expect(await urlListPage.getUrlCount()).toBe(3);
    });
  });

  test('Delete the last URL from a list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    given('I have created a list named "Single URL List"', async () => {
      await world.createList('Single URL List');
    });

    and('I have added "https://single-example.com" to the list', async () => {
      await listEditorPage.addUrl('https://single-example.com');
    });

    when('I navigate to the "Single URL List" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("Single URL List").first().click();
    });

    and('I click the "Delete" button for "https://single-example.com"', async () => {
      await urlListPage.clickDeleteButtonForUrl('https://single-example.com');
    });

    and('I confirm the deletion', async () => {
      await urlListPage.confirmDeletion();
    });

    then('I should see a success message', async () => {
      await expect(urlListPage.getDeletionSuccessMessage()).toBeVisible();
    });

    and('I should see a message indicating there are no URLs in the list', async () => {
      await expect(urlListPage.getEmptyStateIndicator()).toBeVisible();
    });
  });
});