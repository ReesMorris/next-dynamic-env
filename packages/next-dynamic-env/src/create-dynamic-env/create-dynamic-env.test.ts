import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDynamicEnv } from './create-dynamic-env';

describe('createDynamicEnv', () => {
  beforeEach(() => {
    // Clean up window object before each test (if defined)
    if (typeof window !== 'undefined') {
      Object.keys(window).forEach(key => {
        if (key.startsWith('__') && key.includes('ENV')) {
          delete (window as any)[key];
        }
      });
    }
  });

  describe('server-side behavior', () => {
    beforeEach(() => {
      // Mock server environment
      vi.stubGlobal('window', undefined);
    });

    it('should return original environment variables on server', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      };

      const dynamicEnv = createDynamicEnv(envVars);

      expect(dynamicEnv.API_URL).toBe('https://api.example.com');
      expect(dynamicEnv.APP_NAME).toBe('Test App');
    });

    it('should handle undefined values on server', () => {
      const envVars = {
        API_URL: undefined,
        APP_NAME: 'Test App'
      };

      const dynamicEnv = createDynamicEnv(envVars);

      expect(dynamicEnv.API_URL).toBeUndefined();
      expect(dynamicEnv.APP_NAME).toBe('Test App');
    });
  });

  describe('client-side behavior', () => {
    beforeEach(() => {
      // Restore window for client tests
      vi.unstubAllGlobals();
    });

    it('should read from window object when available on client', () => {
      const envVars = {
        API_URL: 'https://build-time.com',
        APP_NAME: 'Build Time App'
      };

      // Set runtime values on window
      (window as any).__NEXT_DYNAMIC_ENV__ = {
        API_URL: 'https://runtime.com',
        APP_NAME: 'Runtime App'
      };

      const dynamicEnv = createDynamicEnv(envVars);

      expect(dynamicEnv.API_URL).toBe('https://runtime.com');
      expect(dynamicEnv.APP_NAME).toBe('Runtime App');
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

      const dynamicEnv = createDynamicEnv(envVars);

      expect(dynamicEnv.API_URL).toBe('https://runtime.com');
      expect(dynamicEnv.APP_NAME).toBe('Build Time App');
      expect(dynamicEnv.MISSING_IN_WINDOW).toBe('only-build-time');
    });

    it('should use custom variable name when provided', () => {
      const envVars = {
        API_URL: 'https://build-time.com'
      };

      // Set runtime values with custom var name
      (window as any).MY_CUSTOM_ENV = {
        API_URL: 'https://custom-runtime.com'
      };

      const dynamicEnv = createDynamicEnv(envVars, {
        varName: 'MY_CUSTOM_ENV'
      });

      expect(dynamicEnv.API_URL).toBe('https://custom-runtime.com');
    });

    it('should handle non-existent window variable gracefully', () => {
      const envVars = {
        API_URL: 'https://build-time.com',
        APP_NAME: 'Build Time App'
      };

      // No window variable set
      const dynamicEnv = createDynamicEnv(envVars);

      expect(dynamicEnv.API_URL).toBe('https://build-time.com');
      expect(dynamicEnv.APP_NAME).toBe('Build Time App');
    });
  });

  describe('proxy behavior', () => {
    it('should return undefined for non-string keys', () => {
      const envVars = { API_URL: 'https://api.example.com' };
      const dynamicEnv = createDynamicEnv(envVars);

      const symbolKey = Symbol('test');
      expect((dynamicEnv as any)[symbolKey]).toBeUndefined();
    });

    it('should return undefined for non-existent keys', () => {
      const envVars = { API_URL: 'https://api.example.com' };
      const dynamicEnv = createDynamicEnv(envVars);

      expect((dynamicEnv as any).NON_EXISTENT).toBeUndefined();
    });

    it('should maintain readonly behavior', () => {
      const envVars = { API_URL: 'https://api.example.com' };
      const dynamicEnv = createDynamicEnv(envVars);

      // TypeScript should prevent this, but test runtime behavior
      expect(() => {
        (dynamicEnv as any).API_URL = 'new-value';
      }).not.toThrow();

      // Value should remain unchanged (proxy doesn't have a set trap)
      expect(dynamicEnv.API_URL).toBe('https://api.example.com');
    });
  });

  describe('type safety', () => {
    it('should provide proper TypeScript types', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App',
        OPTIONAL_VAR: undefined as string | undefined
      };

      const dynamicEnv = createDynamicEnv(envVars);

      // These should compile without errors
      const apiUrl: string = dynamicEnv.API_URL;
      const appName: string = dynamicEnv.APP_NAME;
      const optional: string | undefined = dynamicEnv.OPTIONAL_VAR;

      expect(apiUrl).toBe('https://api.example.com');
      expect(appName).toBe('Test App');
      expect(optional).toBeUndefined();
    });
  });

  describe('__raw property', () => {
    it('should provide access to raw values via __raw', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      };

      const dynamicEnv = createDynamicEnv(envVars);

      expect(dynamicEnv.__raw).toEqual(envVars);
    });

    it('should return original envVars object from __raw', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      };

      const dynamicEnv = createDynamicEnv(envVars);

      expect(dynamicEnv.__raw).toBe(envVars);
    });
  });
});
