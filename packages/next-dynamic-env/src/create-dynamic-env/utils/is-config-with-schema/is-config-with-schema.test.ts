import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { isConfigWithSchema } from './is-config-with-schema';

describe('isConfigWithSchema', () => {
  describe('valid config objects', () => {
    it('should return true for a valid config with schema', () => {
      const config = {
        schema: z.object({
          API_URL: z.string()
        }),
        client: {
          API_URL: 'https://api.example.com'
        },
        server: {}
      };

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should return true even with additional properties', () => {
      const config = {
        schema: z.object({
          API_URL: z.string()
        }),
        client: {
          API_URL: 'https://api.example.com'
        },
        server: {},
        onValidationError: 'throw' as const,
        skipValidation: false
      };

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should return true with empty client and server', () => {
      const config = {
        schema: z.object({
          API_URL: z.string().optional()
        }),
        client: {},
        server: {}
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
        client: {
          API_URL: 'https://api.example.com',
          PORT: '3000',
          FEATURES: 'auth,api,ui'
        },
        server: {}
      };

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should return true even without client and server properties', () => {
      const config = {
        schema: z.object({
          API_URL: z.string()
        })
      };

      // Only checks for schema now
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
      expect(isConfigWithSchema(['schema', 'client', 'server'])).toBe(false);
    });

    it('should return false for objects missing schema', () => {
      const config = {
        client: {
          API_URL: 'https://api.example.com'
        },
        server: {}
      };

      expect(isConfigWithSchema(config)).toBe(false);
    });

    it('should return false for empty objects', () => {
      expect(isConfigWithSchema({})).toBe(false);
    });

    it('should return false for objects with wrong property names', () => {
      const config = {
        scheme: z.object({ API_URL: z.string() }), // typo: scheme instead of schema
        client: { API_URL: 'https://api.example.com' },
        server: {}
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
      config.client = { API_URL: 'https://api.example.com' };
      config.server = {};

      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should handle objects with schema as null value', () => {
      const config = {
        schema: null,
        client: null,
        server: null
      };

      // It returns true because it only checks for the presence of 'schema' key, not its value
      expect(isConfigWithSchema(config)).toBe(true);
    });

    it('should handle objects with schema as undefined value', () => {
      const config = {
        schema: undefined,
        client: undefined,
        server: undefined
      };

      // It returns true because it only checks for the presence of 'schema' key, not its value
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
        client: {
          API_URL: 'https://api.example.com'
        },
        server: {}
      };

      if (isConfigWithSchema(unknownValue)) {
        // TypeScript should now know that unknownValue has schema
        // This test verifies that the type guard works at runtime
        expect(unknownValue.schema).toBeDefined();
        // client and server are optional, but if present should be accessible
        if ('client' in unknownValue) {
          expect(unknownValue.client).toBeDefined();
        }
        if ('server' in unknownValue) {
          expect(unknownValue.server).toBeDefined();
        }
      } else {
        // This should not be reached
        expect.fail('Type guard should have returned true');
      }
    });
  });
});
