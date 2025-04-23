import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import createErrorSpy, { getGlobalErrorSpy } from '@utils/errorSpy';

describe('Console Error Spy', () => {
  let errorSpy;

  beforeEach(() => {
    // Create and initialize a fresh error spy for each test
    errorSpy = createErrorSpy().init();
  });

  afterEach(() => {
    // Clean up by resetting the spy after each test
    errorSpy.reset();
  });

  it('should capture console errors', () => {
    // Generate some test errors
    console.error('Test error message');
    console.error('Another error', { data: 'test object' });

    // Check that errors were captured
    const errors = errorSpy.getErrors();
    expect(errors.length).toBe(2);
    expect(errors[0].message).toContain('Test error message');
    expect(errors[1].message).toContain('Another error');
    expect(errors[1].message).toContain('test object');
  });

  it('should detect errors matching patterns', () => {
    console.error('API connection failed with status 500');

    // Test string pattern matching
    expect(errorSpy.hasErrorMatching('API connection')).toBe(true);
    expect(errorSpy.hasErrorMatching('status 500')).toBe(true);
    expect(errorSpy.hasErrorMatching('database error')).toBe(false);

    // Test regex pattern matching
    expect(errorSpy.hasErrorMatching(/status \d+/)).toBe(true);
  });

  it('should clear errors without resetting', () => {
    console.error('Error 1');

    expect(errorSpy.count()).toBe(1);

    errorSpy.clear();
    expect(errorSpy.count()).toBe(0);

    // Should still capture errors after clearing
    console.error('Error 2');
    expect(errorSpy.count()).toBe(1);
  });

  it('should provide a singleton global instance', () => {
    const globalSpy = getGlobalErrorSpy().init();

    console.error('Global error test');

    expect(globalSpy.count()).toBe(1);
    expect(globalSpy.getErrors()[0].message).toContain('Global error test');

    // Clean up
    globalSpy.reset();
  });
});
