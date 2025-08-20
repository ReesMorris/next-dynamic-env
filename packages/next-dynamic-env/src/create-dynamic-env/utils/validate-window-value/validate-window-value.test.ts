import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateWindowValue } from './validate-window-value';

// Mock isZodSchema function
vi.mock('@/validation', () => ({
  isZodSchema: vi.fn(obj => {
    // Real Zod objects have def or _def with type: 'object'
    return (
      obj &&
      typeof obj === 'object' &&
      (('_def' in obj && obj._def?.type === 'object') ||
        ('def' in obj && obj.def?.type === 'object'))
    );
  })
}));

describe('validateWindowValue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV for consistent testing
    process.env.NODE_ENV = 'test';
  });

  describe('without schema', () => {
    it('should return value unchanged when no schema is provided', () => {
      const result = validateWindowValue({
        key: 'API_URL',
        value: 'https://api.example.com'
      });

      expect(result).toBe('https://api.example.com');
    });

    it('should return value unchanged when schema is undefined', () => {
      const result = validateWindowValue({
        key: 'API_URL',
        value: 'https://api.example.com',
        schema: undefined
      });

      expect(result).toBe('https://api.example.com');
    });

    it('should handle null values without schema', () => {
      const result = validateWindowValue({
        key: 'NULLABLE_VAR',
        value: null
      });

      expect(result).toBe(null);
    });

    it('should handle undefined values without schema', () => {
      const result = validateWindowValue({
        key: 'UNDEFINED_VAR',
        value: undefined
      });

      expect(result).toBe(undefined);
    });
  });

  describe('with schema', () => {
    it('should validate and transform string to number', () => {
      const schema = z.object({
        PORT: z.coerce.number()
      });

      const result = validateWindowValue({
        key: 'PORT',
        value: '3000',
        schema
      });

      expect(result).toBe(3000);
      expect(typeof result).toBe('number');
    });

    it('should validate and transform string to boolean', () => {
      const schema = z.object({
        DEBUG: z.coerce.boolean()
      });

      const result = validateWindowValue({
        key: 'DEBUG',
        value: 'true',
        schema
      });

      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    it('should validate URL strings', () => {
      const schema = z.object({
        API_URL: z.string().url()
      });

      const result = validateWindowValue({
        key: 'API_URL',
        value: 'https://api.example.com',
        schema
      });

      expect(result).toBe('https://api.example.com');
    });

    it('should apply transformations', () => {
      const schema = z.object({
        UPPERCASE: z.string().transform(s => s.toUpperCase()),
        FEATURES: z.string().transform(s => s.split(','))
      });

      const uppercaseResult = validateWindowValue({
        key: 'UPPERCASE',
        value: 'hello',
        schema
      });

      expect(uppercaseResult).toBe('HELLO');

      const featuresResult = validateWindowValue({
        key: 'FEATURES',
        value: 'auth,api,ui',
        schema
      });

      expect(featuresResult).toEqual(['auth', 'api', 'ui']);
    });

    it('should apply default values for undefined', () => {
      const schema = z.object({
        PORT: z.coerce.number().default(8080)
      });

      const result = validateWindowValue({
        key: 'PORT',
        value: undefined,
        schema
      });

      expect(result).toBe(8080);
    });

    it('should handle optional fields', () => {
      const schema = z.object({
        OPTIONAL: z.string().optional()
      });

      const result = validateWindowValue({
        key: 'OPTIONAL',
        value: undefined,
        schema
      });

      expect(result).toBeUndefined();
    });
  });

  describe('missing field in schema', () => {
    it('should return value unchanged when key is not in schema', () => {
      const schema = z.object({
        API_URL: z.string()
      });

      const result = validateWindowValue({
        key: 'UNKNOWN_KEY',
        value: 'some-value',
        schema
      });

      expect(result).toBe('some-value');
    });

    it('should not validate fields not defined in schema', () => {
      const schema = z.object({
        DEFINED_FIELD: z.string()
      });

      const result = validateWindowValue({
        key: 'UNDEFINED_FIELD',
        value: 12345, // Would fail validation if it was checked
        schema
      });

      expect(result).toBe(12345);
    });
  });

  describe('error handling', () => {
    describe('throw mode', () => {
      it('should throw error when validation fails with throw mode', () => {
        const schema = z.object({
          API_URL: z.string().url()
        });

        expect(() => {
          validateWindowValue({
            key: 'API_URL',
            value: 'not-a-url',
            schema,
            onValidationError: 'throw'
          });
        }).toThrow('Validation failed for API_URL');
      });

      it('should throw in development by default', () => {
        process.env.NODE_ENV = 'development';

        const schema = z.object({
          PORT: z.coerce.number()
        });

        expect(() => {
          validateWindowValue({
            key: 'PORT',
            value: 'not-a-number',
            schema
          });
        }).toThrow('Validation failed for PORT');
      });
    });

    describe('warn mode', () => {
      it('should warn and return original value when validation fails', () => {
        const consoleSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const schema = z.object({
          API_URL: z.string().url()
        });

        const result = validateWindowValue({
          key: 'API_URL',
          value: 'not-a-url',
          schema,
          onValidationError: 'warn'
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Validation failed for API_URL')
        );
        expect(result).toBe('not-a-url');

        consoleSpy.mockRestore();
      });

      it('should warn in production by default', () => {
        process.env.NODE_ENV = 'production';
        const consoleSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const schema = z.object({
          PORT: z.coerce.number()
        });

        const result = validateWindowValue({
          key: 'PORT',
          value: 'not-a-number',
          schema
        });

        expect(consoleSpy).toHaveBeenCalled();
        expect(result).toBe('not-a-number');

        consoleSpy.mockRestore();
      });
    });

    describe('custom error handler', () => {
      it('should call custom error handler and return original value', () => {
        const errorHandler = vi.fn();

        const schema = z.object({
          API_URL: z.string().url()
        });

        const result = validateWindowValue({
          key: 'API_URL',
          value: 'not-a-url',
          schema,
          onValidationError: errorHandler
        });

        expect(errorHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            issues: expect.any(Array)
          })
        );
        expect(result).toBe('not-a-url');
      });

      it('should pass ZodError object to custom handler', () => {
        const errorHandler = vi.fn();

        const schema = z.object({
          PORT: z.coerce.number().int().positive()
        });

        validateWindowValue({
          key: 'PORT',
          value: '-100',
          schema,
          onValidationError: errorHandler
        });

        const error = errorHandler.mock.calls[0][0];
        expect(error.issues).toBeDefined();
        expect(error.issues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('complex validations', () => {
    it('should handle refinements', () => {
      const schema = z.object({
        PORT: z.coerce.number().refine(val => val >= 1000 && val <= 65535, {
          message: 'Port must be between 1000 and 65535'
        })
      });

      const validResult = validateWindowValue({
        key: 'PORT',
        value: '3000',
        schema
      });

      expect(validResult).toBe(3000);

      expect(() => {
        validateWindowValue({
          key: 'PORT',
          value: '500',
          schema,
          onValidationError: 'throw'
        });
      }).toThrow();
    });

    it('should handle union types', () => {
      const schema = z.object({
        ENV: z.union([
          z.literal('development'),
          z.literal('production'),
          z.literal('test')
        ])
      });

      const result = validateWindowValue({
        key: 'ENV',
        value: 'production',
        schema
      });

      expect(result).toBe('production');

      expect(() => {
        validateWindowValue({
          key: 'ENV',
          value: 'invalid',
          schema,
          onValidationError: 'throw'
        });
      }).toThrow();
    });

    it('should handle enum types', () => {
      const schema = z.object({
        LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error'])
      });

      const result = validateWindowValue({
        key: 'LOG_LEVEL',
        value: 'info',
        schema
      });

      expect(result).toBe('info');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      const schema = z.object({
        EMPTY: z.string().min(0)
      });

      const result = validateWindowValue({
        key: 'EMPTY',
        value: '',
        schema
      });

      expect(result).toBe('');
    });

    it('should handle numeric strings that look like numbers', () => {
      const schema = z.object({
        ID: z.string()
      });

      const result = validateWindowValue({
        key: 'ID',
        value: '12345',
        schema
      });

      expect(result).toBe('12345');
      expect(typeof result).toBe('string');
    });

    it('should handle boolean-like strings without coercion', () => {
      const schema = z.object({
        FLAG: z.string()
      });

      const result = validateWindowValue({
        key: 'FLAG',
        value: 'false',
        schema
      });

      expect(result).toBe('false');
      expect(typeof result).toBe('string');
    });

    it('should handle non-Zod schema objects gracefully', () => {
      const notZodSchema = {
        shape: { API_URL: 'not-a-schema' },
        _def: { typeName: 'NotZodObject' }
      } as any;

      const result = validateWindowValue({
        key: 'API_URL',
        value: 'https://api.example.com',
        schema: notZodSchema
      });

      expect(result).toBe('https://api.example.com');
    });
  });

  describe('error recovery', () => {
    it('should catch and handle unexpected errors', () => {
      const schema = z.object({
        FIELD: z.string()
      });

      // Mock a field that throws unexpectedly
      schema.shape.FIELD = {
        safeParse: () => {
          throw new Error('Unexpected error');
        }
      } as any;

      const result = validateWindowValue({
        key: 'FIELD',
        value: 'test-value',
        schema
      });

      // Should return original value on unexpected error
      expect(result).toBe('test-value');
    });

    it('should re-throw validation errors in throw mode', () => {
      const schema = z.object({
        API_URL: z.string().url()
      });

      expect(() => {
        validateWindowValue({
          key: 'API_URL',
          value: 'invalid',
          schema,
          onValidationError: 'throw'
        });
      }).toThrow('Validation failed');
    });
  });
});
