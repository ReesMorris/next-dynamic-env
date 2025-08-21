import type { StandardSchemaV1 } from '@standard-schema/spec';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { applyTransformWithoutValidation } from './apply-transform-without-validation';

describe('applyTransformWithoutValidation', () => {
  it('should apply transforms without throwing validation errors', () => {
    const schema = z.coerce.number().default(42);
    const result = applyTransformWithoutValidation(undefined, schema);
    expect(result).toBe(42);
  });

  it('should return transformed value when validation succeeds', () => {
    const schema = z.string().transform(val => val.toUpperCase());
    const result = applyTransformWithoutValidation('hello', schema);
    expect(result).toBe('HELLO');
  });

  it('should return transformed value when coercion succeeds', () => {
    // Zod coerce.number() successfully coerces numeric strings
    const schema = z.coerce.number();
    const result = applyTransformWithoutValidation('123', schema);
    expect(result).toBe(123);
  });

  it('should handle array transforms', () => {
    const schema = z
      .string()
      .optional()
      .transform(val => val?.split(',').filter(Boolean) ?? []);

    const result1 = applyTransformWithoutValidation('a,b,c', schema);
    expect(result1).toEqual(['a', 'b', 'c']);

    const result2 = applyTransformWithoutValidation(undefined, schema);
    expect(result2).toEqual([]);
  });

  it('should handle JSON parsing transforms', () => {
    const schema = z.string().transform(val => {
      try {
        return JSON.parse(val);
      } catch {
        return {};
      }
    });

    const result1 = applyTransformWithoutValidation('{"key":"value"}', schema);
    expect(result1).toEqual({ key: 'value' });

    const result2 = applyTransformWithoutValidation('invalid-json', schema);
    expect(result2).toEqual({});
  });

  it('should return original value if transform throws', () => {
    const schema: StandardSchemaV1<unknown, unknown> = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () => {
          throw new Error('Transform failed');
        }
      }
    };

    const result = applyTransformWithoutValidation('original', schema);
    expect(result).toBe('original');
  });

  it('should return original value for async validation', () => {
    const schema: StandardSchemaV1<unknown, unknown> = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () => Promise.resolve({ value: 'async-result' })
      }
    };

    const result = applyTransformWithoutValidation('original', schema);
    expect(result).toBe('original');
  });

  it('should handle boolean coercion', () => {
    const schema = z.coerce.boolean().default(false);

    expect(applyTransformWithoutValidation('true', schema)).toBe(true);
    // 'false' as a string is truthy in JavaScript, so coerce.boolean() returns true
    expect(applyTransformWithoutValidation('false', schema)).toBe(true);
    expect(applyTransformWithoutValidation('1', schema)).toBe(true);
    expect(applyTransformWithoutValidation('0', schema)).toBe(true);
    expect(applyTransformWithoutValidation('', schema)).toBe(false);
    expect(applyTransformWithoutValidation(undefined, schema)).toBe(false);
  });

  it('should handle complex nested transforms', () => {
    const schema = z
      .string()
      .optional()
      .transform(val => val ?? 'default')
      .transform(val => val.split(','))
      .transform(arr => arr.map(s => s.trim()))
      .transform(arr => arr.filter(s => s.length > 0));

    const result1 = applyTransformWithoutValidation('  a , b , , c  ', schema);
    expect(result1).toEqual(['a', 'b', 'c']);

    const result2 = applyTransformWithoutValidation(undefined, schema);
    expect(result2).toEqual(['default']);
  });

  it('should return value if no value property in result', () => {
    const schema: StandardSchemaV1<unknown, unknown> = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () => ({ issues: [] })
      }
    };

    const result = applyTransformWithoutValidation('test', schema);
    expect(result).toBe('test');
  });
});
