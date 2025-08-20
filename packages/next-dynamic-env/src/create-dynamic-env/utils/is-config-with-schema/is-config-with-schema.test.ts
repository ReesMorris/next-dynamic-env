import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { isConfigWithSchema } from './is-config-with-schema';

describe('isConfigWithSchema', () => {
  describe('valid config objects', () => {
    it('should return true for a valid config with schema and runtimeEnv', () => {
      const config = {
        schema: z.object({
          API_URL: z.string()
        }),
        runtimeEnv: {
          API_URL: 'https://api.example.com'
        }
      };

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should return true even with additional properties', () => {
      const config = {
        schema: z.object({
          API_URL: z.string()
        }),
        runtimeEnv: {
          API_URL: 'https://api.example.com'
        },
        onValidationError: 'throw' as const,
        varName: 'CUSTOM_ENV',
        skipValidation: false
      };

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should return true with empty runtimeEnv', () => {
      const config = {
        schema: z.object({
          API_URL: z.string().optional()
        }),
        runtimeEnv: {}
      };

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should return true with complex schema', () => {
      const config = {
        schema: z.object({
          API_URL: z.string().url(),
          PORT: z.coerce.number(),
          FEATURES: z.string().transform(s => s.split(','))
        }),
        runtimeEnv: {
          API_URL: 'https://api.example.com',
          PORT: '3000',
          FEATURES: 'auth,api,ui'
        }
      };

      expect(isConfigWithSchema(config)).toBe(true);
    });
  });

  describe('invalid config objects', () => {
    it('should return false for null', () => {
      expect(isConfigWithSchema(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isConfigWithSchema(undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isConfigWithSchema('string')).toBe(false);
      expect(isConfigWithSchema(123)).toBe(false);
      expect(isConfigWithSchema(true)).toBe(false);
      expect(isConfigWithSchema(Symbol('test'))).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isConfigWithSchema([])).toBe(false);
      expect(isConfigWithSchema(['schema', 'runtimeEnv'])).toBe(false);
    });

    it('should return false for objects missing schema', () => {
      const config = {
        runtimeEnv: {
          API_URL: 'https://api.example.com'
        }
      };

      expect(isConfigWithSchema(config)).toBe(false);
    });

    it('should return false for objects missing runtimeEnv', () => {
      const config = {
        schema: z.object({
          API_URL: z.string()
        })
      };

      expect(isConfigWithSchema(config)).toBe(false);
    });

    it('should return false for empty objects', () => {
      expect(isConfigWithSchema({})).toBe(false);
    });

    it('should return false for objects with wrong property names', () => {
      const config = {
        scheme: z.object({ API_URL: z.string() }), // typo: scheme instead of schema
        runtimeEnv: { API_URL: 'https://api.example.com' }
      };

      expect(isConfigWithSchema(config)).toBe(false);
    });

    it('should return false for plain environment variables object', () => {
      const envVars = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'Test App'
      };

      expect(isConfigWithSchema(envVars)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with null prototype', () => {
      const config = Object.create(null);
      config.schema = z.object({ API_URL: z.string() });
      config.runtimeEnv = { API_URL: 'https://api.example.com' };

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should handle objects with schema and runtimeEnv as null values', () => {
      const config = {
        schema: null,
        runtimeEnv: null
      };

      // It returns true because it only checks for the presence of keys, not their values
      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should handle objects with schema and runtimeEnv as undefined values', () => {
      const config = {
        schema: undefined,
        runtimeEnv: undefined
      };

      // It returns true because it only checks for the presence of keys, not their values
      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should work with functions (which are objects)', () => {
      const func = () => {};
      expect(isConfigWithSchema(func)).toBe(false);
    });

    it('should work with Date objects', () => {
      expect(isConfigWithSchema(new Date())).toBe(false);
    });

    it('should work with RegExp objects', () => {
      expect(isConfigWithSchema(/test/)).toBe(false);
    });
  });

  describe('type narrowing', () => {
    it('should properly narrow types in TypeScript', () => {
      const unknownValue: unknown = {
        schema: z.object({
          API_URL: z.string()
        }),
        runtimeEnv: {
          API_URL: 'https://api.example.com'
        }
      };

      if (isConfigWithSchema(unknownValue)) {
        // TypeScript should now know that unknownValue has schema and runtimeEnv
        // This test verifies that the type guard works at runtime
        expect(unknownValue.schema).toBeDefined();
        expect(unknownValue.runtimeEnv).toBeDefined();
      } else {
        // This should not be reached
        expect.fail('Type guard should have returned true');
      }
    });
  });
});
