import { Page } from '@playwright/test';
import { selectors, getSelectors, SelectorHelpers } from '@tests/utils/selector-helper';
import { DialogHelper } from '@tests/utils/dialog-helper';

/**
 * Page object for the home page
  * Extends BasePage to inherit automatic console error tracking capabilities
 */

import { BasePage } from '@tests/bdd/pages/BasePage';

export class HomePage {
  private selectors: SelectorHelpers;
  private dialogHelper: DialogHelper;

  constructor(page: Page) {
    this.page = page;
    this.selectors = getSelectors(page);
    this.dialogHelper = new DialogHelper(page);
  }

  /**
   * Navigate to the home page
   */
  async navigateToHomePage() {
    await this.page.goto('/');
  }

  /**
   * Get success message
   */
  getSuccessMessage(text?: string) {
    return this.dialogHelper.getSuccessMessage(text);
  }

  /**
   * Get error message
   */
  getErrorMessage(errorText?: string) {
    return this.dialogHelper.getErrorMessage(errorText);
  }

  /**
   * Find element by text
   */
  getElementWithText(text: string) {
    return this.selectors.text(text);
  }

  /**
   * Click a button or link with specific text
   */
  async clickButtonOrLink(text: string) {
    const element = this.page.locator(`${selectors.button(text)}, ${selectors.link(text)}`).first();
    await element.click();
  }

  /**
   * Click a button with specific text
   */
  async clickButton(text: string) {
    await this.selectors.button(text).first().click();
  }

  /**
   * Enter text in a field identified by name, placeholder, or label
   */
  async enterInField(text: string, fieldName: string) {
    // Try to find input by data-testid, name, placeholder, aria-label
    const input = this.page.locator(`[data-testid="input-${fieldName}"], input[name="${fieldName}"], input[placeholder="${fieldName}"], input[aria-label="${fieldName}"], input[id="${fieldName.toLowerCase().replace(/\s+/g, '-')}"]`).first();
    
    if (await input.count() === 0) {
      // Try to find by label
      const label = this.page.locator(`[data-testid="label-${fieldName}"], label:has-text("${fieldName}")`).first();
      const labelId = await label.getAttribute('for');
      await this.page.locator(`#${labelId}`).fill(text);
    } else {
      await input.fill(text);
    }
  }

  /**
   * Open a section (accordion, tab, etc) by its title
   */
  async openSection(sectionName: string) {
    await this.selectors.section(sectionName).first().click();
  }

  /**
   * Click on a button within an item (row, card, etc) containing specific text
   */
  async clickButtonInItem(buttonText: string, itemText: string) {
    const row = this.selectors.listItem(itemText).first();
    await row.locator(selectors.button(buttonText)).click();
  }

  /**
   * Confirm action in a dialog
   */
  async confirmAction() {
    await this.dialogHelper.confirmAction();
  }

  /**
   * Cancel action in a dialog
   */
  async cancelAction() {
    await this.dialogHelper.cancelAction();
  }
}