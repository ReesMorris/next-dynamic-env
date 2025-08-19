import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isBrowser } from './is-browser';

describe('isBrowser', () => {
  describe('client-side environment', () => {
    it('should return true when window is defined', () => {
      // In test environment, window is defined by happy-dom
      expect(isBrowser()).toBe(true);
    });

    it('should return true for various window states', () => {
      // Test with empty window object
      vi.stubGlobal('window', {});
      expect(isBrowser()).toBe(true);

      // Test with populated window object
      vi.stubGlobal('window', {
        location: { href: 'http://example.com' },
        document: {}
      });
      expect(isBrowser()).toBe(true);

      vi.unstubAllGlobals();
    });
  });

  describe('server-side environment', () => {
    beforeEach(() => {
      // Mock server environment by removing window
      vi.stubGlobal('window', undefined);
    });

    afterEach(() => {
      // Restore window
      vi.unstubAllGlobals();
    });

    it('should return false when window is undefined', () => {
      expect(isBrowser()).toBe(false);
    });

    it('should handle typeof check correctly', () => {
      // Ensure the function uses typeof to avoid ReferenceError
      // This test verifies the implementation doesn't throw
      expect(() => isBrowser()).not.toThrow();
      expect(isBrowser()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should be a pure function with consistent results', () => {
      const result1 = isBrowser();
      const result2 = isBrowser();
      const result3 = isBrowser();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should not be affected by other global variables', () => {
      // Set various globals that might exist in different environments
      vi.stubGlobal('global', {});
      vi.stubGlobal('process', { env: {} });
      vi.stubGlobal('navigator', {});

      // Should still return true as window is defined
      expect(isBrowser()).toBe(true);

      // Now remove window
      vi.stubGlobal('window', undefined);

      // Should return false regardless of other globals
      expect(isBrowser()).toBe(false);

      vi.unstubAllGlobals();
    });
  });
});
