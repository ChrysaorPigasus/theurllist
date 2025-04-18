import React from 'react';
import { Given, When, Then, defineFeature, loadFeature } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world';
import { UrlListPage } from '@tests/bdd/pages/UrlListPage';

/**
 * Steps for viewing URLs in a list (FR003)
 */

// Load the feature file
const feature = loadFeature('./features/view-urls-in-list.feature');

// Define the feature
defineFeature(feature, (test) => {
  let world;
  let urlListPage;

  beforeEach(() => {
    world = new World();
    urlListPage = new UrlListPage(world.page);
  });

  test('View all URLs in a list', ({ given, when, then }) => {
    given('I have a list with {int} URLs', async (count) => {
      // Setup logic for having a list with the specified count
      await world.setupUrlList(count);
    });

    when('I navigate to the URL list view', async () => {
      await world.navigateToUrlList();
    });

    then('I should see all {int} URLs in the list', async (count) => {
      await expect(urlListPage.getAllUrlItems()).toHaveCount(count);
    });

    then('each URL should display its address and title', async () => {
      expect(await urlListPage.verifyUrlsHaveAddressAndTitle()).toBe(true);
    });
  });

  test('Search for URLs in a list', ({ given, when, then }) => {
    given('I am viewing a list with multiple URLs', async () => {
      await world.navigateToUrlListWithMultipleItems();
    });

    when('I enter {string} in the search field', async (searchTerm) => {
      await urlListPage.searchUrlsInList(searchTerm);
      await urlListPage.waitForListUpdate();
    });

    then('I should see {int} URL in the filtered list', async (count) => {
      await urlListPage.waitForListUpdate();
      await expect(urlListPage.getAllUrlItems()).toHaveCount(count);
    });
  });

  test('Sort URLs in a list', ({ given, when, then }) => {
    given('I am viewing a list with multiple URLs', async () => {
      await world.navigateToUrlListWithMultipleItems();
    });

    when('I click on the {string} sort header', async (headerName) => {
      await urlListPage.clickSortHeader(headerName);
      await urlListPage.waitForListUpdate();
    });

    then('the URLs should be sorted alphabetically by title', async () => {
      await urlListPage.waitForListUpdate();
      expect(await urlListPage.areUrlsSortedAlphabetically()).toBe(true);
    });

    when('I click on the {string} sort header again', async (headerName) => {
      await urlListPage.clickSortHeader(headerName);
      await urlListPage.waitForListUpdate();
    });

    then('the URLs should be sorted in reverse alphabetical order by title', async () => {
      await urlListPage.waitForListUpdate();
      expect(await urlListPage.areUrlsSortedReverseAlphabetically()).toBe(true);
    });
  });

  test('View empty URL list', ({ given, when, then }) => {
    given('I have an empty list', async () => {
      await world.setupEmptyUrlList();
    });

    when('I navigate to the URL list view', async () => {
      await world.navigateToUrlList();
    });

    then('I should see a message indicating there are no URLs in the list', async () => {
      await expect(urlListPage.getEmptyStateIndicator()).toBeVisible();
    });
  });
});

