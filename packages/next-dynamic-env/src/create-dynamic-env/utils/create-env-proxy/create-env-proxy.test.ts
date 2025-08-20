import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createEnvProxy } from './create-env-proxy';

// Mock the isBrowser utility
vi.mock('@/utils', () => ({
  isBrowser: vi.fn()
}));

// Mock the validateWindowValue utility
vi.mock('../validate-window-value', () => ({
  validateWindowValue: vi.fn()
}));

import { isBrowser } from '@/utils';
import { validateWindowValue } from '../validate-window-value';

describe('createEnvProxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('server-side behavior', () => {
    beforeEach(() => {
      vi.mocked(isBrowser).mockReturnValue(false);
    });

    it('should return original environment variables on server', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.API_URL).toBe('https://api.example.com');
      expect(proxy.APP_NAME).toBe('Test App');
    });

    it('should handle undefined values on server', () => {
      const envVars = {
        API_URL: undefined,
        APP_NAME: 'Test App'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.API_URL).toBeUndefined();
      expect(proxy.APP_NAME).toBe('Test App');
    });

    it('should not call validateWindowValue on server', () => {
      const envVars = {
        API_URL: 'https://api.example.com'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__',
        schema: z.object({
          API_URL: z.string().url()
        })
      });

      const value = proxy.API_URL;
      expect(value).toBe('https://api.example.com');
      expect(validateWindowValue).not.toHaveBeenCalled();
    });
  });

  describe('client-side behavior', () => {
    beforeEach(() => {
      vi.mocked(isBrowser).mockReturnValue(true);
      vi.mocked(validateWindowValue).mockImplementation(({ value }) => value);
    });

    it('should read from window object when available', () => {
      const envVars = {
        API_URL: 'https://build-time.com',
        APP_NAME: 'Build Time App'
      };

      // Set runtime values on window
      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: 'https://runtime.com',
        APP_NAME: 'Runtime App'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.API_URL).toBe('https://runtime.com');
      expect(proxy.APP_NAME).toBe('Runtime App');
    });

    it('should fallback to build-time values when not in window', () => {
      const envVars = {
        API_URL: 'https://build-time.com',
        APP_NAME: 'Build Time App',
        MISSING_IN_WINDOW: 'only-build-time'
      };

      // Set partial runtime values
      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: 'https://runtime.com'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.API_URL).toBe('https://runtime.com');
      expect(proxy.APP_NAME).toBe('Build Time App');
      expect(proxy.MISSING_IN_WINDOW).toBe('only-build-time');
    });

    it('should use custom variable name', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      // Set runtime values with custom var name
      (window as any).MY_CUSTOM_ENV = {
        API_URL: 'https://custom-runtime.com'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: 'MY_CUSTOM_ENV'
      });

      expect(proxy.API_URL).toBe('https://custom-runtime.com');
    });

    it('should handle non-existent window variable gracefully', () => {
      const envVars = {
        API_URL: 'https://build-time.com',
        APP_NAME: 'Build Time App'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.API_URL).toBe('https://build-time.com');
      expect(proxy.APP_NAME).toBe('Build Time App');
    });

    it('should validate window values when schema is provided', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      const schema = z.object({
        API_URL: z.string().url()
      });

      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: 'https://runtime.com'
      };

      vi.mocked(validateWindowValue).mockReturnValue('https://validated.com');

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__',
        schema,
        onValidationError: 'warn'
      });

      expect(proxy.API_URL).toBe('https://validated.com');
      expect(validateWindowValue).toHaveBeenCalledWith({
        key: 'API_URL',
        value: 'https://runtime.com',
        schema,
        onValidationError: 'warn'
      });
    });

    it('should not validate when schema is not provided', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: 'https://runtime.com'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.API_URL).toBe('https://runtime.com');
      expect(validateWindowValue).toHaveBeenCalledWith({
        key: 'API_URL',
        value: 'https://runtime.com',
        schema: undefined,
        onValidationError: undefined
      });
    });
  });

  describe('proxy behavior', () => {
    beforeEach(() => {
      vi.mocked(isBrowser).mockReturnValue(false);
    });

    it('should return undefined for non-string keys', () => {
      const envVars = { API_URL: 'https://api.example.com' };
      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      const symbolKey = Symbol('test');
      expect((proxy as any)[symbolKey]).toBeUndefined();
    });

    it('should return undefined for non-existent keys', () => {
      const envVars = { API_URL: 'https://api.example.com' };
      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect((proxy as any).NON_EXISTENT).toBeUndefined();
    });

    it('should handle numeric keys as strings', () => {
      const envVars = { '123': 'numeric-key-value' };
      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect((proxy as any)[123]).toBe('numeric-key-value');
      expect((proxy as any)['123']).toBe('numeric-key-value');
    });
  });

  describe('__raw property', () => {
    beforeEach(() => {
      vi.mocked(isBrowser).mockReturnValue(false);
    });

    it('should provide access to raw values via __raw', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.__raw).toEqual(envVars);
    });

    it('should return the same object reference for __raw', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      expect(proxy.__raw).toBe(envVars);
    });

    it('should not be affected by window values for __raw', () => {
      vi.mocked(isBrowser).mockReturnValue(true);

      const envVars = {
        API_URL: 'https://build-time.com',
        APP_NAME: 'Build Time App'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: 'https://runtime.com',
        APP_NAME: 'Runtime App'
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      // __raw should still return the original envVars
      expect(proxy.__raw).toBe(envVars);
      expect(proxy.__raw).toEqual({
        API_URL: 'https://build-time.com',
        APP_NAME: 'Build Time App'
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      vi.mocked(isBrowser).mockReturnValue(true);
      vi.mocked(validateWindowValue).mockImplementation(({ value }) => value);
    });

    it('should handle window object with null values', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: null
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      // null is considered a defined value, so it uses the window value
      expect(proxy.API_URL).toBe(null);
    });

    it('should handle window object with empty string values', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: ''
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      // Should use window value even if it's an empty string
      expect(proxy.API_URL).toBe('');
    });

    it('should handle window object with false boolean values', () => {
      const envVars = {
        FEATURE_FLAG: 'true'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = {
        FEATURE_FLAG: false
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      // Should use window value even if it's false
      expect(proxy.FEATURE_FLAG).toBe(false);
    });

    it('should handle window object with zero numeric values', () => {
      const envVars = {
        PORT: '3000'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = {
        PORT: 0
      };

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      // Should use window value even if it's 0
      expect(proxy.PORT).toBe(0);
    });

    it('should handle window object being null', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = null;

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      // Should fallback to build-time value
      expect(proxy.API_URL).toBe('https://build-time.com');
    });

    it('should handle window object being a non-object value', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      (window as any).__NEXT_DYNAMIC_ENV__ = 'not-an-object';

      const proxy = createEnvProxy({
        envVars,
        varName: '__NEXT_DYNAMIC_ENV__'
      });

      // Should fallback to build-time value
      expect(proxy.API_URL).toBe('https://build-time.com');
    });
  });
});
