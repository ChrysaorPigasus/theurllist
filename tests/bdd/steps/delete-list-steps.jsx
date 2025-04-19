import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world.cjs';
import * as commonSteps from '@tests/bdd/steps/common-steps';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';

/**
 * Steps for deleting a list (FR003)
 */

const feature = loadFeature('@tests/bdd/features/delete-list.feature');

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

  test('Delete a list with URLs', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created the following lists:', async (dataTable) => {
      const lists = dataTable.hashes();
      
      for (const list of lists) {
        await world.createList(list.Name);
        
        // Add URLs if needed
        if (parseInt(list['URLs Count']) > 0) {
          for (let i = 0; i < parseInt(list['URLs Count']); i++) {
            await listEditorPage.addUrl(`https://example${i}.com`, `Example ${i}`, `Description ${i}`);
          }
        }
      }
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    and('I click the "Delete" button for "Development Tools"', async () => {
      await listsPage.clickDeleteButtonForList('Development Tools');
    });

    and('I confirm the deletion', async () => {
      await listsPage.confirmDeletion();
    });

    then('I should see a success message that the list was deleted', async () => {
      await expect(listsPage.getDeletionSuccessMessage()).toBeVisible();
    });

    and('"Development Tools" should no longer appear in my lists', async () => {
      await expect(listsPage.getListLinkByName('Development Tools')).toHaveCount(0);
    });

    and('I should see only 2 lists remaining', async () => {
      expect(await listsPage.getListCount()).toBe(2);
    });
  });

  test('Delete an empty list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created the following lists:', async (dataTable) => {
      const lists = dataTable.hashes();
      
      for (const list of lists) {
        await world.createList(list.Name);
        
        // Add URLs if needed
        if (parseInt(list['URLs Count']) > 0) {
          for (let i = 0; i < parseInt(list['URLs Count']); i++) {
            await listEditorPage.addUrl(`https://example${i}.com`, `Example ${i}`, `Description ${i}`);
          }
        }
      }
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    and('I click the "Delete" button for "Personal Links"', async () => {
      await listsPage.clickDeleteButtonForList('Personal Links');
    });

    and('I confirm the deletion', async () => {
      await listsPage.confirmDeletion();
    });

    then('I should see a success message that the list was deleted', async () => {
      await expect(listsPage.getDeletionSuccessMessage()).toBeVisible();
    });

    and('"Personal Links" should no longer appear in my lists', async () => {
      await expect(listsPage.getListLinkByName('Personal Links')).toHaveCount(0);
    });

    and('I should see only 2 lists remaining', async () => {
      expect(await listsPage.getListCount()).toBe(2);
    });
  });

  test('Cancel list deletion', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created the following lists:', async (dataTable) => {
      const lists = dataTable.hashes();
      
      for (const list of lists) {
        await world.createList(list.Name);
        
        // Add URLs if needed
        if (parseInt(list['URLs Count']) > 0) {
          for (let i = 0; i < parseInt(list['URLs Count']); i++) {
            await listEditorPage.addUrl(`https://example${i}.com`, `Example ${i}`, `Description ${i}`);
          }
        }
      }
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    and('I click the "Delete" button for "Learning Resources"', async () => {
      await listsPage.clickDeleteButtonForList('Learning Resources');
    });

    and('I cancel the deletion', async () => {
      await listsPage.cancelDeletion();
    });

    then('"Learning Resources" should still appear in my lists', async () => {
      await expect(listsPage.getListLinkByName('Learning Resources')).toBeVisible();
    });

    and('I should still see all 3 lists', async () => {
      expect(await listsPage.getListCount()).toBe(3);
    });
  });

  test('Delete the last list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    given('I have only one list named "Last List"', async () => {
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
      
      // Now create the single "Last List"
      await world.createList("Last List");
    });

    when('I navigate to the lists overview page', async () => {
      await listsPage.navigateToListsPage();
    });

    and('I click the "Delete" button for "Last List"', async () => {
      await listsPage.clickDeleteButtonForList('Last List');
    });

    and('I confirm the deletion', async () => {
      await listsPage.confirmDeletion();
    });

    then('I should see a success message that the list was deleted', async () => {
      await expect(listsPage.getDeletionSuccessMessage()).toBeVisible();
    });

    and('I should see a message indicating I have no lists', async () => {
      await expect(listsPage.getEmptyListsMessage()).toBeVisible();
    });
  });
});