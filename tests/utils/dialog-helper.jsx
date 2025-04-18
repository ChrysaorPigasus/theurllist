import React from 'react';
import { Page, Locator } from '@playwright/test';
import { selectors } from '@tests/utils/selector-helper';

class DialogHelper extends React.Component {
  constructor(props) {
    super(props);
    this.page = props.page;
  }

  getConfirmationDialog() {
    return this.page.locator('[data-testid="confirmation-dialog"], [role="dialog"], .dialog, .modal');
  }

  async confirmAction() {
    await this.page.locator('[data-testid="confirm-button"], [data-testid="delete-confirm-button"], button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")').click();
  }

  async cancelAction() {
    await this.page.locator('[data-testid="cancel-button"], button:has-text("Cancel"), button:has-text("No")').click();
  }

  getSuccessMessage(text) {
    return text 
      ? this.page.locator(`[data-testid="success-message"]:has-text("${text}"), .text-green-600:has-text("${text}"), .success:has-text("${text}")`)
      : this.page.locator('[data-testid="success-message"], .text-green-600, .success');
  }

  getErrorMessage(text) {
    return text
      ? this.page.locator(`[data-testid="error-message"]:has-text("${text}"), .text-red-600:has-text("${text}"), .error:has-text("${text}")`)
      : this.page.locator('[data-testid="error-message"], .text-red-600, .error');
  }

  async confirmDeletion() {
    await this.confirmAction();
  }

  async cancelDeletion() {
    await this.cancelAction();
  }

  getDeletionSuccessMessage() {
    return this.getSuccessMessage('deleted');
  }

  render() {
    return null; // This component does not render anything
  }
}

export default DialogHelper;
