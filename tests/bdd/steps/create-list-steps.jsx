import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import * as commonSteps from '@tests/bdd/steps/common-steps';

/**
 * Steps for creating a new URL list (FR001)
 */

const feature = loadFeature('@tests/bdd/features/create-url-list.feature');

defineFeature(feature, (test) => {
  let testContext;

  beforeEach(() => {
    // Get all context objects in a single call
    testContext = commonSteps.setupWorld();
  });

  afterEach(async () => {
    await commonSteps.cleanupWorld();
  });

  test('Create a new empty list', ({ given, when, and, then }) => {
    given('I am on the home page', async () => {
      await testContext.homePage.navigateToHomePage();
    });

    when('I click on "Create New List"', async () => {
      await testContext.ui.clickButtonOrLink('Create New List');
    });

    and('I enter "My Test List" as the list name', async () => {
      await testContext.ui.typeInField('My Test List', 'name');
    });

    and('I click the "Create List" button', async () => {
      await testContext.ui.clickButton('Create List');
    });

    then('I should see a new empty list with the name "My Test List"', async () => {
      // Check if we see the correct list title
      await expect(testContext.listEditorPage.getListTitle('My Test List')).toBeVisible();
      
      // Check for empty list indicator
      await expect(testContext.listEditorPage.getEmptyListIndicator()).toBeVisible();
    });

    and('I should see an option to add URLs to the list', async () => {
      // Check if the Add URL section is visible
      await expect(testContext.listEditorPage.getAddUrlSection()).toBeVisible();
    });
  });

  test('Try to create a list without a name', ({ given, when, and, then }) => {
    given('I am on the home page', async () => {
      await testContext.homePage.navigateToHomePage();
    });

    when('I click on "Create New List"', async () => {
      await testContext.ui.clickButtonOrLink('Create New List');
    });

    and('I leave the list name empty', async () => {
      await testContext.ui.typeInField('', 'name');
    });

    and('I click the "Create List" button', async () => {
      await testContext.ui.clickButton('Create List');
    });

    then('I should see an error message indicating that a name is required', async () => {
      await expect(testContext.listEditorPage.getRequiredFieldError()).toBeVisible();
    });
  });

  test('Create a list with additional details', ({ given, when, and, then }) => {
    given('I am on the home page', async () => {
      await testContext.homePage.navigateToHomePage();
    });

    when('I click on "Create New List"', async () => {
      await testContext.ui.clickButtonOrLink('Create New List');
    });

    and('I enter "My Detailed List" as the list name', async () => {
      await testContext.ui.typeInField('My Detailed List', 'name');
    });

    and('I enter "A collection of my favorite websites" as the description', async () => {
      await testContext.ui.typeInField('A collection of my favorite websites', 'description');
    });

    and('I click the "Create List" button', async () => {
      await testContext.ui.clickButton('Create List');
    });

    then('I should see a new list with the name "My Detailed List"', async () => {
      await expect(testContext.listEditorPage.getListTitle('My Detailed List')).toBeVisible();
    });

    and('I should see the description "A collection of my favorite websites"', async () => {
      await expect(testContext.listEditorPage.getListDescription('A collection of my favorite websites')).toBeVisible();
    });
  });
});