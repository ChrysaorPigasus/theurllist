import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world.cjs';
import * as commonSteps from './common-steps';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';

/**
 * Steps for viewing all lists (FR007)
 */

const feature = loadFeature('@tests/bdd/features/view-all-lists.feature');

defineFeature(feature, (test) => {
  let world;
  let homePage;
  let listsPage;
  let listEditorPage;

  beforeEach(() => {
    world = commonSteps.setupWorld();
    homePage = new HomePage(world.page);
    listsPage = new ListsPage(world.page);
    listEditorPage = new ListEditorPage(world.page);
  });

  afterEach(async () => {
    await commonSteps.cleanupWorld();
  });

  test('View all my lists', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created the following lists:', async (dataTable) => {
      const lists = dataTable.hashes();
      
      for (const list of lists) {
        await world.createList(list.Name, list.Description);
        
        // Publish the list if needed
        if (list.Published.toLowerCase() === 'yes') {
          await listEditorPage.openPublishSection();
          await listEditorPage.publishList();
        }
      }
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    then('I should see all 3 of my lists', async () => {
      expect(await listsPage.getListCount()).toBe(3);
    });

    and('each list should display its name and description', async () => {
      await expect(listsPage.getListLinkByName('Development Tools')).toBeVisible();
      await expect(listsPage.getListLinkByName('Learning Resources')).toBeVisible();
      await expect(listsPage.getListLinkByName('Personal Links')).toBeVisible();
      
      // Checking for description - assumptions about how descriptions are displayed
      await expect(world.page.locator('text="Useful dev tools and resources"')).toBeVisible();
      await expect(world.page.locator('text="Websites for learning"')).toBeVisible();
      await expect(world.page.locator('text="Personal bookmarks"')).toBeVisible();
    });

    and('I should see which lists are published', async () => {
      await expect(listsPage.getPublishedIndicator('Development Tools')).toBeVisible();
      await expect(listsPage.getPublishedIndicator('Learning Resources')).toHaveCount(0);
      await expect(listsPage.getPublishedIndicator('Personal Links')).toHaveCount(0);
    });
  });

  test('Filter lists by published status', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created the following lists:', async (dataTable) => {
      const lists = dataTable.hashes();
      
      for (const list of lists) {
        await world.createList(list.Name, list.Description);
        
        // Publish the list if needed
        if (list.Published.toLowerCase() === 'yes') {
          await listEditorPage.openPublishSection();
          await listEditorPage.publishList();
        }
      }
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    and('I filter to show only published lists', async () => {
      await listsPage.filterByPublishedStatus();
    });

    then('I should see only the "Development Tools" list', async () => {
      await expect(listsPage.getListLinkByName('Development Tools')).toBeVisible();
    });

    and('I should not see the "Learning Resources" or "Personal Links" lists', async () => {
      await expect(listsPage.getListLinkByName('Learning Resources')).toHaveCount(0);
      await expect(listsPage.getListLinkByName('Personal Links')).toHaveCount(0);
    });
  });

  test('Search for a specific list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created the following lists:', async (dataTable) => {
      const lists = dataTable.hashes();
      
      for (const list of lists) {
        await world.createList(list.Name, list.Description);
        
        // Publish the list if needed
        if (list.Published.toLowerCase() === 'yes') {
          await listEditorPage.openPublishSection();
          await listEditorPage.publishList();
        }
      }
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    and('I search for "Learning"', async () => {
      await listsPage.searchForList('Learning');
    });

    then('I should see only the "Learning Resources" list', async () => {
      await expect(listsPage.getListLinkByName('Learning Resources')).toBeVisible();
    });

    and('I should not see the other lists', async () => {
      await expect(listsPage.getListLinkByName('Development Tools')).toHaveCount(0);
      await expect(listsPage.getListLinkByName('Personal Links')).toHaveCount(0);
    });
  });

  test('Handle empty lists', ({ given, when, then, and }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    given('I have not created any lists yet', async () => {
      // First clear any existing lists by navigating to each and deleting it
      await listsPage.navigateToListsPage();
      
      // Check how many lists are there
      const listCount = await world.page.locator('li.list-item, tr.list-row').count();
      
      // Delete all existing lists
      for (let i = 0; i < listCount; i++) {
        const list = world.page.locator('li.list-item, tr.list-row').first();
        const deleteButton = list.locator('button:has-text("Delete")');
        await deleteButton.click();
        await listsPage.confirmDeletion();
        
        // Wait for the deletion to complete
        await world.page.waitForTimeout(500);
      }
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    then('I should see a message indicating I have no lists', async () => {
      await expect(listsPage.getEmptyListsMessage()).toBeVisible();
    });

    and('I should see an option to create a new list', async () => {
      await expect(listsPage.getCreateNewListButton()).toBeVisible();
    });
  });
});