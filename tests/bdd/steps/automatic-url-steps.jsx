import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world.cjs';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';

/**
 * Steps for automatic URL generation (FR007)
 */

const feature = loadFeature('@tests/bdd/features/automatic-url-generation.feature');

defineFeature(feature, (test) => {
  let world;
  let listEditorPage;
  let listsPage;

  beforeEach(() => {
    world = new World();
    listEditorPage = new ListEditorPage(world.page);
    listsPage = new ListsPage(world.page);
  });

  afterEach(async () => {
    await world.cleanup();
  });

  test('Generate a URL automatically', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My Test URL Collection"', async () => {
      await world.createList("My Test URL Collection");
    });

    when('I navigate to the "My Test URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My Test URL Collection").first().click();
    });

    and('I open the "Custom URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I click the "Generate" button', async () => {
      await listEditorPage.clickGenerateButton();
    });

    then('I should see an automatically generated URL based on my list name', async () => {
      // Check if the URL field has a generated value that is not empty
      const value = await listEditorPage.getCustomUrlValue();
      expect(value).toBeTruthy();
      expect(value.length).toBeGreaterThan(0);
    });

    and('I should see a message to save the generated URL', async () => {
      // Check if there's a message prompting the user to save the URL
      await expect(listEditorPage.getUrlGeneratedMessage()).toBeVisible();
    });
  });

  test('Save the automatically generated URL', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My Test URL Collection"', async () => {
      await world.createList("My Test URL Collection");
    });

    when('I navigate to the "My Test URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My Test URL Collection").first().click();
    });

    and('I open the "Custom URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I click the "Generate" button', async () => {
      await listEditorPage.clickGenerateButton();
    });

    and('I click the "Save" button', async () => {
      await listEditorPage.clickSaveUrlButton();
    });

    then('I should see a success message', async () => {
      await expect(listEditorPage.getSuccessMessage()).toBeVisible();
    });

    and('the shareable URL should contain the automatically generated URL', async () => {
      // Check if the URL is visible in the UI
      await expect(listEditorPage.getShareableUrlDisplay()).toBeVisible();
    });
  });

  test('Modify an automatically generated URL before saving', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My Test URL Collection"', async () => {
      await world.createList("My Test URL Collection");
    });

    when('I navigate to the "My Test URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My Test URL Collection").first().click();
    });

    and('I open the "Custom URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I click the "Generate" button', async () => {
      await listEditorPage.clickGenerateButton();
    });

    and('I modify part of the automatically generated URL', async () => {
      // Get the current URL value
      const currentUrl = await listEditorPage.getCustomUrlValue();
      
      // Add something to the end of the URL
      await listEditorPage.updateCustomUrl(currentUrl + '-modified');
    });

    and('I click the "Save" button', async () => {
      await listEditorPage.clickSaveUrlButton();
    });

    then('I should see a success message', async () => {
      await expect(listEditorPage.getSuccessMessage()).toBeVisible();
    });

    and('the shareable URL should contain my modified version of the URL', async () => {
      // Check if the URL contains the modification
      const urlInput = world.page.locator('input[value*="-modified"]');
      await expect(urlInput).toBeVisible();
    });
  });

  test('Generate a URL for a list with special characters in name', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    given('I have created a list named "Special Ch@racters & Symbols!"', async () => {
      await world.createList("Special Ch@racters & Symbols!");
    });

    when('I navigate to the "Special Ch@racters & Symbols!" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("Special Ch@racters & Symbols!").first().click();
    });

    and('I open the "Custom URL" section', async () => {
      await listEditorPage.openCustomUrlSection();
    });

    and('I click the "Generate" button', async () => {
      await listEditorPage.clickGenerateButton();
    });

    then('I should see an automatically generated URL with only valid characters', async () => {
      // Check if the URL contains only valid characters (only letters, numbers and hyphens)
      const value = await listEditorPage.getCustomUrlValue();
      
      expect(value).toMatch(/^[a-z0-9-]+$/);
    });

    and('the generated URL should not contain special characters', async () => {
      const value = await listEditorPage.getCustomUrlValue();
      
      // The URL should not contain special characters like @, &, !, etc.
      expect(value).not.toMatch(/[@&!?%\s]/);
    });
  });
});