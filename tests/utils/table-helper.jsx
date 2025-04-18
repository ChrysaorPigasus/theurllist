import React from 'react';
import { Page } from '@playwright/test';

class TableHelper extends React.Component {
  constructor(props) {
    super(props);
    this.page = props.page;
  }

  getTable(tableName) {
    return this.page.locator(`[data-testid="table-${tableName}"], table[aria-label="${tableName}"], table.${tableName}`);
  }

  getRowWithText(tableName, text) {
    const table = this.getTable(tableName);
    return table.locator(`tr:has-text("${text}")`);
  }

  getCell(tableName, rowIndex, columnIndex) {
    const table = this.getTable(tableName);
    return table.locator(`tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`);
  }

  getCellInRowWithText(tableName, rowText, columnIndex) {
    const row = this.getRowWithText(tableName, rowText);
    return row.locator(`td:nth-child(${columnIndex + 1})`);
  }

  getAllRows(tableName) {
    const table = this.getTable(tableName);
    return table.locator('tbody tr');
  }

  getHeaders(tableName) {
    const table = this.getTable(tableName);
    return table.locator('th');
  }

  getHeaderWithText(tableName, text) {
    const table = this.getTable(tableName);
    return table.locator(`th:has-text("${text}")`);
  }

  async clickHeader(tableName, headerText) {
    const header = this.getHeaderWithText(tableName, headerText);
    await header.click();
  }

  async clickButtonInRow(tableName, rowText, buttonText) {
    const row = this.getRowWithText(tableName, rowText);
    await row.locator(`button:has-text("${buttonText}")`).click();
  }

  async getRowCount(tableName) {
    const rows = this.getAllRows(tableName);
    return await rows.count();
  }

  async tableContains(tableName, text) {
    const table = this.getTable(tableName);
    const matchingRows = table.locator(`tr:has-text("${text}")`);
    return await matchingRows.count() > 0;
  }

  async getColumnValues(tableName, columnIndex) {
    const rows = this.getAllRows(tableName);
    const count = await rows.count();
    const values = [];
    
    for (let i = 0; i < count; i++) {
      const cell = rows.nth(i).locator(`td:nth-child(${columnIndex + 1})`);
      const text = await cell.textContent();
      if (text) values.push(text.trim());
    }
    
    return values;
  }

  async isTableSortedAscending(tableName, columnIndex) {
    const values = await this.getColumnValues(tableName, columnIndex);
    const sortedValues = [...values].sort();
    
    return JSON.stringify(values) === JSON.stringify(sortedValues);
  }

  async isTableSortedDescending(tableName, columnIndex) {
    const values = await this.getColumnValues(tableName, columnIndex);
    const sortedValues = [...values].sort().reverse();
    
    return JSON.stringify(values) === JSON.stringify(sortedValues);
  }

  async rowExistsWithValues(tableName, cellValues) {
    const rows = this.getAllRows(tableName);
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();
      
      if (cellCount !== cellValues.length) continue;
      
      let match = true;
      for (let j = 0; j < cellCount; j++) {
        const cellText = await cells.nth(j).textContent();
        if (cellText?.trim() !== cellValues[j]) {
          match = false;
          break;
        }
      }
      
      if (match) return true;
    }
    
    return false;
  }

  async filterTable(tableName, filterText) {
    const table = this.getTable(tableName);
    const filterInput = this.page.locator('[data-testid="table-filter"], input[type="search"], input[placeholder*="Search"], input[placeholder*="Filter"]').first();
    
    await filterInput.fill(filterText);
  }

  async waitForTableUpdate(tableName) {
    await this.page.waitForSelector('[data-testid="loading-indicator"], .loading', { state: 'hidden', timeout: 5000 }).catch(() => {});
    await this.page.waitForTimeout(300);
  }

  getPagination(tableName) {
    return this.page.locator(`[data-testid="pagination-${tableName}"], [aria-label="pagination"], .pagination`);
  }

  async goToNextPage(tableName) {
    const pagination = this.getPagination(tableName);
    await pagination.locator('[data-testid="next-page"], button:has-text("Next"), .next-page').click();
    await this.waitForTableUpdate(tableName);
  }

  async goToPreviousPage(tableName) {
    const pagination = this.getPagination(tableName);
    await pagination.locator('[data-testid="previous-page"], button:has-text("Previous"), .previous-page').click();
    await this.waitForTableUpdate(tableName);
  }

  async goToPage(tableName, pageNumber) {
    const pagination = this.getPagination(tableName);
    await pagination.locator(`[data-testid="page-${pageNumber}"], button:has-text("${pageNumber}")`).click();
    await this.waitForTableUpdate(tableName);
  }

  render() {
    return null; // This component does not render anything
  }
}

export default TableHelper;
