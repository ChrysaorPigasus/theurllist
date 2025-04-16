import React from 'react';
import { Given } from '@cucumber/cucumber';
import { CustomWorldClass } from '@tests/bdd/support/world';

Given('I am on the homepage', async function() {
  // Uses environment-specific base URL
  await this.page.goto(this.env.baseUrl);
});