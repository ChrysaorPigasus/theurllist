import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world.cjs';
import * as commonSteps from './common-steps';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';

/**
 * Steps for customizing the list URL (FR006)
 */

const feature = loadFeature('@tests/bdd/features/customize-list-url.feature');

defineFeature(feature, (test) => {
  let world;
  let homePage;
  let listsPage;
  let listEditorPage;
  let publicUrl;

  beforeEach(() => {
    world = commonSteps.setupWorld();
    homePage = new HomePage(world.page);
    listsPage = new ListsPage(world.page);
    listEditorPage = new ListEditorPage(world.page);
  });

  afterEach(async () => {
    await commonSteps.cleanupWorld();
  });

  test('Set a custom URL for a list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I open the "Customize URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I enter "my-awesome-collection" as the custom URL', async () => {
      await listEditorPage.updateCustomUrl('my-awesome-collection');
    });

    and('I click the "Update URL" button', async () => {
      await listEditorPage.clickSaveUrlButton();
    });

    then('I should see a success message', async () => {
      await expect(listEditorPage.getSuccessMessage()).toBeVisible();
    });

    and('the shareable URL should contain "/list/my-awesome-collection"', async () => {
      // Verify the URL contains the custom path
      publicUrl = await listEditorPage.getPublicUrl();
      expect(publicUrl).toContain('/list/my-awesome-collection');
    });
  });

  test('Try to set an invalid custom URL', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I open the "Customize URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I enter "invalid url with spaces" as the custom URL', async () => {
      await listEditorPage.updateCustomUrl('invalid url with spaces');
    });

    and('I click the "Update URL" button', async () => {
      await listEditorPage.clickSaveUrlButton();
    });

    then('I should see an error message about invalid characters', async () => {
      const errorMessage = world.page.locator('text="invalid characters", text="spaces are not allowed"');
      await expect(errorMessage).toBeVisible();
    });

    and('the URL should not be updated', async () => {
      // Get the current URL and verify it doesn't contain the invalid path
      const currentUrl = world.page.url();
      expect(currentUrl).not.toContain('invalid-url-with-spaces');
    });
  });

  test('Try to set a custom URL that is already taken', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    given('another user has a list with custom URL "popular-list"', async () => {
      // Mock this condition by setting up the API to return an error for this URL
      await world.mockTakenUrl('popular-list');
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I open the "Customize URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I enter "popular-list" as the custom URL', async () => {
      await listEditorPage.updateCustomUrl('popular-list');
    });

    and('I click the "Update URL" button', async () => {
      await listEditorPage.clickSaveUrlButton();
    });

    then('I should see an error message that the URL is already taken', async () => {
      const errorMessage = world.page.locator('text="already in use", text="already taken", text="not available"');
      await expect(errorMessage).toBeVisible();
    });
  });

  test('Change an existing custom URL', ({ given, when, and, then }) => {
    let oldCustomUrl = 'old-collection-url';
    let newCustomUrl = 'new-collection-url';

    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    given('my list "My URL Collection" has custom URL "old-collection-url"', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
      await listEditorPage.openCustomUrlSection();
      await listEditorPage.updateCustomUrl(oldCustomUrl);
      await listEditorPage.clickSaveUrlButton();
      await expect(listEditorPage.getSuccessMessage()).toBeVisible();
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I open the "Customize URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I enter "new-collection-url" as the custom URL', async () => {
      await listEditorPage.updateCustomUrl(newCustomUrl);
    });

    and('I click the "Update URL" button', async () => {
      await listEditorPage.clickSaveUrlButton();
    });

    then('I should see a success message', async () => {
      await expect(listEditorPage.getSuccessMessage()).toBeVisible();
    });

    and('the shareable URL should contain "/list/new-collection-url"', async () => {
      publicUrl = await listEditorPage.getPublicUrl();
      expect(publicUrl).toContain(`/list/${newCustomUrl}`);
    });

    and('the old URL "/list/old-collection-url" should no longer work', async () => {
      // Construct the old URL
      const oldUrl = publicUrl.replace(newCustomUrl, oldCustomUrl);
      
      // Try to navigate to the old URL
      const newPage = await world.context.newPage();
      await newPage.goto(oldUrl);
      
      // Check for "not found" message
      const notFoundMessage = newPage.locator('text="not found", text="404", text="does not exist"');
      await expect(notFoundMessage).toBeVisible();
      
      // Close the new page
      await newPage.close();
    });
  });
});