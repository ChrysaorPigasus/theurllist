import React from 'react';
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { World } from '@tests/bdd/support/world';

// Start een browser voor elke scenario
Before(async function(this: World) {
  await this.init();
});

// Sluit de browser na elk scenario
After(async function(this: World) {
  await this.close();
});

// Uitvoeren voordat tests beginnen
BeforeAll(async function() {
  // Je zou hier algemene setup kunnen doen, zoals testdatabase voorbereiden
  console.log('Starting BDD Tests...');
});

// Uitvoeren na alle tests
AfterAll(async function() {
  // Cleanup acties zoals testdata verwijderen
  console.log('BDD Tests completed');
});