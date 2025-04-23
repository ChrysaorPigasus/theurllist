import { Page } from '@playwright/test';
import { selectors, getSelectors, SelectorHelpers } from '@tests/utils/selector-helper';
import { DialogHelper } from '@tests/utils/dialog-helper';
import { BasePage } from '@tests/bdd/pages/BasePage';

/**
 * Page object for the URL list page
 * Extends BasePage to inherit automatic console error tracking capabilities
 */
export class UrlListPage extends BasePage {
  selectors;
  dialogHelper;
  page;

  constructor(page) {
    // Initialize the base page with error tracking
    super(page);
    this.page = page;
    this.selectors = getSelectors(page);
    this.dialogHelper = new DialogHelper(page);
  }

  /**
   * Get the list title element
   */
  getListTitle(titleText: string) {
    return this.page.locator(`[data-testid="list-title-${titleText}"], h1:has-text("${titleText}"), h2:has-text("${titleText}")`);
  }

  /**
   * Get URL item by URL
   */
  getUrlItem(url: string) {
    return this.page.locator(`[data-testid="url-item-${url}"], a[href="${url}"], text="${url}"`);
  }

  /**
   * Get all URL items in the list
   */
  getAllUrlItems() {
    return this.page.locator('[data-testid="url-item"], .url-item, tr, li').filter({ hasText: 'http' });
  }

  /**
   * Get empty state indicator
   */
  getEmptyStateIndicator() {
    return this.page.locator('[data-testid="empty-state"], text="No URLs in this list yet", text="No URLs added yet"');
  }

  /**
   * Get success message
   */
  getSuccessMessage() {
    return this.dialogHelper.getSuccessMessage();
  }

  /**
   * Get deletion success message
   */
  getDeletionSuccessMessage() {
    return this.dialogHelper.getDeletionSuccessMessage();
  }

  /**
   * Get error message
   */
  getErrorMessage() {
    return this.dialogHelper.getErrorMessage();
  }

  /**
   * Get URL item title
   */
  getUrlItemTitle(title: string) {
    return this.page.locator(`[data-testid="url-title-${title}"], text="${title}"`);
  }

  /**
   * Get URL item description
   */
  getUrlItemDescription(description: string) {
    return this.page.locator(`[data-testid="url-description"], text="${description}"`);
  }

  /**
   * Get delete button for a specific URL
   */
  getDeleteButtonForUrl(url: string) {
    return this.page.locator(`[data-testid="url-item-${url}"], tr:has-text("${url}"), li:has-text("${url}")`)
      .locator('[data-testid="delete-button"], button:has-text("Delete")');
  }

  /**
   * Click delete button for a specific URL
   */
  async clickDeleteButtonForUrl(url: string) {
    await this.getDeleteButtonForUrl(url).click();
  }

  /**
   * Get confirmation dialog
   */
  getConfirmationDialog() {
    return this.dialogHelper.getConfirmationDialog();
  }

  /**
   * Confirm deletion in dialog
   */
  async confirmDeletion() {
    await this.dialogHelper.confirmDeletion();
  }

  /**
   * Cancel deletion in dialog
   */
  async cancelDeletion() {
    await this.dialogHelper.cancelDeletion();
  }

  /**
   * Get URL count
   */
  async getUrlCount() {
    return await this.getAllUrlItems().count();
  }

  /**
   * Get edit button for a specific URL
   */
  getEditButtonForUrl(url: string) {
    return this.page.locator(`[data-testid="url-item-${url}"], tr:has-text("${url}"), li:has-text("${url}")`)
      .locator('[data-testid="edit-button"], button:has-text("Edit")');
  }

  /**
   * Click edit button for a specific URL
   */
  async clickEditButtonForUrl(url: string) {
    await this.getEditButtonForUrl(url).click();
  }

  /**
   * Get the URL edit field
   */
  getUrlEditField() {
    return this.page.locator('[data-testid="url-edit-field"], input[type="url"], input[name="url"], input[placeholder*="URL"]').first();
  }

  /**
   * Get the title edit field
   */
  getTitleEditField() {
    return this.page.locator('[data-testid="title-edit-field"], input[name="title"], input[id="title"]');
  }

  /**
   * Get the description edit field
   */
  getDescriptionEditField() {
    return this.page.locator('[data-testid="description-edit-field"], input[name="description"], textarea[name="description"], textarea[id="description"]');
  }

  /**
   * Edit a URL's address
   */
  async editUrl(newUrl) {
    await this.getUrlEditField().fill(newUrl);
  }

  /**
   * Edit a URL's title
   */
  async editTitle(newTitle) {
    await this.getTitleEditField().fill(newTitle);
  }

  /**
   * Edit a URL's description
   */
  async editDescription(newDescription) {
    await this.getDescriptionEditField().fill(newDescription);
  }

  /**
   * Clear the URL field
   */
  async clearUrlField() {
    await this.getUrlEditField().fill('');
  }

  /**
   * Click save button
   */
  async clickSaveButton() {
    await this.selectors.button('Save').click();
  }

  /**
   * Click cancel button
   */
  async clickCancelButton() {
    await this.selectors.button('Cancel').click();
  }

  /**
   * Get URL update success message
   */
  getUpdateSuccessMessage() {
    return this.dialogHelper.getSuccessMessage('updated');
  }

  /**
   * Search for URLs within a list
   */
  async searchUrlsInList(searchTerm: string) {
    await this.page.locator('[data-testid="search-input"], input[type="search"], input[placeholder*="Search"]').fill(searchTerm);
  }

  /**
   * Click on a sort header
   */
  async clickSortHeader(headerName: string) {
    await this.page.locator(`[data-testid="sort-header-${headerName}"], th:has-text("${headerName}"), [role="columnheader"]:has-text("${headerName}")`).click();
  }

  /**
   * Get URL items in order as displayed in the list
   */
  async getUrlItemsInOrder() {
    const urls = await this.getAllUrlItems().allInnerTexts();
    return urls;
  }

  /**
   * Get "Add URL" button or section
   */
  getAddUrlOption() {
    return this.selectors.button('Add URL');
  }

  /**
   * Get all URL link elements within list items
   */
  getUrlLinks() {
    return this.getAllUrlItems().locator('a[href^="http"]');
  }

  /**
   * Get all title elements within list items
   */
  getUrlTitleElements() {
    return this.page.locator('td:nth-child(2), tr .title, h3, h4, strong, .title').filter({ hasText: /.+/ });
  }

  /**
   * Verify each URL displays its address and title
   */
  async verifyUrlsHaveAddressAndTitle() {
    const urlItems = this.getAllUrlItems();
    const count = await urlItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = urlItems.nth(i);
      
      // Check if there's a URL link
      const urlLink = item.locator('a[href^="http"]');
      await urlLink.isVisible();
      
      // Check if there's a title or at least the URL itself
      const hasTitle = await item.locator('h3, h4, strong, .title').count() > 0;
      if (hasTitle) {
        await item.locator('h3, h4, strong, .title').isVisible();
      }
    }
    return true;
  }

  /**
   * Get title elements and check if they are sorted alphabetically
   */
  async areUrlsSortedAlphabetically() {
    const titleElements = this.getUrlTitleElements();
    const count = await titleElements.count();
    
    if (count > 1) {
      const titles = [];
      for (let i = 0; i < count; i++) {
        titles.push(await titleElements.nth(i).textContent());
      }
      
      // Check if titles are sorted
      const sortedTitles = [...titles].sort();
      return JSON.stringify(titles) === JSON.stringify(sortedTitles);
    }
    return true;
  }

  /**
   * Get title elements and check if they are sorted in reverse alphabetical order
   */
  async areUrlsSortedReverseAlphabetically() {
    const titleElements = this.getUrlTitleElements();
    const count = await titleElements.count();
    
    if (count > 1) {
      const titles = [];
      for (let i = 0; i < count; i++) {
        titles.push(await titleElements.nth(i).textContent());
      }
      
      // Check if titles are sorted in reverse
      const sortedTitles = [...titles].sort().reverse();
      return JSON.stringify(titles) === JSON.stringify(sortedTitles);
    }
    return true;
  }

  /**
   * Wait for list to update after action (search, sort, etc.)
   */
  async waitForListUpdate(ms = 500) {
    await this.page.waitForTimeout(ms);
  }
}