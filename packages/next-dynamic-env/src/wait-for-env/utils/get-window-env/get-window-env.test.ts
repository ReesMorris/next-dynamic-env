import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getWindowEnv } from './get-window-env';

describe('getWindowEnv', () => {
  describe('in browser environment', () => {
    beforeEach(() => {
      // Clean up window object
      if (typeof window !== 'undefined') {
        delete (window as any).__TEST_ENV__;
      }
    });

    afterEach(() => {
      // Clean up
      if (typeof window !== 'undefined') {
        delete (window as any).__TEST_ENV__;
      }
    });

    it('should return undefined when variable does not exist', () => {
      const result = getWindowEnv('NON_EXISTENT_VAR');
      expect(result).toBeUndefined();
    });

    it('should return the value when variable exists', () => {
      const testEnv = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'TestApp'
      };
      (window as any).__TEST_ENV__ = testEnv;

      const result = getWindowEnv('__TEST_ENV__');
      expect(result).toEqual(testEnv);
    });

    it('should work with typed generics', () => {
      interface TestEnv {
        API_URL: string;
        PORT: number;
      }

      const testEnv: TestEnv = {
        API_URL: 'https://api.example.com',
        PORT: 3000
      };
      (window as any).__TEST_ENV__ = testEnv;

      const result = getWindowEnv<TestEnv>('__TEST_ENV__');
      expect(result).toEqual(testEnv);

      // TypeScript should recognize the type
      if (result) {
        const url: string = result.API_URL;
        const port: number = result.PORT;
        expect(url).toBe('https://api.example.com');
        expect(port).toBe(3000);
      }
    });

    it('should handle null values', () => {
      (window as any).__TEST_ENV__ = null;

      const result = getWindowEnv('__TEST_ENV__');
      expect(result).toBeNull();
    });

    it('should handle undefined values', () => {
      (window as any).__TEST_ENV__ = undefined;

      const result = getWindowEnv('__TEST_ENV__');
      expect(result).toBeUndefined();
    });

    it('should handle primitive values', () => {
      (window as any).__TEST_STRING__ = 'test string';
      (window as any).__TEST_NUMBER__ = 42;
      (window as any).__TEST_BOOLEAN__ = true;

      expect(getWindowEnv('__TEST_STRING__')).toBe('test string');
      expect(getWindowEnv('__TEST_NUMBER__')).toBe(42);
      expect(getWindowEnv('__TEST_BOOLEAN__')).toBe(true);

      // Clean up
      delete (window as any).__TEST_STRING__;
      delete (window as any).__TEST_NUMBER__;
      delete (window as any).__TEST_BOOLEAN__;
    });

    it('should handle arrays', () => {
      const testArray = ['item1', 'item2', 'item3'];
      (window as any).__TEST_ARRAY__ = testArray;

      const result = getWindowEnv('__TEST_ARRAY__');
      expect(result).toEqual(testArray);

      // Clean up
      delete (window as any).__TEST_ARRAY__;
    });

    it('should handle nested objects', () => {
      const nestedEnv = {
        api: {
          url: 'https://api.example.com',
          timeout: 5000
        },
        features: {
          enabled: ['feature1', 'feature2']
        }
      };
      (window as any).__NESTED_ENV__ = nestedEnv;

      const result = getWindowEnv('__NESTED_ENV__');
      expect(result).toEqual(nestedEnv);

      // Clean up
      delete (window as any).__NESTED_ENV__;
    });

    it('should handle empty string variable names', () => {
      (window as any)[''] = 'empty key value';

      const result = getWindowEnv('');
      expect(result).toBe('empty key value');

      // Clean up
      delete (window as any)[''];
    });

    it('should handle special character variable names', () => {
      const specialName = '__$TEST-ENV.VAR@123__';
      (window as any)[specialName] = 'special value';

      const result = getWindowEnv(specialName);
      expect(result).toBe('special value');

      // Clean up
      delete (window as any)[specialName];
    });
  });

  describe('in server environment', () => {
    it('should return undefined when window is not defined', () => {
      // Save original window
      const originalWindow = global.window;

      // Remove window to simulate server environment
      // @ts-expect-error
      delete global.window;

      const result = getWindowEnv('ANY_VAR');
      expect(result).toBeUndefined();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('error handling', () => {
    it('should handle access errors gracefully', () => {
      // Create a property that throws on access
      Object.defineProperty(window, '__ERROR_VAR__', {
        get() {
          throw new Error('Access denied');
        },
        configurable: true
      });

      const result = getWindowEnv('__ERROR_VAR__');
      expect(result).toBeUndefined();

      // Clean up
      delete (window as any).__ERROR_VAR__;
    });

    it('should handle circular references', () => {
      const circular: any = { prop: 'value' };
      circular.self = circular;

      (window as any).__CIRCULAR__ = circular;

      const result = getWindowEnv('__CIRCULAR__');
      expect(result).toBe(circular);
      expect(result).toHaveProperty('prop', 'value');
      expect(result).toHaveProperty('self');

      // Clean up
      delete (window as any).__CIRCULAR__;
    });
  });
});
