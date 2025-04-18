import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world';
import { SharedListPage } from '@tests/bdd/pages/SharedListPage';
import { ListsPage } from '@tests/bdd/pages/ListsPage';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage';

/**
 * Steps for accessing a shared list (FR010)
 */

const feature = loadFeature('@tests/bdd/features/access-shared-list.feature');

defineFeature(feature, (test) => {
  let world;
  let sharedListPage;
  let listsPage;
  let listEditorPage;

  beforeEach(() => {
    world = new World();
    sharedListPage = new SharedListPage(world.page);
    listsPage = new ListsPage(world.page);
    listEditorPage = new ListEditorPage(world.page);
  });

  afterEach(async () => {
    await world.cleanup();
  });

  test('Access a shared list via direct URL', ({ given, when, then, and }) => {
    given('there is a published list named "Shared Resources"', async () => {
      await world.page.goto('/');
      // Set user authentication state
      await world.context.addCookies([
        {
          name: 'auth_token',
          value: 'test-auth-token',
          domain: 'localhost',
          path: '/'
        }
      ]);
      
      // Navigate to lists page
      await listsPage.navigateToListsPage();
      
      // Check if list exists, create it if not
      const listLink = listsPage.getListLinkByName("Shared Resources");
      if (await listLink.count() === 0) {
        // Create list
        await listsPage.clickCreateNewList();
        await listEditorPage.fillListName("Shared Resources");
        await listEditorPage.clickCreateListButton();
        await sharedListPage.getListTitleWithText("Shared Resources").waitFor();
      } else {
        await listLink.first().click();
      }
      
      // Publish the list
      await listEditorPage.openPublishSection();
      await listEditorPage.publishList();
      
      // Log out for a clean session
      await world.context.clearCookies();
    });

    and('the list contains the following URLs:', async (dataTable) => {
      // Ensure we're logged in
      await world.page.goto('/');
      
      // Log in if needed
      if (await world.page.locator('text="Sign In", text="Login"').count() > 0) {
        await world.context.addCookies([
          {
            name: 'auth_token',
            value: 'test-auth-token',
            domain: 'localhost',
            path: '/'
          }
        ]);
        await world.page.reload();
      }
      
      // Add each URL to the list
      const rows = dataTable.hashes();
      
      for (const row of rows) {
        await listEditorPage.addUrl(row.URL, row.Title, row.Description);
      }
      
      // Log out for a clean session
      await world.context.clearCookies();
    });

    when('I visit the shareable URL for "Shared Resources"', async () => {
      // Visit the shared list URL
      await sharedListPage.navigateToList('shared-resources');
    });

    then('I should see the list name "Shared Resources"', async () => {
      await expect(sharedListPage.getListTitleWithText("Shared Resources")).toBeVisible();
    });

    and('I should see all 3 URLs in the list', async () => {
      // Check that all 3 URLs are in the list
      const urlItems = sharedListPage.getUrlItems();
      expect(await urlItems.count()).toBe(3);
    });

    and('I should be able to click on the URLs to open them', async () => {
      // Check that URLs are clickable
      const urlLinks = sharedListPage.getUrlItems();
      
      // Check that there's at least one URL and it's clickable
      expect(await urlLinks.count()).toBeGreaterThan(0);
      
      // Test clickability by checking the target attribute for each link
      for (let i = 0; i < Math.min(await urlLinks.count(), 3); i++) {
        const link = urlLinks.nth(i);
        const target = await link.getAttribute('target');
        // URLs should open in a new tab (target="_blank")
        expect(target).toBe('_blank');
      }
    });
  });

  test('Access a shared list with a custom URL', ({ given, when, then, and }) => {
    given('there is a published list named "Shared Resources"', async () => {
      await world.page.goto('/');
      // Set user authentication state
      await world.context.addCookies([
        {
          name: 'auth_token',
          value: 'test-auth-token',
          domain: 'localhost',
          path: '/'
        }
      ]);
      
      // Navigate to lists page
      await listsPage.navigateToListsPage();
      
      // Check if list exists, create it if not
      const listLink = listsPage.getListLinkByName("Shared Resources");
      if (await listLink.count() === 0) {
        // Create list
        await listsPage.clickCreateNewList();
        await listEditorPage.fillListName("Shared Resources");
        await listEditorPage.clickCreateListButton();
        await sharedListPage.getListTitleWithText("Shared Resources").waitFor();
      } else {
        await listLink.first().click();
      }
      
      // Publish the list
      await listEditorPage.openPublishSection();
      await listEditorPage.publishList();
      
      // Log out for a clean session
      await world.context.clearCookies();
    });

    and('the list contains the following URLs:', async (dataTable) => {
      // Ensure we're logged in
      await world.page.goto('/');
      
      // Log in if needed
      if (await world.page.locator('text="Sign In", text="Login"').count() > 0) {
        await world.context.addCookies([
          {
            name: 'auth_token',
            value: 'test-auth-token',
            domain: 'localhost',
            path: '/'
          }
        ]);
        await world.page.reload();
      }
      
      // Add each URL to the list
      const rows = dataTable.hashes();
      
      for (const row of rows) {
        await listEditorPage.addUrl(row.URL, row.Title, row.Description);
      }
      
      // Log out for a clean session
      await world.context.clearCookies();
    });

    given('the list "Shared Resources" has a custom URL "dev-resources"', async () => {
      // Make sure we're logged in
      await world.page.goto('/');
      
      // Set user authentication state
      await world.context.addCookies([
        {
          name: 'auth_token',
          value: 'test-auth-token',
          domain: 'localhost',
          path: '/'
        }
      ]);
      
      // Navigate to lists page
      await listsPage.navigateToListsPage();
      
      // Go to the list
      await listsPage.getListLinkByName("Shared Resources").first().click();
      
      // Set custom URL
      await listEditorPage.openCustomUrlSection();
      await listEditorPage.setCustomUrl('dev-resources');
      
      // Log out for a clean session
      await world.context.clearCookies();
    });

    when('I visit "/list/dev-resources"', async () => {
      // Visit the custom URL
      await world.page.goto('/list/dev-resources');
    });

    then('I should see the list name "Shared Resources"', async () => {
      await expect(sharedListPage.getListTitleWithText("Shared Resources")).toBeVisible();
    });

    and('I should see all 3 URLs in the list', async () => {
      // Check that all 3 URLs are in the list
      const urlItems = sharedListPage.getUrlItems();
      expect(await urlItems.count()).toBe(3);
    });
  });

  test('Try to access a non-existent shared list', ({ when, then }) => {
    when('I visit a URL for a list that does not exist', async () => {
      // Visit a random non-existent list URL
      await sharedListPage.navigateToList('non-existent-list-123456789');
    });

    then('I should see a message indicating the list was not found', async () => {
      // Check for a "not found" message
      await expect(sharedListPage.getNotFoundMessage()).toBeVisible();
    });
  });

  test('Try to access a private list', ({ given, when, then }) => {
    given('there is a private list named "Private Resources"', async () => {
      await world.page.goto('/');
      // Set user authentication state
      await world.context.addCookies([
        {
          name: 'auth_token',
          value: 'test-auth-token',
          domain: 'localhost',
          path: '/'
        }
      ]);
      
      // Navigate to lists page
      await listsPage.navigateToListsPage();
      
      // Check if list exists, create it if not
      const listLink = listsPage.getListLinkByName("Private Resources");
      if (await listLink.count() === 0) {
        // Create list
        await listsPage.clickCreateNewList();
        await listEditorPage.fillListName("Private Resources");
        await listEditorPage.clickCreateListButton();
        await sharedListPage.getListTitleWithText("Private Resources").waitFor();
      } else {
        await listLink.first().click();
      }
      
      // Ensure list remains private (not published)
      // Log out for a clean session
      await world.context.clearCookies();
    });

    when('I try to access the URL for "Private Resources"', async () => {
      // Try to access the private list URL
      await sharedListPage.navigateToList('private-resources');
    });

    then('I should see a message indicating the list is private or not found', async () => {
      // Check for a "private" or "not found" message
      await expect(sharedListPage.getNotFoundMessage()).toBeVisible();
    });
  });
});