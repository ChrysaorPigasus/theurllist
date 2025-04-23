import { Page } from '@playwright/test';

/**
 * Page object for the shared list view page
  * Extends BasePage to inherit automatic console error tracking capabilities
 */

import { BasePage } from '@tests/bdd/pages/BasePage';

export class SharedListPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigates to a specific list using its custom URL
   */
  async navigateToList(listUrl) {
    await this.page.goto(`/list/${listUrl}`);
  }

  /**
   * Get the list title element
   */
  getListTitle() {
    return this.page.locator('h1:has-text(""), h2:has-text("")');
  }

  /**
   * Check if the list title contains specific text
   */
  getListTitleWithText(text) {
    return this.page.locator(`h1:has-text("${text}"), h2:has-text("${text}")`);
  }

  /**
   * Get all URL items in the list
   */
  getUrlItems() {
    return this.page.locator('a[href^="http"]');
  }

  /**
   * Get the "not found" or error message on the page
   */
  getNotFoundMessage() {
    return this.page.locator('text="not found", text="does not exist", text="could not be found", text="private"');
  }

  /**
   * Navigate to a specific list
   * @param {string} urlPart - The URL part that identifies the list
   */
  async navigateToList(urlPart) {
    await this.page.goto(`/list/${urlPart}`);
  }

  /**
   * Get list title
   * @param {string} title - The title to look for
   * @returns {Locator} - Locator for the list title
   */
  getListTitle(title) {
    return this.page.locator(`h1:has-text("${title}"), h2:has-text("${title}")`);
  }

  /**
   * Get URL item
   * @param {string} url - The URL to look for
   * @returns {Locator} - Locator for the URL item
   */
  getUrlItem(url) {
    return this.page.locator(`a[href="${url}"], text="${url}"`);
  }

  /**
   * Get private or not found message
   * @returns {Locator} - Locator for the private or not found message
   */
  getPrivateOrNotFoundMessage() {
    return this.page.locator('text="private", text="not found", text="doesn\'t exist", text="no longer available"');
  }

  /**
   * Check if the page shows a published list
   * @returns {Promise<boolean>} - True if the page shows a published list
   */
  async isPublishedListVisible() {
    return await this.page.locator('.published-list, [data-testid="shared-list"]').isVisible();
  }

  /**
   * Check if the page shows a private list message
   * @returns {Promise<boolean>} - True if the page shows a private list message
   */
  async isPrivateListMessageVisible() {
    return await this.page.locator('text="private", text="not available"').isVisible();
  }

  /**
   * Get all URL items in the shared list
   * @returns {Locator} - Locator for all URL items
   */
  getUrlItems() {
    return this.page.locator('.url-item, .url-entry, [data-testid="url-item"]');
  }

  /**
   * Get the title of the shared list
   * @returns {Promise<string>} - The title of the shared list
   */
  async getListTitle() {
    const titleElement = this.page.locator('h1, .list-title, [data-testid="list-title"]');
    return await titleElement.textContent();
  }
}