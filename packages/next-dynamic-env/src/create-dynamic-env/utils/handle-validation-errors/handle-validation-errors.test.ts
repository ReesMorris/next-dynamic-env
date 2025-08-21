import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleValidationErrors } from './handle-validation-errors';

describe('handleValidationErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when onValidationError is "throw"', () => {
    it('should throw an error with formatted message when there are errors', () => {
      const errors = [
        { key: 'API_URL', error: new Error('Invalid URL format') },
        { key: 'PORT', error: new Error('Must be a positive number') }
      ];

      expect(() => handleValidationErrors(errors, 'throw', false)).toThrowError(
        'Environment validation failed:\n' +
          '  - API_URL: Invalid URL format\n' +
          '  - PORT: Must be a positive number'
      );
    });

    it('should handle non-Error objects in errors', () => {
      const errors = [
        { key: 'API_URL', error: 'String error' },
        { key: 'PORT', error: { message: 'Object error' } }
      ];

      expect(() => handleValidationErrors(errors, 'throw', false)).toThrowError(
        'Environment validation failed:\n' +
          '  - API_URL: String error\n' +
          '  - PORT: [object Object]'
      );
    });
  });

  describe('when onValidationError is "warn"', () => {
    it('should console.warn the error message', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errors = [
        { key: 'DATABASE_URL', error: new Error('Connection failed') }
      ];

      handleValidationErrors(errors, 'warn', false);

      expect(warnSpy).toHaveBeenCalledWith(
        'Environment validation failed:\n  - DATABASE_URL: Connection failed'
      );
    });
  });

  describe('when onValidationError is a custom function', () => {
    it('should call the custom function with formatted error', () => {
      const customHandler = vi.fn();
      const errors = [{ key: 'SECRET', error: new Error('Secret not found') }];

      handleValidationErrors(errors, customHandler, false);

      expect(customHandler).toHaveBeenCalledOnce();
      const calledError = customHandler.mock.calls[0][0];
      expect(calledError).toBeInstanceOf(Error);
      expect(calledError.message).toBe(
        'Environment validation failed:\n  - SECRET: Secret not found'
      );
    });
  });

  describe('edge cases', () => {
    it('should not throw when errors array is empty', () => {
      expect(() => handleValidationErrors([], 'throw', false)).not.toThrow();
    });

    it('should not throw when skipValidation is true', () => {
      const errors = [{ key: 'VAR', error: new Error('Error') }];

      expect(() => handleValidationErrors(errors, 'throw', true)).not.toThrow();
    });

    // Note: Browser check is tested implicitly through integration tests
    // since mocking isBrowser module import is complex

    it('should handle multiple errors with mixed error types', () => {
      const errors = [
        { key: 'VAR1', error: new Error('Error 1') },
        { key: 'VAR2', error: 'String error' },
        { key: 'VAR3', error: null },
        { key: 'VAR4', error: undefined },
        { key: 'VAR5', error: 123 }
      ];

      expect(() => handleValidationErrors(errors, 'throw', false)).toThrowError(
        /VAR1: Error 1.*VAR2: String error.*VAR3: null.*VAR4: undefined.*VAR5: 123/s
      );
    });
  });
});
