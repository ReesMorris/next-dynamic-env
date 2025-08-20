import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { type IsZodSchema, isZodSchema } from './is-zod-schema';

describe('isZodSchema', () => {
  describe('when checking valid Zod schemas', () => {
    it('should return true for a simple Zod object schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      expect(isZodSchema(schema)).toBe(true);
    });

    it('should return true for an empty Zod object schema', () => {
      const schema = z.object({});
      expect(isZodSchema(schema)).toBe(true);
    });

    it('should return true for a nested Zod object schema', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string()
          })
        })
      });

      expect(isZodSchema(schema)).toBe(true);
    });

    it('should return true for Zod object with optional fields', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
        email: z.string().nullable()
      });

      expect(isZodSchema(schema)).toBe(true);
    });

    it('should return true for Zod object with default values', () => {
      const schema = z.object({
        port: z.number().default(3000),
        host: z.string().default('localhost')
      });

      expect(isZodSchema(schema)).toBe(true);
    });

    it('should return true for Zod object with transforms', () => {
      const schema = z.object({
        port: z.string().transform(val => Number.parseInt(val, 10)),
        enabled: z.string().transform(val => val === 'true')
      });

      expect(isZodSchema(schema)).toBe(true);
    });

    it('should return true for Zod object with refinements', () => {
      const schema = z
        .object({
          password: z.string(),
          confirmPassword: z.string()
        })
        .refine(data => data.password === data.confirmPassword);

      expect(isZodSchema(schema)).toBe(true);
    });

    it('should work with schemas using _def property', () => {
      const schema = z.object({ test: z.string() });
      // Zod objects may have _def property
      if ('_def' in schema) {
        expect(isZodSchema(schema)).toBe(true);
      }
    });

    it('should work with schemas using def property', () => {
      const schema = z.object({ test: z.string() });
      // Some Zod versions may use def instead of _def
      const schemaWithDef = {
        ...schema,
        def: { type: 'object' }
      };
      expect(isZodSchema(schemaWithDef)).toBe(true);
    });
  });

  describe('when checking non-Zod schemas', () => {
    it('should return false for non-object Zod types', () => {
      const stringSchema = z.string();
      const numberSchema = z.number();
      const arraySchema = z.array(z.string());
      const unionSchema = z.union([z.string(), z.number()]);

      expect(isZodSchema(stringSchema)).toBe(false);
      expect(isZodSchema(numberSchema)).toBe(false);
      expect(isZodSchema(arraySchema)).toBe(false);
      expect(isZodSchema(unionSchema)).toBe(false);
    });

    it('should return false for plain objects', () => {
      const plainObject = {
        name: 'test',
        age: 25
      };

      expect(isZodSchema(plainObject)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isZodSchema(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isZodSchema(undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isZodSchema('string')).toBe(false);
      expect(isZodSchema(123)).toBe(false);
      expect(isZodSchema(true)).toBe(false);
      expect(isZodSchema(false)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isZodSchema([])).toBe(false);
      expect(isZodSchema([1, 2, 3])).toBe(false);
    });

    it('should return false for functions', () => {
      const fn = () => {};
      expect(isZodSchema(fn)).toBe(false);
    });

    it('should return false for classes', () => {
      class TestClass {}
      expect(isZodSchema(TestClass)).toBe(false);
      expect(isZodSchema(new TestClass())).toBe(false);
    });

    it('should return false for objects with _def but wrong type', () => {
      const fakeSchema = {
        _def: { type: 'string' }
      };
      expect(isZodSchema(fakeSchema)).toBe(false);
    });

    it('should return false for objects with def but wrong type', () => {
      const fakeSchema = {
        def: { type: 'array' }
      };
      expect(isZodSchema(fakeSchema)).toBe(false);
    });

    it('should return false for objects with no _def or def', () => {
      const fakeSchema = {
        someOtherProp: { type: 'object' }
      };
      expect(isZodSchema(fakeSchema)).toBe(false);
    });
  });

  describe('type guard functionality', () => {
    it('should narrow type correctly when returning true', () => {
      const schema = z.object({ name: z.string() });

      if (isZodSchema(schema)) {
        // TypeScript should recognize schema as z.ZodObject<z.ZodRawShape>
        const result = schema.safeParse({ name: 'test' });
        expect(result.success).toBe(true);
      }
    });

    it('should work as a filter predicate', () => {
      const schemas = [
        z.object({ name: z.string() }),
        z.string(),
        null,
        z.object({ age: z.number() }),
        undefined,
        z.array(z.string())
      ];

      const objectSchemas = schemas.filter(isZodSchema);
      expect(objectSchemas).toHaveLength(2);
    });
  });

  describe('IsZodSchema type helper', () => {
    it('should correctly identify Zod object types at compile time', () => {
      type TestObjectSchema = IsZodSchema<z.ZodObject<{ name: z.ZodString }>>;
      type TestStringSchema = IsZodSchema<z.ZodString>;
      type TestPlainObject = IsZodSchema<{ name: string }>;

      // These are compile-time checks
      const objectCheck: TestObjectSchema = true;
      const stringCheck: TestStringSchema = false;
      const plainCheck: TestPlainObject = false;

      expect(objectCheck).toBe(true);
      expect(stringCheck).toBe(false);
      expect(plainCheck).toBe(false);
    });
  });
});
