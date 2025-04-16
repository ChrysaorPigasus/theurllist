import React from 'react';
import { Before, After } from '@cucumber/cucumber';
import { CustomWorldClass } from '@tests/bdd/support/world';

Before(async function() {
  await this.setup();
});

After(async function() {
  await this.teardown();
});