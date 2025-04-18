import React from 'react';
import { Page, expect } from '@playwright/test';
import { DialogHelper } from '@tests/utils/dialog-helper';

class UIInteractions extends React.Component {
  constructor(props) {
    super(props);
    this.page = props.page;
    this.dialogHelper = props.dialogHelper;
  }

  async clickButton(text) {
    await this.page.locator(`[data-testid="button-${text}"], button:has-text("${text}")`).first().click();
  }

  async clickLink(text) {
    await this.page.locator(`[data-testid="link-${text}"], a:has-text("${text}")`).first().click();
  }

  async clickButtonOrLink(text) {
    await this.page.locator(`[data-testid="button-${text}"], [data-testid="link-${text}"], button:has-text("${text}"), a:has-text("${text}")`).first().click();
  }

  async clickButtonInItem(buttonText, itemText) {
    const item = this.page.locator(`[data-testid="list-item-${itemText}"], tr:has-text("${itemText}"), li:has-text("${itemText}")`).first();
    await item.locator(`[data-testid="button-${buttonText}"], button:has-text("${buttonText}")`).click();
  }

  async typeInField(text, fieldName) {
    await this.page.locator(`[data-testid="input-${fieldName}"], input[name="${fieldName}"], input[placeholder="${fieldName}"], textarea[name="${fieldName}"]`).fill(text);
  }

  async clearField(fieldName) {
    await this.page.locator(`[data-testid="input-${fieldName}"], input[name="${fieldName}"], textarea[name="${fieldName}"]`).clear();
  }

  async selectOption(selectName, optionText) {
    await this.page.locator(`[data-testid="select-${selectName}"], select[name="${selectName}"]`).selectOption({ label: optionText });
  }

  async setCheckbox(checkboxName, checked) {
    const checkbox = this.page.locator(`[data-testid="checkbox-${checkboxName}"], input[type="checkbox"][name="${checkboxName}"]`);
    if ((await checkbox.isChecked()) !== checked) {
      await checkbox.click();
    }
  }

  async openSection(sectionName) {
    await this.page.locator(`[data-testid="section-${sectionName}"], h2:has-text("${sectionName}"), h3:has-text("${sectionName}")`).first().click();
  }

  async confirmAction() {
    await this.dialogHelper.confirmAction();
  }

  async cancelAction() {
    await this.dialogHelper.cancelAction();
  }

  async verifyTextVisible(text) {
    await expect(this.page.locator(`text="${text}"`)).toBeVisible();
  }

  async verifyTextNotVisible(text) {
    await expect(this.page.locator(`text="${text}"`)).not.toBeVisible();
  }

  async verifyElementVisible(selector) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async verifyElementNotVisible(selector) {
    await expect(this.page.locator(selector)).not.toBeVisible();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector, timeout = 30000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async dragAndDrop(sourceSelector, targetSelector) {
    await this.page.dragAndDrop(sourceSelector, targetSelector);
  }

  async hoverElement(selector) {
    await this.page.hover(selector);
  }

  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }

  render() {
    return null; // This component does not render anything
  }
}

export default UIInteractions;
