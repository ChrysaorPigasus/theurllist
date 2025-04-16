import React from 'react';
import { setWorldConstructor } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { env } from '@utils/environment';

export class CustomWorldClass {
  env = env;
  
  constructor(options) {
    Object.assign(this, options);
  }

  async setup() {
    const browser = await chromium.launch({ 
      headless: process.env.CI ? true : false 
    });
    
    this.context = await browser.newContext();
    this.page = await this.context.newPage();
    
    // Log environment information
    console.log(`Running in ${this.env.currentEnv} environment`);
    console.log(`Base URL: ${this.env.baseUrl}`);
  }

  async teardown() {
    if (this.context) await this.context.close();
  }
}

setWorldConstructor(CustomWorldClass);

// React component wrapper for testing (example)
export const WorldProvider = ({ children }) => {
  return (
    <div className="test-world-provider">
      {children}
    </div>
  );
};