import React, { useState, useEffect } from 'react';
import { BrowserContext, Page } from '@playwright/test';

const ConcurrencyHelper = ({ context }) => {
  const [pages, setPages] = useState([]);

  const createNewTab = async () => {
    const page = await context.newPage();
    setPages(prevPages => [...prevPages, page]);
    return page;
  };

  const openUrlInMultipleTabs = async (url, tabCount = 2) => {
    const newPages = [];
    for (let i = 0; i < tabCount; i++) {
      const page = await createNewTab();
      await page.goto(url);
      newPages.push(page);
    }
    return newPages;
  };

  const simulateConcurrentEdits = async (url, editOperations) => {
    const newPages = await openUrlInMultipleTabs(url, editOperations.length);
    let conflicts = false;

    const editPromises = newPages.map(async (page, index) => {
      const op = editOperations[index];
      await page.fill(op.selector, op.value);
      await page.click(op.submitSelector);
      const hasConflict = await page.locator('[data-testid="conflict-message"], .conflict-message, text="conflict"').isVisible();
      if (hasConflict) {
        conflicts = true;
      }
      return { page, success: !hasConflict };
    });

    await Promise.all(editPromises);

    return {
      success: !conflicts,
      conflicts,
      pages: newPages
    };
  };

  const testEditConflictDetection = async (resourceUrl, fieldSelector, submitSelector) => {
    const [page1, page2] = await openUrlInMultipleTabs(resourceUrl, 2);
    await page1.fill(fieldSelector, 'Edit from first tab');
    await page2.fill(fieldSelector, 'Edit from second tab');
    await page2.click(submitSelector);
    await page2.waitForSelector('[data-testid="success-message"], .success-message');
    await page1.click(submitSelector);
    const conflictDetected = await page1.locator(
      '[data-testid="conflict-message"], .conflict-message, text="conflict", text="changed since you started editing"'
    ).isVisible();
    return conflictDetected;
  };

  const testConflictResolution = async (resourceUrl) => {
    const conflictDetected = await testEditConflictDetection(
      resourceUrl,
      '[data-testid="name-input"], input[name="name"]',
      '[data-testid="save-button"], button[type="submit"]'
    );

    if (!conflictDetected) {
      return false;
    }

    const page = pages[0];
    const hasOptions = await page.locator(
      '[data-testid="conflict-options"], .conflict-options, [role="radiogroup"]'
    ).isVisible();

    if (!hasOptions) {
      return false;
    }

    await page.click('[data-testid="keep-mine"], input[value="keep-mine"]');
    await page.click('[data-testid="resolve-conflict-button"], button:has-text("Resolve Conflict")');
    const success = await page.locator(
      '[data-testid="success-message"], .success-message, text="conflict resolved"'
    ).isVisible();

    return success;
  };

  const cleanup = async () => {
    for (const page of pages) {
      await page.close();
    }
    setPages([]);
  };

  return null; // This component does not render anything
};

export default ConcurrencyHelper;
