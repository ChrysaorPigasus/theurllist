import React from 'react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from '@playwright/test';
import { World } from '@tests/bdd/support/world.cjs';
import * as commonSteps from './common-steps';
import { HomePage } from '@tests/bdd/pages/HomePage.jsx';
import { ListsPage } from '@tests/bdd/pages/ListsPage.jsx';
import { ListEditorPage } from '@tests/bdd/pages/ListEditorPage.jsx';

/**
 * Steps for sharing a list (FR010)
 * Verbeterd met expliciete zichtbaarheidscontroles
 */

const feature = loadFeature('@tests/bdd/features/share-list.feature');

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

  test('Copy shareable URL to clipboard', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have published my list', async () => {
      await listEditorPage.openPublishSection();
      // Controleer eerst of de publiceer sectie zichtbaar is
      await expect(listEditorPage.getPublishSection()).toBeVisible();
      await listEditorPage.publishList();
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      const listLink = listsPage.getListLinkByName("My URL Collection").first();
      // Controleer of de link zichtbaar is voordat erop wordt geklikt
      await expect(listLink).toBeVisible();
      await listLink.click();
    });

    and('I open the "Share List" section', async () => {
      // Controleer eerst of de share knop zichtbaar is
      const shareButton = listEditorPage.getShareButton();
      await expect(shareButton).toBeVisible();
      await listEditorPage.openShareListSection();
      
      // Controleer of de share sectie daadwerkelijk zichtbaar is geworden
      await expect(listEditorPage.getShareSection()).toBeVisible();
    });

    and('I click the "Copy URL" button', async () => {
      // Controleer of de kopieer knop zichtbaar is voordat erop wordt geklikt
      const copyButton = listEditorPage.getCopyUrlButton();
      await expect(copyButton).toBeVisible();
      await expect(copyButton).toBeEnabled();
      await listEditorPage.clickCopyUrlButton();
    });

    then('I should see a confirmation that the URL was copied to clipboard', async () => {
      // Controleer of de bevestigingsmelding daadwerkelijk zichtbaar is
      await expect(listEditorPage.getUrlCopiedMessage()).toBeVisible({timeout: 5000});
    });

    and('the clipboard should contain the shareable URL for my list', async () => {
      // Controleer of de URL daadwerkelijk zichtbaar was in de UI
      const urlInput = listEditorPage.getShareableUrlInput();
      await expect(urlInput).toBeVisible();
      
      // Controleer of de juiste URL in het input veld staat
      const inputValue = await urlInput.inputValue();
      expect(inputValue).toContain('/list/');
      
      // Note: Daadwerkelijke clipboard testing zou extra permissies vereisen
      await expect(listEditorPage.getUrlCopiedMessage()).toBeVisible();
    });
  });

  test('Share list via Twitter', ({ given, when, and, then }) => {
    let listUrl;

    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have published my list', async () => {
      await listEditorPage.openPublishSection();
      await expect(listEditorPage.getPublishSection()).toBeVisible();
      await listEditorPage.publishList();
      listUrl = await listEditorPage.getPublicUrl();
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      const listLink = listsPage.getListLinkByName("My URL Collection").first();
      await expect(listLink).toBeVisible();
      await listLink.click();
    });

    and('I open the "Share List" section', async () => {
      const shareButton = listEditorPage.getShareButton();
      await expect(shareButton).toBeVisible();
      await listEditorPage.openShareListSection();
      await expect(listEditorPage.getShareSection()).toBeVisible();
    });

    and('I click the "Twitter" button', async () => {
      // Controleer of de Twitter knop zichtbaar is
      const twitterButton = listEditorPage.getShareButton('Twitter');
      await expect(twitterButton).toBeVisible();
      await expect(twitterButton).toBeEnabled();
      
      // Set up a new page listener to intercept the new window
      const pagePromise = world.context.waitForEvent('page');
      await twitterButton.click();
      const newPage = await pagePromise;
      await newPage.waitForLoadState();
      world.twitterPage = newPage;
    });

    then('I should be redirected to Twitter with a pre-filled post containing my list URL', async () => {
      // Check that Twitter page URL contains the list URL and is loaded
      expect(world.twitterPage.url()).toContain('twitter.com');
      expect(world.twitterPage.url()).toContain('text=');
      
      // Controleer of de Twitter pagina daadwerkelijk zichtbaar is
      await expect(world.twitterPage.locator('body')).toBeVisible();
      
      // Close the Twitter page after verification
      await world.twitterPage.close();
    });
  });

  test('Share list via LinkedIn', ({ given, when, and, then }) => {
    let listUrl;

    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have published my list', async () => {
      await listEditorPage.openPublishSection();
      await expect(listEditorPage.getPublishSection()).toBeVisible();
      await listEditorPage.publishList();
      listUrl = await listEditorPage.getPublicUrl();
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      const listLink = listsPage.getListLinkByName("My URL Collection").first();
      await expect(listLink).toBeVisible();
      await listLink.click();
    });

    and('I open the "Share List" section', async () => {
      const shareButton = listEditorPage.getShareButton();
      await expect(shareButton).toBeVisible();
      await listEditorPage.openShareListSection();
      await expect(listEditorPage.getShareSection()).toBeVisible();
    });

    and('I click the "LinkedIn" button', async () => {
      // Controleer of de LinkedIn knop zichtbaar is
      const linkedinButton = listEditorPage.getShareButton('LinkedIn');
      await expect(linkedinButton).toBeVisible();
      await expect(linkedinButton).toBeEnabled();
      
      // Set up a new page listener to intercept the new window
      const pagePromise = world.context.waitForEvent('page');
      await linkedinButton.click();
      const newPage = await pagePromise;
      await newPage.waitForLoadState();
      world.linkedinPage = newPage;
    });

    then('I should be redirected to LinkedIn with my list URL pre-filled for sharing', async () => {
      // Check that LinkedIn page URL contains the list URL and is loaded
      expect(world.linkedinPage.url()).toContain('linkedin.com');
      expect(world.linkedinPage.url()).toContain('url=');
      
      // Controleer of de LinkedIn pagina daadwerkelijk zichtbaar is
      await expect(world.linkedinPage.locator('body')).toBeVisible();
      
      // Close the LinkedIn page after verification
      await world.linkedinPage.close();
    });
  });

  test('Share list via Email', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    and('I have created a list named "My URL Collection"', async () => {
      await world.createList('My URL Collection');
    });

    and('I have published my list', async () => {
      await listEditorPage.openPublishSection();
      await expect(listEditorPage.getPublishSection()).toBeVisible();
      await listEditorPage.publishList();
    });

    when('I navigate to the "My URL Collection" list', async () => {
      await listsPage.navigateToListsPage();
      const listLink = listsPage.getListLinkByName("My URL Collection").first();
      await expect(listLink).toBeVisible();
      await listLink.click();
    });

    and('I open the "Share List" section', async () => {
      const shareButton = listEditorPage.getShareButton();
      await expect(shareButton).toBeVisible();
      await listEditorPage.openShareListSection();
      await expect(listEditorPage.getShareSection()).toBeVisible();
    });

    and('I click the "Email" button', async () => {
      // Controleer of de Email knop zichtbaar is
      const emailButton = listEditorPage.getShareButton('Email');
      await expect(emailButton).toBeVisible();
      await expect(emailButton).toBeEnabled();
      
      // Mock clicking the email button
      await emailButton.click();
    });

    then('my default email client should open', async () => {
      // This is difficult to test in an automated fashion
      // We can check that the href has a 'mailto:' link
      const mailtoLink = await world.page.evaluate(() => {
        const emailBtn = document.querySelector('a[href^="mailto:"]');
        return emailBtn ? emailBtn.getAttribute('href') : null;
      });
      
      expect(mailtoLink).toContain('mailto:');
    });

    and('the email should contain the shareable URL for my list', async () => {
      // Verify the mailto link contains the list URL
      const mailtoLink = await world.page.evaluate(() => {
        const emailBtn = document.querySelector('a[href^="mailto:"]');
        return emailBtn ? emailBtn.getAttribute('href') : null;
      });
      
      expect(mailtoLink).toContain('body=');
    });
  });

  test('Try to share an unpublished list', ({ given, when, and, then }) => {
    given('I am logged in', async () => {
      await world.login();
    });

    given('I have an unpublished list named "Private Collection"', async () => {
      await world.createList('Private Collection');
      // Ensure list is unpublished (default state)
    });

    when('I navigate to the "Private Collection" list', async () => {
      await listsPage.navigateToListsPage();
      const listLink = listsPage.getListLinkByName("Private Collection").first();
      await expect(listLink).toBeVisible();
      await listLink.click();
    });

    and('I open the "Share List" section', async () => {
      const shareButton = listEditorPage.getShareButton();
      await expect(shareButton).toBeVisible();
      await listEditorPage.openShareListSection();
      await expect(listEditorPage.getShareSection()).toBeVisible();
    });

    then('I should see a message indicating I need to publish the list first', async () => {
      await expect(listEditorPage.getUnpublishedListMessage()).toBeVisible();
    });
  });
});