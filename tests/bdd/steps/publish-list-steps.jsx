import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world';
import * as commonSteps from './common-steps';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';
import { SharedListPage } from '@tests/bdd/pages/SharedListPage.jsx';

/**
 * Steps for list sharing (FR007)
 */

const feature = loadFeature('@tests/bdd/features/publish-list.feature');

defineFeature(feature, (test) => {
  let world;
  let homePage;
  let listsPage;
  let listEditorPage;
  let sharedListPage;
  let publicUrl;

  beforeEach(() => {
    world = commonSteps.setupWorld();
    homePage = new HomePage(world.page);
    listsPage = new ListsPage(world.page);
    listEditorPage = new ListEditorPage(world.page);
    sharedListPage = new SharedListPage(world.page);
  });

  afterEach(async () => {
    await commonSteps.cleanupWorld();
  });

  test('Publish a list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have added URLs to the list', async () => {
      await listEditorPage.addUrl('https://example.com', 'Example Site', 'Example description');
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("My URL Collection").first().click();
    });

    and('I open the "Publish List" section', async () => {
      await listEditorPage.openPublishSection();
    });

    and('I click the "Publish List" button', async () => {
      await listEditorPage.publishList();
    });

    then('I should see a confirmation that the list is published', async () => {
      await expect(listEditorPage.getPublishSuccessMessage()).toBeVisible();
    });

    and('I should see a shareable URL for the list', async () => {
      publicUrl = await listEditorPage.getPublicUrl();
      expect(publicUrl).toBeTruthy();
    });
  });

  test('View a published list as an anonymous user', ({ given, when, then, and }) => {
    given('a user has published a list named "Public URL Collection"', async () => {
      await world.login();
      await world.createList('Public URL Collection');
      await listEditorPage.addUrl('https://example.com', 'Example Site', 'Example description');
      await listEditorPage.openPublishSection();
      await listEditorPage.publishList();
      publicUrl = await listEditorPage.getPublicUrl();
      
      // Extract the custom part of the URL (after the /list/ part)
      const urlParts = publicUrl.split('/list/');
      const customUrlPart = urlParts[urlParts.length - 1];
      world.lastPublishedCustomUrl = customUrlPart;
      
      // Logout
      await world.logout();
    });

    when('I visit the shareable URL for that list', async () => {
      await sharedListPage.navigateToList(world.lastPublishedCustomUrl);
    });

    then('I should see the title "Public URL Collection"', async () => {
      await expect(sharedListPage.getListTitle('Public URL Collection')).toBeVisible();
    });

    and('I should see the URLs in the list', async () => {
      await expect(sharedListPage.getUrlItem('https://example.com')).toBeVisible();
    });
  });

  test('Make a published list private', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have a published list named "Once Public List"', async () => {
      await world.createList('Once Public List');
      await listEditorPage.addUrl('https://example.com', 'Example Site', 'Example description');
      await listEditorPage.openPublishSection();
      await listEditorPage.publishList();
      publicUrl = await listEditorPage.getPublicUrl();
      
      // Extract the custom part of the URL (after the /list/ part)
      const urlParts = publicUrl.split('/list/');
      const customUrlPart = urlParts[urlParts.length - 1];
      world.lastPublishedCustomUrl = customUrlPart;
    });

    when('I navigate to the "Once Public List" list', async () => {
      await listsPage.navigateToListsPage();
      await listsPage.getListLinkByName("Once Public List").first().click();
    });

    and('I open the "Publish List" section', async () => {
      await listEditorPage.openPublishSection();
    });

    and('I click the "Make Private" button', async () => {
      await listEditorPage.makeListPrivate();
    });

    then('I should see a confirmation that the list is now private', async () => {
      await expect(listEditorPage.getPrivateListConfirmationMessage()).toBeVisible();
    });

    and('anonymous users can no longer access the list', async () => {
      // Logout first
      await world.logout();
      
      // Try to access the list
      await sharedListPage.navigateToList(world.lastPublishedCustomUrl);
      
      // Check for private or not found message
      await expect(sharedListPage.getPrivateOrNotFoundMessage()).toBeVisible();
    });
  });

  test('Try to access a private list as an anonymous user', ({ given, when, then }) => {
    given('a user has a private list named "Private Collection"', async () => {
      await world.login();
      await world.createList('Private Collection');
      
      // Save the ID of the list for later use
      world.lastCreatedListId = await world.getLastCreatedListId();
      
      // Logout
      await world.logout();
    });

    when('I try to access the URL for that list', async () => {
      // Generate a fake URL based on the list ID
      await sharedListPage.navigateToList(`private-list-${world.lastCreatedListId}`);
    });

    then('I should see a message that the list is private or cannot be found', async () => {
      await expect(sharedListPage.getPrivateOrNotFoundMessage()).toBeVisible();
    });
  });
});