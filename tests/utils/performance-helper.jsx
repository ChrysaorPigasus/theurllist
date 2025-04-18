import React from 'react';
import { Page } from '@playwright/test';

class PerformanceHelper extends React.Component {
  constructor(props) {
    super(props);
    this.page = props.page;
  }

  async measurePageLoadTime() {
    const startTime = Date.now();
    const timing = await this.page.evaluate(() => {
      return {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoaded: performance.timing.domContentLoadedEventEnd
      };
    });
    return timing.loadEventEnd - timing.navigationStart;
  }

  async measureTimeToInteractive() {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    return Date.now() - startTime;
  }

  generateLargeDataset(count = 100) {
    const dataset = [];
    for (let i = 1; i <= count; i++) {
      dataset.push({
        url: `https://example.com/page-${i}`,
        title: `Example Page ${i}`,
        description: `This is a description for example page ${i}`
      });
    }
    return dataset;
  }

  async createLargeList(listName, urlCount = 100) {
    const dataset = this.generateLargeDataset(urlCount);
    await this.page.evaluate((name, data) => {
      window.testHelpers = window.testHelpers || {};
      window.testHelpers.createTestList = (listName, urls) => {
        console.log(`Created test list "${listName}" with ${urls.length} URLs`);
        localStorage.setItem('performanceTestList', JSON.stringify({
          name: listName,
          urls: urls
        }));
        return true;
      };
      return window.testHelpers.createTestList(name, data);
    }, listName, dataset);
  }

  async assertPageLoadsWithin(url, timeLimit) {
    const startTime = Date.now();
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    return loadTime <= timeLimit;
  }

  async measureRenderingTime(selector) {
    const startTime = Date.now();
    await this.page.waitForSelector(selector, { state: 'visible' });
    return Date.now() - startTime;
  }

  async verifyPagination(listSelector, paginationSelector, itemsPerPage) {
    const itemCount = await this.page.locator(`${listSelector} > *`).count();
    const paginationExists = await this.page.locator(paginationSelector).isVisible();

    if (itemCount <= itemsPerPage && paginationExists) {
      return false;
    }

    if (itemCount > itemsPerPage && !paginationExists) {
      return false;
    }

    if (paginationExists) {
      const firstPageItemCount = await this.page.locator(`${listSelector} > *`).count();
      if (firstPageItemCount > itemsPerPage) {
        return false;
      }

      await this.page.locator(`${paginationSelector} [data-testid="next-page"], ${paginationSelector} .next-page`).click();
      await this.page.waitForTimeout(500);

      const secondPageFirstItem = await this.page.locator(`${listSelector} > *:first-child`).textContent();
      const firstPageFirstItem = await this.page.locator(`${listSelector} > *:first-child`).textContent();

      return secondPageFirstItem !== firstPageFirstItem;
    }

    return true;
  }

  render() {
    return null; // This component does not render anything
  }
}

export default PerformanceHelper;
