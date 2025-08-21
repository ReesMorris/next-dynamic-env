import { isBrowser } from '@/utils/is-browser/is-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleValidationErrors } from './handle-validation-errors';

vi.mock('@/utils/is-browser/is-browser', () => ({
  isBrowser: vi.fn(() => false)
}));

vi.mock('./create-plain-message', () => ({
  createPlainMessage: vi.fn(
    (errors: any) => `Plain message: ${errors.length} errors`
  )
}));

vi.mock('./create-pretty-message', () => ({
  createPrettyMessage: vi.fn(
    (errors: any) => `Pretty message: ${errors.length} errors`
  )
}));

describe('handleValidationErrors', () => {
  const originalExit = process.exit;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    vi.clearAllMocks();
    process.exit = vi.fn() as any;
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    process.exit = originalExit;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('when skipValidation is true', () => {
    it('should do nothing regardless of errors', () => {
      const errors = [{ key: 'API_URL', error: new Error('Invalid') }];

      handleValidationErrors(errors, 'throw', true);

      expect(process.exit).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('when errors array is empty', () => {
    it('should do nothing', () => {
      handleValidationErrors([], 'throw', false);

      expect(process.exit).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('when onValidationError is "throw"', () => {
    describe('in Node environment', () => {
      beforeEach(() => {
        vi.mocked(isBrowser).mockReturnValue(false);
      });

      it('should console.error pretty message and exit process', () => {
        const errors = [{ key: 'API_URL', error: new Error('Invalid') }];

        handleValidationErrors(errors, 'throw', false);

        expect(console.error).toHaveBeenCalledWith('Pretty message: 1 errors');
        expect(process.exit).toHaveBeenCalledWith(1);
      });
    });

    describe('in browser environment', () => {
      beforeEach(() => {
        vi.mocked(isBrowser).mockReturnValue(true);
      });

      it('should throw error with plain message', () => {
        const errors = [{ key: 'API_URL', error: new Error('Invalid') }];

        expect(() => handleValidationErrors(errors, 'throw', false)).toThrow(
          'Plain message: 1 errors'
        );

        expect(console.error).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
      });
    });
  });

  describe('when onValidationError is "warn"', () => {
    describe('in Node environment', () => {
      beforeEach(() => {
        vi.mocked(isBrowser).mockReturnValue(false);
      });

      it('should console.warn pretty message', () => {
        const errors = [{ key: 'API_URL', error: new Error('Invalid') }];

        handleValidationErrors(errors, 'warn', false);

        expect(console.warn).toHaveBeenCalledWith('Pretty message: 1 errors');
        expect(console.error).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
      });
    });

    describe('in browser environment', () => {
      beforeEach(() => {
        vi.mocked(isBrowser).mockReturnValue(true);
      });

      it('should console.warn plain message', () => {
        const errors = [{ key: 'API_URL', error: new Error('Invalid') }];

        handleValidationErrors(errors, 'warn', false);

        expect(console.warn).toHaveBeenCalledWith('Plain message: 1 errors');
        expect(console.error).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
      });
    });
  });

  describe('when onValidationError is a custom function', () => {
    it('should call custom function with Error containing plain message', () => {
      const customHandler = vi.fn();
      const errors = [{ key: 'API_URL', error: new Error('Invalid') }];

      handleValidationErrors(errors, customHandler, false);

      expect(customHandler).toHaveBeenCalledOnce();
      const calledError = customHandler.mock.calls[0][0];
      expect(calledError).toBeInstanceOf(Error);
      expect(calledError.message).toBe('Plain message: 1 errors');

      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should work in both browser and Node', () => {
      const customHandler = vi.fn();
      const errors = [{ key: 'API_URL', error: new Error('Invalid') }];

      // Test in Node
      vi.mocked(isBrowser).mockReturnValue(false);
      handleValidationErrors(errors, customHandler, false);

      // Test in browser
      vi.mocked(isBrowser).mockReturnValue(true);
      handleValidationErrors(errors, customHandler, false);

      expect(customHandler).toHaveBeenCalledTimes(2);
      expect(customHandler.mock.calls[0][0].message).toBe(
        'Plain message: 1 errors'
      );
      expect(customHandler.mock.calls[1][0].message).toBe(
        'Plain message: 1 errors'
      );
    });
  });

  describe('with multiple errors', () => {
    it('should handle multiple errors correctly', () => {
      const errors = [
        { key: 'API_URL', error: new Error('Invalid URL') },
        { key: 'PORT', error: new Error('Must be number') },
        { key: 'SECRET', error: new Error('Required') }
      ];

      vi.mocked(isBrowser).mockReturnValue(false);
      handleValidationErrors(errors, 'throw', false);

      expect(console.error).toHaveBeenCalledWith('Pretty message: 3 errors');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
