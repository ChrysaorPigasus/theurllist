import React from 'react';
import { Page } from '@playwright/test';
import { selectors } from '@tests/utils/selector-helper';

class FormHelper extends React.Component {
  constructor(props) {
    super(props);
    this.page = props.page;
  }

  async fillField(fieldName, value) {
    await this.page.locator(`[data-testid="input-${fieldName}"], [name="${fieldName}"], #${fieldName}, [placeholder="${fieldName}"]`).fill(value);
  }

  async clearField(fieldName) {
    await this.page.locator(`[data-testid="input-${fieldName}"], [name="${fieldName}"], #${fieldName}`).clear();
  }

  async getFieldValue(fieldName) {
    return await this.page.locator(`[data-testid="input-${fieldName}"], [name="${fieldName}"], #${fieldName}`).inputValue();
  }

  async isFieldEmpty(fieldName) {
    const value = await this.getFieldValue(fieldName);
    return value === '';
  }

  async fieldHasError(fieldName) {
    const errorSelector = `[data-testid="error-${fieldName}"], #${fieldName}-error, .error:near(#${fieldName})`;
    return await this.page.locator(errorSelector).isVisible();
  }

  async getFieldError(fieldName) {
    const errorSelector = `[data-testid="error-${fieldName}"], #${fieldName}-error, .error:near(#${fieldName})`;
    if (await this.page.locator(errorSelector).isVisible()) {
      return await this.page.locator(errorSelector).textContent();
    }
    return null;
  }

  async isChecked(checkboxName) {
    return await this.page.locator(`[data-testid="checkbox-${checkboxName}"], [name="${checkboxName}"], #${checkboxName}`).isChecked();
  }

  async toggleCheckbox(checkboxName) {
    await this.page.locator(`[data-testid="checkbox-${checkboxName}"], [name="${checkboxName}"], #${checkboxName}`).click();
  }

  async selectOption(selectName, optionValue) {
    await this.page.locator(`[data-testid="select-${selectName}"], [name="${selectName}"], #${selectName}`).selectOption(optionValue);
  }

  async selectOptionByText(selectName, optionText) {
    await this.page.locator(`[data-testid="select-${selectName}"], [name="${selectName}"], #${selectName}`).selectOption({ label: optionText });
  }

  async getSelectedOptionText(selectName) {
    const selectElement = this.page.locator(`[data-testid="select-${selectName}"], [name="${selectName}"], #${selectName}`);
    return await selectElement.evaluate((select) => {
      return select.options[select.selectedIndex]?.text || '';
    });
  }

  async submitForm(formSubmitText = 'Submit') {
    await this.page.locator(`[data-testid="submit-button"], button[type="submit"], button:has-text("${formSubmitText}")`).click();
  }

  async resetForm() {
    await this.page.locator('[data-testid="reset-button"], button[type="reset"], button:has-text("Reset")').click();
  }

  async formHasErrors() {
    return await this.page.locator('[data-testid="form-error"], .form-error, .error-message').isVisible();
  }

  async getFormErrors() {
    const errors = this.page.locator('[data-testid="form-error"], .form-error, .error-message');
    const count = await errors.count();
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text) result.push(text);
    }
    
    return result;
  }

  async fillForm(formData) {
    for (const [field, value] of Object.entries(formData)) {
      await this.fillField(field, value);
    }
  }

  async waitForFormSubmission(successSelector = '[data-testid="success-message"], .success-message') {
    await Promise.race([
      this.page.waitForSelector(successSelector, { state: 'visible', timeout: 10000 }),
      this.page.waitForSelector('[data-testid="form-error"], .form-error, .error-message', { state: 'visible', timeout: 10000 })
    ]);
  }

  render() {
    return null; // This component does not render anything
  }
}

export default FormHelper;
