import React from 'react';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';
import { DialogHelper } from '../../utils/dialog-helper';
import { UIInteractions } from '../support/ui-interactions';
import { FormHelper } from '../../utils/form-helper';
import { TableHelper } from '../../utils/table-helper';

/**
 * Common steps for BDD tests
 * 
 * This file contains common steps that are used across multiple features.
 * The methods are exported for reuse in other step definition files.
 */

// Shared objects used across tests
let world;
let homePage;
let listsPage;
let listEditorPage;
let dialogHelper;
let ui;
let formHelper;
let tableHelper;

/**
 * Initialize test world and shared objects
 */
export function setupWorld() {
  world = new World();
  homePage = new HomePage(world.page);
  listsPage = new ListsPage(world.page);
  listEditorPage = new ListEditorPage(world.page);
  dialogHelper = new DialogHelper(world.page);
  ui = new UIInteractions(world.page, dialogHelper);
  formHelper = new FormHelper(world.page);
  tableHelper = new TableHelper(world.page);
  
  return {
    world, 
    homePage, 
    listsPage, 
    listEditorPage, 
    dialogHelper,
    ui,
    formHelper,
    tableHelper,
    page: world.page
  };
}

/**
 * Clean up world after tests
 */
export async function cleanupWorld() {
  if (world) {
    await world.cleanup();
  }
}

// ----------------------------------------
// Background steps
// ----------------------------------------

export const onHomePage = async () => {
  await homePage.navigateToHomePage();
};

export const loggedIn = async () => {
  await homePage.navigateToHomePage();
  // Set user authentication state
  await world.context.addCookies([
    {
      name: 'auth_token',
      value: 'test-auth-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
};

// ----------------------------------------
// Navigation steps
// ----------------------------------------

export const navigateToList = async (listName) => {
  await listsPage.navigateToListsPage();
  const listLink = listsPage.getListLinkByName(listName);
  await listLink.first().click();
  await world.page.waitForSelector('h1:has-text("URLs in List")');
};

export const navigateToListsOverview = async () => {
  await listsPage.navigateToListsPage();
  await world.page.waitForSelector('h1:has-text("Your URL Lists")');
};

// ----------------------------------------
// UI interaction steps - using UIInteractions
// ----------------------------------------

export const clickOn = async (buttonText) => {
  await ui.clickButtonOrLink(buttonText);
};

export const clickButton = async (buttonText) => {
  await ui.clickButton(buttonText);
};

export const clickButtonForItem = async (buttonText, itemText) => {
  await ui.clickButtonInItem(buttonText, itemText);
};

export const openSection = async (sectionName) => {
  await ui.openSection(sectionName);
};

export const enterInField = async (text, fieldName) => {
  await ui.typeInField(text, fieldName);
};

export const enterAs = async (text, fieldName) => {
  await ui.typeInField(text, fieldName);
};

export const leaveFieldEmpty = async (fieldName) => {
  await ui.typeInField('', fieldName);
};

export const leaveListNameEmpty = async () => {
  await listEditorPage.fillListName('');
};

// ----------------------------------------
// Verification steps
// ----------------------------------------

export const shouldSee = async (text) => {
  await ui.verifyTextVisible(text);
};

export const shouldSeeSuccessMessage = async () => {
  await expect(dialogHelper.getSuccessMessage()).toBeVisible();
};

export const shouldSeeErrorMessage = async (errorPartialText) => {
  await expect(dialogHelper.getErrorMessage(errorPartialText)).toBeVisible();
};

export const shouldNotSee = async (text) => {
  await ui.verifyTextNotVisible(text);
};

export const shouldBeRedirectedTo = async (url) => {
  await world.page.waitForURL(url);
};

// ----------------------------------------
// Dialog interaction steps
// ----------------------------------------

export const confirmDeletion = async () => {
  await dialogHelper.confirmDeletion();
};

export const cancelDeletion = async () => {
  await dialogHelper.cancelDeletion();
};

// ----------------------------------------
// User session steps
// ----------------------------------------

export const logOut = async () => {
  await world.context.clearCookies();
  await homePage.navigateToHomePage();
};

// ----------------------------------------
// Test data creation steps
// ----------------------------------------

export const createList = async (listName) => {
  await listsPage.navigateToListsPage();
  await listsPage.clickCreateNewList();
  await listEditorPage.fillListName(listName);
  await listEditorPage.clickCreateListButton();
  await world.page.waitForSelector(`h1:has-text("${listName}"), h2:has-text("${listName}")`);
};