import React from 'react';
import { setWorldConstructor, World as CucumberWorld } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { env } from '@utils/environment';

/**
 * World class voor het delen van context tussen Cucumber stappen
 * Dit verbindt Cucumber met Playwright
 */
export class World extends CucumberWorld {
  context: BrowserContext;
  page: Page;
  browser: Browser;

  constructor(options) {
    super(options);
  }

  /**
   * Initialiseert de browser voor de test
   */
  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: 50,
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    return this.page;
  }

  /**
   * Sluit de browser na de test
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(World);

// React component wrapper for testing (example)
export const WorldProvider = ({ children }) => {
  return (
    <div className="test-world-provider">
      {children}
    </div>
  );
};