import React from 'react';
import { Page } from '@playwright/test';

/**
 * Creates a selector using the preferred strategy
 * Priority: data-testid > aria-label > role+text > id/name > text > css
 */
export function createSelector(element, value) {
  const safeValue = value.replace(/['"]/g, '');
  
  const elementMapping = {
    button: 'button',
    link: 'a',
    input: 'input',
    form: 'form',
    list: 'ul',
    listItem: 'li',
    table: 'table',
    row: 'tr',
    cell: 'td',
    heading: 'h1, h2, h3, h4, h5, h6',
    dialog: '[role="dialog"], .modal, .dialog'
  };
  
  const htmlElement = elementMapping[element] || element;
  
  return `[data-testid="${element}-${safeValue}"], ${htmlElement}:has-text("${safeValue}")`;
}

/**
 * A collection of standardized selectors for common elements
 */
export const selectors = {
  button: (text) => `[data-testid="button-${text}"], button:has-text("${text}")`,
  link: (text) => `[data-testid="link-${text}"], a:has-text("${text}")`,
  form: (name) => `[data-testid="form-${name}"], form[name="${name}"], form[aria-label="${name}"]`,
  input: (name) => `[data-testid="input-${name}"], input[name="${name}"], input[placeholder="${name}"], textarea[name="${name}"]`,
  label: (text) => `[data-testid="label-${text}"], label:has-text("${text}")`,
  list: (name) => `[data-testid="list-${name}"], [aria-label="${name}"]`,
  listItem: (text) => `[data-testid="list-item-${text}"], li:has-text("${text}")`,
  table: (name) => `[data-testid="table-${name}"], table[aria-label="${name}"]`,
  tableHeader: (text) => `[data-testid="table-header-${text}"], th:has-text("${text}")`,
  tableRow: (text) => `[data-testid="table-row-${text}"], tr:has-text("${text}")`,
  tableCell: (rowText, column) => `tr:has-text("${rowText}") td:nth-child(${column})`,
  dialog: (title) => `[data-testid="dialog-${title}"], [role="dialog"][aria-label="${title}"], [role="dialog"] h2:has-text("${title}")`,
  successMessage: (text) => text 
    ? `[data-testid="success-message"]:has-text("${text}"), .text-green-600:has-text("${text}"), .success:has-text("${text}")`
    : `[data-testid="success-message"], .text-green-600, .success`,
  errorMessage: (text) => text
    ? `[data-testid="error-message"]:has-text("${text}"), .text-red-600:has-text("${text}"), .error:has-text("${text}")`
    : `[data-testid="error-message"], .text-red-600, .error`,
  text: (content) => `[data-testid="text-${content}"], text="${content}"`,
  section: (name) => `[data-testid="section-${name}"], section[aria-labelledby="${name}"], h2:has-text("${name}") + div`
};

/**
 * Extends the Page with standardized selector methods
 */
class SelectorHelpers extends React.Component {
  constructor(props) {
    super(props);
    this.page = props.page;
  }

  button(text) {
    return this.page.locator(selectors.button(text));
  }

  link(text) {
    return this.page.locator(selectors.link(text));
  }

  input(name) {
    return this.page.locator(selectors.input(name));
  }

  form(name) {
    return this.page.locator(selectors.form(name));
  }

  list(name) {
    return this.page.locator(selectors.list(name));
  }

  listItem(text) {
    return this.page.locator(selectors.listItem(text));
  }

  table(name) {
    return this.page.locator(selectors.table(name));
  }

  tableRow(text) {
    return this.page.locator(selectors.tableRow(text));
  }

  dialog(title) {
    return this.page.locator(selectors.dialog(title));
  }

  successMessage(text) {
    return this.page.locator(selectors.successMessage(text));
  }

  errorMessage(text) {
    return this.page.locator(selectors.errorMessage(text));
  }

  text(content) {
    return this.page.locator(selectors.text(content));
  }

  section(name) {
    return this.page.locator(selectors.section(name));
  }

  render() {
    return null; // This component does not render anything
  }
}

/**
 * Get a standardized selector helper for a page
 */
export function getSelectors(page) {
  return new SelectorHelpers({ page });
}

export default SelectorHelpers;
