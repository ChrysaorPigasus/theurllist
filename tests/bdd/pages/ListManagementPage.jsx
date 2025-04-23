import { Page } from '@playwright/test';
import { selectors, getSelectors, SelectorHelpers } from '@tests/utils/selector-helper';
import { DialogHelper } from '@tests/utils/dialog-helper';
import { BasePage } from '@tests/bdd/pages/BasePage';

/**
 * Page object for the list management page
 * Extends BasePage to inherit automatic console error tracking capabilities
 */
export class ListManagementPage extends BasePage {
  selectors;
  dialogHelper;

  constructor(page) {
    // Initialize the base page with error tracking
    super(page);
    this.selectors = getSelectors(page);
    this.dialogHelper = new DialogHelper(page);
  }

  /**
   * Get create list button
   */
  getCreateListButton() {
    return this.page.locator('[data-testid="create-list-button"], button:has-text("Create List"), button:has-text("New List")');
  }

  /**
   * Get list name input
   */
  getListNameInput() {
    return this.page.locator('[data-testid="list-name-input"], input[name="name"], input[placeholder*="List name"]');
  }

  /**
   * Get list description input
   */
  getListDescriptionInput() {
    return this.page.locator('[data-testid="list-description-input"], textarea[name="description"], textarea[placeholder*="Description"]');
  }

  /**
   * Get custom URL slug input
   */
  getCustomUrlInput() {
    return this.page.locator('[data-testid="custom-url-input"], input[name="slug"], input[placeholder*="Custom URL"]');
  }

  /**
   * Get save/create button in the form
   */
  getSaveButton() {
    return this.page.locator('[data-testid="save-list-button"], button:has-text("Save"), button:has-text("Create List"), form button[type="submit"]');
  }

  /**
   * Get a list element by name
   */
  getListByName(name) {
    return this.page.locator(`[data-testid="list-item-${name}"], div:has-text("${name}").list-item, tr:has-text("${name}")`);
  }

  /**
   * Get success message
   */
  getSuccessMessage() {
    return this.dialogHelper.getSuccessMessage();
  }

  /**
   * Click create list button
   */
  async clickCreateListButton() {
    await this.getCreateListButton().click();
  }

  /**
   * Create a new list
   * @param {Object} listData - List data {name, description, slug}
   */
  async createList(listData) {
    // Click the create list button to open the form
    await this.clickCreateListButton();
    
    // Fill in the form fields
    await this.getListNameInput().fill(listData.name);
    
    if (listData.description) {
      await this.getListDescriptionInput().fill(listData.description);
    }
    
    if (listData.slug) {
      await this.getCustomUrlInput().fill(listData.slug);
    }
    
    // Submit the form
    await this.getSaveButton().click();
    
    // Wait for submission to complete
    await this.page.waitForLoadState('networkidle');
  }
}