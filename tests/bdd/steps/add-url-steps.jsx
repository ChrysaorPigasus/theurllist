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
 * Steps for adding URLs to a list (FR002)
 */

const feature = loadFeature('@tests/bdd/features/add-urls-to-list.feature');

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

  test('Add a single URL to a list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I am viewing "My URL Collection"', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    when('I enter "https://example.com" in the URL input field', async () => {
      await listEditorPage.fillUrlInput('https://example.com');
    });

    and('I click the "Add URL" button', async () => {
      await listEditorPage.clickAddUrlButton();
    });

    then('I should see "https://example.com" in the URL list', async () => {
      await expect(urlListPage.getUrlItem('https://example.com')).toBeVisible();
    });

    and('I should see a success message', async () => {
      await expect(urlListPage.getSuccessMessage()).toBeVisible();
    });
  });

  test('Add a URL without protocol prefix', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I am viewing "My URL Collection"', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    when('I enter "example.org" in the URL input field', async () => {
      await listEditorPage.fillUrlInput('example.org');
    });

    and('I click the "Add URL" button', async () => {
      await listEditorPage.clickAddUrlButton();
    });

    then('I should see "https://example.org" in the URL list', async () => {
      await expect(urlListPage.getUrlItem('https://example.org')).toBeVisible();
    });

    and('I should see a success message', async () => {
      await expect(urlListPage.getSuccessMessage()).toBeVisible();
    });
  });

  test('Try to add an empty URL', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I am viewing "My URL Collection"', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    when('I leave the URL input field empty', async () => {
      await listEditorPage.fillUrlInput('');
    });

    and('I click the "Add URL" button', async () => {
      await listEditorPage.clickAddUrlButton();
    });

    then('I should see an error message indicating that URL cannot be empty', async () => {
      await expect(urlListPage.getErrorMessage()).toBeVisible();
    });

    and('no URL should be added to the list', async () => {
      // Check that the list is empty or doesn't contain any items
      await expect(urlListPage.getEmptyStateIndicator()).toBeVisible();
    });
  });

  test('Add a URL with additional metadata', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I am viewing "My URL Collection"', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    when('I enter "https://example.com" in the URL input field', async () => {
      await listEditorPage.fillUrlInput('https://example.com');
    });

    and('I click on "Show additional fields"', async () => {
      await listEditorPage.clickShowAdditionalFields();
    });

    and('I enter "Example Website" as the title', async () => {
      await listEditorPage.fillTitleInput('Example Website');
    });

    and('I enter "This is an example website for testing" as the description', async () => {
      await listEditorPage.fillDescriptionInput('This is an example website for testing');
    });

    and('I click the "Add URL" button', async () => {
      await listEditorPage.clickAddUrlButton();
    });

    then('I should see "https://example.com" in the URL list', async () => {
      await expect(urlListPage.getUrlItem('https://example.com')).toBeVisible();
    });

    and('the URL should display with title "Example Website"', async () => {
      await expect(urlListPage.getUrlItemTitle('Example Website')).toBeVisible();
    });

    and('the URL should display with description "This is an example website for testing"', async () => {
      await expect(urlListPage.getUrlItemDescription('This is an example website for testing')).toBeVisible();
    });
  });
});