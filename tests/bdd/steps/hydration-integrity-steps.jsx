import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import * as commonSteps from '@tests/bdd/steps/common-steps';
import registerHydrationTestingSteps, { 
  givenHydrationTrackingIsEnabled,
  thenNoHydrationErrorsOccur
} from '@tests/bdd/steps/hydration-testing-steps';

/**
 * Step definitions for hydration integrity testing
 */

const feature = loadFeature('@tests/bdd/features/hydration-integrity.feature');

defineFeature(feature, (test) => {
  let world;
  let homePage;
  let listsPage;
  let listEditorPage;
  
  beforeEach(() => {
    world = commonSteps.setupWorld();
    homePage = world.homePage;
    listsPage = world.listsPage;
    listEditorPage = world.listEditorPage;
  });

  afterEach(async () => {
    await commonSteps.cleanupWorld();
  });

  test('Verify hydration integrity on the home page', ({ given, when, then }) => {
    given('hydration tracking is enabled', givenHydrationTrackingIsEnabled);
    
    when('I navigate to the home page', async () => {
      await homePage.navigateTo('/');
    });
    
    then('no hydration errors occur', thenNoHydrationErrorsOccur);
  });
  
  test('Verify hydration integrity when creating a list', ({ given, when, and, then }) => {
    given('hydration tracking is enabled', givenHydrationTrackingIsEnabled);
    
    given('I am on the home page', async () => {
      await homePage.navigateTo('/');
    });
    
    when('I enter "Test Hydration List" as the list name', async () => {
      await homePage.enterInField('Test Hydration List', 'name');
    });
    
    and('I click the "Create List" button', async () => {
      await homePage.clickButton('Create List');
    });
    
    then('no hydration errors occur', thenNoHydrationErrorsOccur);
    
    and('I should see a success message', async () => {
      await expect(homePage.getSuccessMessage()).toBeVisible();
    });
  });
  
  test('Verify hydration integrity with loading buttons', ({ given, when, and, then }) => {
    given('hydration tracking is enabled', givenHydrationTrackingIsEnabled);
    
    given('I am on the home page', async () => {
      await homePage.navigateTo('/');
    });
    
    when('I enter "Loading Test List" as the list name', async () => {
      await homePage.enterInField('Loading Test List', 'name');
    });
    
    and('I click the "Create List" button', async () => {
      // Here we want to specifically test button loading state,
      // so we'll artificially slow down the request to ensure
      // loading state is visible
      
      // Intercept API calls to simulate a slow network
      await world.page.route('**/api/lists', async (route) => {
        // Wait 1 second before continuing with the request
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });
      
      await homePage.clickButton('Create List');
    });
    
    then('no hydration errors occur', thenNoHydrationErrorsOccur);
  });
  
  test('Verify hydration integrity on lists page', ({ given, when, and, then }) => {
    given('hydration tracking is enabled', givenHydrationTrackingIsEnabled);
    
    when('I navigate to the lists page', async () => {
      await listsPage.navigateToListsPage();
    });
    
    then('no hydration errors occur', thenNoHydrationErrorsOccur);
    
    when('I click on "Create New List"', async () => {
      await listsPage.clickCreateNewList();
    });
    
    then('no hydration errors occur', thenNoHydrationErrorsOccur);
  });
});
