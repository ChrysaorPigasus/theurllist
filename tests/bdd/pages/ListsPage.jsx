import { Page } from '@playwright/test';
import { selectors, getSelectors, SelectorHelpers } from '@tests/utils/selector-helper';
import { DialogHelper } from '@tests/utils/dialog-helper';
import { BasePage } from '@tests/bdd/pages/BasePage';

/**
 * Page object for the lists overview page
 * Extends BasePage to inherit automatic console error tracking capabilities
 */
export class ListsPage extends BasePage {
  private selectors: SelectorHelpers;
  private dialogHelper: DialogHelper;

  constructor(page: Page) {
    super(page);
    this.selectors = getSelectors(page);
    this.dialogHelper = new DialogHelper(page);
  }

  /**
   * Navigate to the lists page
   */
  async navigateToListsPage() {
    await this.navigateTo('/lists');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get a specific list link by name
   */
  getListLinkByName(name: string) {
    return this.page.locator(`[data-testid="list-link-${name}"], a:has-text("${name}")`);
  }

  /**
   * Click the create new list button
   */
  async clickCreateNewList() {
    await this.selectors.button('Create New List').click();
  }

  /**
   * Get delete button for a specific list
   */
  getDeleteButtonForList(listName: string) {
    return this.selectors.listItem(listName).locator(selectors.button('Delete'));
  }

  /**
   * Click delete button for a specific list
   */
  async clickDeleteButtonForList(listName: string) {
    await this.getDeleteButtonForList(listName).click();
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
   * Get deletion success message
   */
  getDeletionSuccessMessage() {
    return this.dialogHelper.getDeletionSuccessMessage();
  }

  /**
   * Get list count
   */
  async getListCount() {
    return await this.page.locator('[data-testid="list-item"], li.list-item, tr.list-row').count();
  }

  /**
   * Get empty lists message
   */
  getEmptyListsMessage() {
    return this.page.locator('[data-testid="empty-lists-message"], text="no lists", text="No lists found"');
  }

  /**
   * Filter lists by published status
   */
  async filterByPublishedStatus() {
    await this.page.locator('[data-testid="filter-select"], select, [role="combobox"]').selectOption({ label: 'Published Only' });
  }

  /**
   * Search for a specific list
   */
  async searchForList(searchTerm: string) {
    await this.page.locator('[data-testid="search-input"], input[type="search"], input[placeholder*="Search"]').fill(searchTerm);
  }

  /**
   * Get create new list button
   */
  getCreateNewListButton() {
    return this.selectors.button('Create New List');
  }

  /**
   * Check if list is published
   */
  getPublishedIndicator(listName: string) {
    return this.selectors.listItem(listName).locator('[data-testid="published-badge"], text="Published", .published-badge');
  }
}