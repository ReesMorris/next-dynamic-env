import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateWithZod } from './validate-with-zod';

describe('validateWithZod', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    consoleWarnSpy.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('successful validation', () => {
    it('should return validated data when validation passes', () => {
      const schema = z.object({
        API_URL: z.string().url(),
        PORT: z.string()
      });

      const env = {
        API_URL: 'https://api.example.com',
        PORT: '3000'
      };

      const result = validateWithZod(schema, env);
      expect(result).toEqual(env);
    });

    it('should handle optional fields', () => {
      const schema = z.object({
        REQUIRED: z.string(),
        OPTIONAL: z.string().optional()
      });

      const env = {
        REQUIRED: 'value'
      };

      const result = validateWithZod(schema, env);
      expect(result).toEqual(env);
    });

    it('should handle nullable fields', () => {
      const schema = z.object({
        NULLABLE: z.string().nullable()
      });

      const env = {
        NULLABLE: undefined
      };

      const result = validateWithZod(schema, env);
      expect(result.NULLABLE).toBeUndefined();
    });

    it('should apply default values', () => {
      const schema = z.object({
        PORT: z.string().default('3000'),
        HOST: z.string().default('localhost')
      });

      const env = {};

      const result = validateWithZod(schema, env);
      expect(result).toEqual({
        PORT: '3000',
        HOST: 'localhost'
      });
    });

    it('should apply transformations', () => {
      const schema = z.object({
        PORT: z.string().transform(val => Number.parseInt(val, 10)),
        ENABLED: z.string().transform(val => val === 'true')
      });

      const env = {
        PORT: '8080',
        ENABLED: 'true'
      };

      const result = validateWithZod(schema, env);
      expect(result).toEqual({
        PORT: 8080,
        ENABLED: true
      });
    });

    it('should handle coercion', () => {
      const schema = z.object({
        PORT: z.coerce.number(),
        ENABLED: z.coerce.boolean()
      });

      const env = {
        PORT: '8080',
        ENABLED: 'true'
      };

      const result = validateWithZod(schema, env);
      expect(result).toEqual({
        PORT: 8080,
        ENABLED: true
      });
    });

    it('should validate nested objects', () => {
      const schema = z.object({
        DATABASE_URL: z.string(),
        DATABASE_OPTIONS: z.string().transform(val => JSON.parse(val))
      });

      const env = {
        DATABASE_URL: 'postgres://localhost',
        DATABASE_OPTIONS: '{"ssl": true}'
      };

      const result = validateWithZod(schema, env);
      expect(result).toEqual({
        DATABASE_URL: 'postgres://localhost',
        DATABASE_OPTIONS: { ssl: true }
      });
    });
  });

  describe('validation failures with throw behavior', () => {
    it('should throw in development by default', () => {
      process.env.NODE_ENV = 'development';

      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      expect(() => validateWithZod(schema, env)).toThrow(
        '❌ Environment validation failed:'
      );
    });

    it('should throw when explicitly set to throw', () => {
      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      expect(() => validateWithZod(schema, env, 'throw')).toThrow();
    });

    it('should include field name in error message', () => {
      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      expect(() => validateWithZod(schema, env, 'throw')).toThrow(/API_URL:/);
    });

    it('should include multiple errors in message', () => {
      const schema = z.object({
        API_URL: z.string().url(),
        PORT: z.coerce.number(),
        HOST: z.string().min(1)
      });

      const env = {
        API_URL: 'not-a-url',
        PORT: 'not-a-number',
        HOST: ''
      };

      try {
        validateWithZod(schema, env, 'throw');
        expect.fail('Should have thrown');
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain('API_URL:');
        expect(message).toContain('PORT:');
        expect(message).toContain('HOST:');
      }
    });
  });

  describe('validation failures with warn behavior', () => {
    it('should warn in production by default', () => {
      process.env.NODE_ENV = 'production';

      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      const result = validateWithZod(schema, env);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toEqual(env); // Returns unvalidated env
    });

    it('should warn when explicitly set to warn', () => {
      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      const result = validateWithZod(schema, env, 'warn');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toEqual(env);
    });

    it('should include formatted error in warning', () => {
      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      validateWithZod(schema, env, 'warn');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Environment validation failed:')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('API_URL:')
      );
    });

    it('should return original env when warning', () => {
      const schema = z.object({
        PORT: z.coerce.number()
      });

      const env = {
        PORT: 'not-a-number'
      };

      const result = validateWithZod(schema, env, 'warn');

      expect(result).toBe(env);
      expect(result.PORT).toBe('not-a-number');
    });
  });

  describe('custom error handler', () => {
    it('should call custom error handler on validation failure', () => {
      const errorHandler = vi.fn();

      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      validateWithZod(schema, env, errorHandler);

      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          issues: expect.arrayContaining([
            expect.objectContaining({
              path: ['API_URL']
            })
          ])
        })
      );
    });

    it('should return original env after custom handler', () => {
      const errorHandler = vi.fn();

      const schema = z.object({
        PORT: z.coerce.number()
      });

      const env = {
        PORT: 'not-a-number'
      };

      const result = validateWithZod(schema, env, errorHandler);

      expect(result).toBe(env);
    });

    it('should not throw or warn when using custom handler', () => {
      const errorHandler = vi.fn();

      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      expect(() => validateWithZod(schema, env, errorHandler)).not.toThrow();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should handle errors thrown by custom handler', () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Custom handler error');
      });

      const schema = z.object({
        API_URL: z.string().url()
      });

      const env = {
        API_URL: 'not-a-url'
      };

      expect(() => validateWithZod(schema, env, errorHandler)).toThrow(
        'Custom handler error'
      );
    });
  });

  describe('environment detection', () => {
    it('should use throw in development when onValidationError is not provided', () => {
      process.env.NODE_ENV = 'development';

      const schema = z.object({
        INVALID: z.string().url()
      });

      const env = {
        INVALID: 'not-a-url'
      };

      expect(() => validateWithZod(schema, env)).toThrow();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should use warn in production when onValidationError is not provided', () => {
      process.env.NODE_ENV = 'production';

      const schema = z.object({
        INVALID: z.string().url()
      });

      const env = {
        INVALID: 'not-a-url'
      };

      const result = validateWithZod(schema, env);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toEqual(env);
    });

    it('should use warn in test environment when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      const schema = z.object({
        INVALID: z.string().url()
      });

      const env = {
        INVALID: 'not-a-url'
      };

      const result = validateWithZod(schema, env);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toEqual(env);
    });
  });

  describe('edge cases', () => {
    it('should handle empty environment object', () => {
      const schema = z.object({
        OPTIONAL: z.string().optional()
      });

      const env = {};

      const result = validateWithZod(schema, env);
      expect(result).toEqual({});
    });

    it('should handle environment with extra fields', () => {
      const schema = z.object({
        REQUIRED: z.string()
      });

      const env = {
        REQUIRED: 'value',
        EXTRA: 'should-be-ignored'
      };

      const result = validateWithZod(schema, env);
      // Zod strips unknown keys by default
      expect(result).toEqual({
        REQUIRED: 'value'
      });
    });

    it('should handle undefined values', () => {
      const schema = z.object({
        MAYBE: z.string().optional()
      });

      const env = {
        MAYBE: undefined
      };

      const result = validateWithZod(schema, env);
      expect(result.MAYBE).toBeUndefined();
    });

    it('should handle complex refinements', () => {
      const schema = z
        .object({
          PASSWORD: z.string(),
          CONFIRM_PASSWORD: z.string()
        })
        .refine(data => data.PASSWORD === data.CONFIRM_PASSWORD, {
          message: 'Passwords must match',
          path: ['CONFIRM_PASSWORD']
        });

      const env = {
        PASSWORD: 'secret123',
        CONFIRM_PASSWORD: 'secret456'
      };

      expect(() => validateWithZod(schema, env, 'throw')).toThrow(
        /CONFIRM_PASSWORD: Passwords must match/
      );
    });
  });
});
