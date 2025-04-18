
import { setWorldConstructor } from 'cucumber';
import { defineFeature, loadFeature } from 'jest-cucumber';

setWorldConstructor(function() {
  this.context = {};
});
