import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formatZodError } from './format-zod-error';

describe('formatZodError', () => {
  describe('when given a valid ZodError', () => {
    it('should format a single field error', () => {
      const schema = z.object({
        name: z.string().min(3)
      });
      const result = schema.safeParse({ name: 'ab' });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('❌ Environment validation failed:');
        expect(formatted).toContain('name:');
        // Zod's actual error message format
        expect(formatted.toLowerCase()).toMatch(/too small|at least 3/);
      }
    });

    it('should format multiple field errors', () => {
      const schema = z.object({
        name: z.string().min(3),
        age: z.number(),
        email: z.string().email()
      });
      const result = schema.safeParse({
        name: 'ab',
        age: 'not-a-number',
        email: 'invalid-email'
      });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('❌ Environment validation failed:');
        expect(formatted).toContain('name:');
        expect(formatted).toContain('age:');
        expect(formatted).toContain('email:');
      }
    });

    it('should format nested field errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(3)
          })
        })
      });
      const result = schema.safeParse({
        user: { profile: { name: 'ab' } }
      });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('user.profile.name:');
        expect(formatted.toLowerCase()).toMatch(/too small|at least 3/);
      }
    });

    it('should format array field errors', () => {
      const schema = z.object({
        tags: z.array(z.string().min(2))
      });
      const result = schema.safeParse({
        tags: ['ok', 'a', 'good']
      });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('tags.1:');
        expect(formatted.toLowerCase()).toMatch(/too small|at least 2/);
      }
    });

    it('should handle errors with no path', () => {
      const schema = z.string().min(3);
      const result = schema.safeParse('ab');

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('unknown:');
        expect(formatted.toLowerCase()).toMatch(/too small|at least 3/);
      }
    });

    it('should handle custom error messages', () => {
      const schema = z.object({
        port: z.number()
      });
      const result = schema.safeParse({ port: 'not-a-number' });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('port:');
        // Check for either custom message or default message
        expect(formatted).toMatch(
          /Port must be a number|Invalid input|expected number/
        );
      }
    });

    it('should handle union type errors', () => {
      const schema = z.object({
        value: z.union([z.string(), z.number()])
      });
      const result = schema.safeParse({ value: true });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('value:');
        expect(formatted).toContain('Invalid input');
      }
    });

    it('should handle refinement errors', () => {
      const schema = z
        .object({
          password: z.string(),
          confirmPassword: z.string()
        })
        .refine(data => data.password === data.confirmPassword, {
          message: 'Passwords do not match',
          path: ['confirmPassword']
        });

      const result = schema.safeParse({
        password: 'pass123',
        confirmPassword: 'pass456'
      });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('confirmPassword: Passwords do not match');
      }
    });

    it('should format multiple errors for the same field', () => {
      const schema = z.object({
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain uppercase letter')
          .regex(/[0-9]/, 'Password must contain a number')
      });

      const result = schema.safeParse({ password: 'short' });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('password:');
        // Should have multiple errors for the same field
        const lines = formatted.split('\n');
        const passwordErrors = lines.filter(line => line.includes('password:'));
        expect(passwordErrors.length).toBeGreaterThan(1);
      }
    });

    it('should handle empty issues array', () => {
      const error = {
        issues: [],
        name: 'ZodError',
        errors: []
      } as unknown as z.ZodError;

      const formatted = formatZodError(error);
      expect(formatted).toBe('❌ Environment validation failed:\n\n\n');
    });

    it('should handle issues with no message', () => {
      const error = {
        issues: [
          {
            path: ['field'],
            code: 'custom',
            message: ''
          }
        ],
        name: 'ZodError',
        errors: []
      } as unknown as z.ZodError;

      const formatted = formatZodError(error);
      expect(formatted).toContain('field: validation failed');
    });
  });

  describe('when given an invalid error object', () => {
    it('should handle error with no issues property', () => {
      const error = {} as z.ZodError;
      const formatted = formatZodError(error);
      expect(formatted).toBe(
        '❌ Environment validation failed: [object Object]'
      );
    });

    it('should handle error with non-array issues', () => {
      const error = {
        issues: 'not-an-array'
      } as unknown as z.ZodError;

      const formatted = formatZodError(error);
      expect(formatted).toContain('❌ Environment validation failed:');
    });
  });

  describe('formatting', () => {
    it('should properly indent issue messages', () => {
      const schema = z.object({
        field1: z.string(),
        field2: z.number()
      });
      const result = schema.safeParse({
        field1: 123,
        field2: 'string'
      });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        const lines = formatted.split('\n');
        const issueLine = lines.find(line => line.includes('field1:'));
        expect(issueLine?.startsWith('  ')).toBe(true); // Should be indented
      }
    });

    it('should end with a newline', () => {
      const schema = z.object({
        name: z.string()
      });
      const result = schema.safeParse({ name: 123 });

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted.endsWith('\n')).toBe(true);
      }
    });
  });
});
