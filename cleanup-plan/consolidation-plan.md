# Consolidation Plan for Duplicate Test Files

## Overview
This document outlines the plan for removing duplicate test files and standardizing on ES Modules (JSX/TS) format across the test codebase.

## Files to Keep (Primary Format: ES Modules)
- `tests/bdd/support/world.jsx` - Consolidated with functionality from world.cjs
- `tests/bdd/support/hooks.jsx` - Already uses ES Module syntax
- `tests/bdd/playwright.config.jsx` - Already uses ES Module syntax
- `tests/bdd/cucumber-playwright-adapter.spec.jsx` - Already uses ES Module syntax

## Files to Remove (Redundant CommonJS versions)
- `tests/bdd/support/world.cjs` - Functionality consolidated into world.jsx
- `tests/bdd/support/hooks.cjs` - Replaced by hooks.jsx
- `tests/bdd/playwright.config.cjs` - Replaced by playwright.config.jsx
- `tests/bdd/cucumber-playwright-adapter.spec.cjs` - Replaced by cucumber-playwright-adapter.spec.jsx

## Files to Keep (Required for Compatibility)
- `tests/bdd/cucumber-setup.cjs` - Must remain as CJS for Cucumber compatibility

## Step Definition Files
- Keep all `.jsx` files as the primary source
- Generated `.cjs` files should be treated as build artifacts and not edited directly
- Updated the conversion script to add warnings to generated files

## Scripts Updated
- `scripts/convert-steps-to-commonjs.js` - Updated to clarify that ES Module files are the source of truth
- `cucumber.cjs` - Updated with comment to clarify standardization approach

## Verification Steps
Before removing any files, ensure:
1. All BDD tests still run successfully
2. CI pipeline is updated if necessary
3. Documentation is updated to reflect the standardization approach
