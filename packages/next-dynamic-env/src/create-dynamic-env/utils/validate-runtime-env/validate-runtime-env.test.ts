import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateRuntimeEnv } from './validate-runtime-env';

// Mock the validateWithZod function
vi.mock('@/validation', () => ({
  validateWithZod: vi.fn((schema, env, onValidationError) => {
    // Simple mock implementation
    const result = schema.safeParse(env);

    if (!result.success) {
      const errorHandler = onValidationError ?? 'throw';

      if (errorHandler === 'throw') {
        throw new Error(`Validation failed: ${result.error.message}`);
      } else if (errorHandler === 'warn') {
        console.warn(`Validation failed: ${result.error.message}`);
        return env;
      } else if (typeof errorHandler === 'function') {
        errorHandler(result.error);
        return env;
      }
    }

    return result.data;
  })
}));

describe('validateRuntimeEnv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('skipValidation option', () => {
    it('should return runtimeEnv unchanged when skipValidation is true', () => {
      const schema = z.object({
        API_URL: z.string().url(),
        PORT: z.coerce.number()
      });

      const runtimeEnv = {
        API_URL: 'not-a-valid-url', // Invalid URL
        PORT: 'not-a-number' // Invalid number
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv,
        skipValidation: true
      });

      expect(result).toBe(runtimeEnv);
      expect(result).toEqual({
        API_URL: 'not-a-valid-url',
        PORT: 'not-a-number'
      });
    });

    it('should not call validateWithZod when skipValidation is true', async () => {
      const { validateWithZod } = await import('@/validation');
      const schema = z.object({
        API_URL: z.string()
      });

      const runtimeEnv = {
        API_URL: 'https://api.example.com'
      };

      validateRuntimeEnv({
        schema,
        runtimeEnv,
        skipValidation: true
      });

      expect(validateWithZod).not.toHaveBeenCalled();
    });
  });

  describe('validation with schema', () => {
    it('should validate and transform values with valid input', () => {
      const schema = z.object({
        API_URL: z.string().url(),
        PORT: z.coerce.number(),
        DEBUG: z.coerce.boolean()
      });

      const runtimeEnv = {
        API_URL: 'https://api.example.com',
        PORT: '3000',
        DEBUG: 'true'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      expect(result).toEqual({
        API_URL: 'https://api.example.com',
        PORT: 3000,
        DEBUG: true
      });
    });

    it('should apply default values from schema', () => {
      const schema = z.object({
        API_URL: z.string().default('https://default.com'),
        PORT: z.coerce.number().default(8080),
        DEBUG: z.coerce.boolean().default(false)
      });

      const runtimeEnv = {};

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      expect(result).toEqual({
        API_URL: 'https://default.com',
        PORT: 8080,
        DEBUG: false
      });
    });

    it('should handle optional fields', () => {
      const schema = z.object({
        API_URL: z.string(),
        OPTIONAL_VAR: z.string().optional()
      });

      const runtimeEnv = {
        API_URL: 'https://api.example.com'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      expect(result).toEqual({
        API_URL: 'https://api.example.com'
      });
    });

    it('should handle nullable and nullish fields', () => {
      const schema = z.object({
        API_URL: z.string(),
        NULLABLE_VAR: z.string().nullable().optional(),
        NULLISH_VAR: z.string().nullish()
      });

      const runtimeEnv = {
        API_URL: 'https://api.example.com',
        NULLABLE_VAR: undefined,
        NULLISH_VAR: undefined
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      expect(result.API_URL).toBe('https://api.example.com');
      expect(result.NULLABLE_VAR).toBeUndefined();
      expect(result.NULLISH_VAR).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw error when validation fails with default behavior', () => {
      const schema = z.object({
        API_URL: z.string().url()
      });

      const runtimeEnv = {
        API_URL: 'not-a-url'
      };

      expect(() => {
        validateRuntimeEnv({
          schema,
          runtimeEnv
        });
      }).toThrow('Validation failed');
    });

    it('should throw error when onValidationError is "throw"', () => {
      const schema = z.object({
        API_URL: z.string().url(),
        PORT: z.coerce.number()
      });

      const runtimeEnv = {
        API_URL: 'invalid-url',
        PORT: 'not-a-number'
      };

      expect(() => {
        validateRuntimeEnv({
          schema,
          runtimeEnv,
          onValidationError: 'throw'
        });
      }).toThrow('Validation failed');
    });

    it('should warn and return original env when onValidationError is "warn"', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const schema = z.object({
        API_URL: z.string().url()
      });

      const runtimeEnv = {
        API_URL: 'not-a-url'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv,
        onValidationError: 'warn'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed')
      );
      expect(result).toBe(runtimeEnv);

      consoleSpy.mockRestore();
    });

    it('should call custom error handler when provided', () => {
      const errorHandler = vi.fn();

      const schema = z.object({
        API_URL: z.string().url()
      });

      const runtimeEnv = {
        API_URL: 'not-a-url'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv,
        onValidationError: errorHandler
      });

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          issues: expect.any(Array)
        })
      );
      expect(result).toBe(runtimeEnv);
    });
  });

  describe('complex transforms', () => {
    it('should handle string transforms', () => {
      const schema = z.object({
        FEATURES: z.string().transform(s => s.split(',')),
        UPPERCASE: z.string().transform(s => s.toUpperCase())
      });

      const runtimeEnv = {
        FEATURES: 'auth,api,ui',
        UPPERCASE: 'hello'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      expect(result).toEqual({
        FEATURES: ['auth', 'api', 'ui'],
        UPPERCASE: 'HELLO'
      });
    });

    it('should handle refinements', () => {
      const schema = z.object({
        PORT: z.coerce
          .number()
          .int()
          .positive()
          .refine(val => val >= 1000 && val <= 65535, {
            message: 'Port must be between 1000 and 65535'
          })
      });

      const runtimeEnv = {
        PORT: '3000'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      expect(result).toEqual({
        PORT: 3000
      });
    });

    it('should fail refinements when conditions not met', () => {
      const schema = z.object({
        PORT: z.coerce
          .number()
          .int()
          .positive()
          .refine(val => val >= 1000 && val <= 65535, {
            message: 'Port must be between 1000 and 65535'
          })
      });

      const runtimeEnv = {
        PORT: '500' // Too low
      };

      expect(() => {
        validateRuntimeEnv({
          schema,
          runtimeEnv,
          onValidationError: 'throw'
        });
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty runtimeEnv', () => {
      const schema = z.object({
        OPTIONAL: z.string().optional()
      });

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv: {}
      });

      expect(result).toEqual({});
    });

    it('should handle extra fields not in schema', () => {
      const schema = z.object({
        API_URL: z.string()
      });

      const runtimeEnv = {
        API_URL: 'https://api.example.com',
        EXTRA_FIELD: 'extra-value'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      // By default, Zod strips unknown keys
      expect(result).toEqual({
        API_URL: 'https://api.example.com'
      });
    });

    it('should handle undefined values correctly', () => {
      const schema = z.object({
        REQUIRED: z.string(),
        OPTIONAL: z.string().optional()
      });

      const runtimeEnv = {
        REQUIRED: 'value',
        OPTIONAL: undefined
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      expect(result).toEqual({
        REQUIRED: 'value'
      });
    });
  });

  describe('TypeScript type inference', () => {
    it('should properly type the return value', () => {
      const schema = z.object({
        API_URL: z.string(),
        PORT: z.coerce.number(),
        DEBUG: z.coerce.boolean()
      });

      const runtimeEnv = {
        API_URL: 'https://api.example.com',
        PORT: '3000',
        DEBUG: 'true'
      };

      const result = validateRuntimeEnv({
        schema,
        runtimeEnv
      });

      // TypeScript should infer these types correctly
      // This is more of a compile-time test
      const apiUrl: unknown = result.API_URL;
      const port: unknown = result.PORT;
      const debug: unknown = result.DEBUG;

      expect(typeof apiUrl).toBe('string');
      expect(typeof port).toBe('number');
      expect(typeof debug).toBe('boolean');
    });
  });
});
