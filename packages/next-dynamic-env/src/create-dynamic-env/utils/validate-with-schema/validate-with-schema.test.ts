import type { StandardSchemaV1 } from '@standard-schema/spec';
import { describe, expect, it, vi } from 'vitest';
import { validateWithSchema } from './validate-with-schema';

describe('validateWithSchema', () => {
  describe('successful validation', () => {
    it('should return the validated value when validation passes', () => {
      const mockSchema: StandardSchemaV1<unknown, string> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ value: 'validated-value' })
        }
      };

      const result = validateWithSchema('TEST_KEY', 'input-value', mockSchema);

      expect(mockSchema['~standard'].validate).toHaveBeenCalledWith(
        'input-value'
      );
      expect(result).toBe('validated-value');
    });

    it('should handle transformed values', () => {
      const mockSchema: StandardSchemaV1<unknown, number> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ value: 42 })
        }
      };

      const result = validateWithSchema('PORT', '42', mockSchema);

      expect(mockSchema['~standard'].validate).toHaveBeenCalledWith('42');
      expect(result).toBe(42);
    });

    it('should handle complex transformed values', () => {
      const transformedArray = ['feature1', 'feature2'];
      const mockSchema: StandardSchemaV1<unknown, string[]> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ value: transformedArray })
        }
      };

      const result = validateWithSchema(
        'FEATURES',
        'feature1,feature2',
        mockSchema
      );

      expect(result).toEqual(transformedArray);
    });
  });

  describe('validation failures', () => {
    it('should throw an error when validation fails with issues', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({
            issues: [
              { message: 'Invalid URL format' },
              { message: 'Must be HTTPS' }
            ]
          })
        }
      };

      expect(() =>
        validateWithSchema('API_URL', 'not-a-url', mockSchema)
      ).toThrowError(
        'Validation failed for API_URL: [{"message":"Invalid URL format"},{"message":"Must be HTTPS"}]'
      );
    });

    it('should handle single issue in validation failure', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({
            issues: [{ message: 'Required field' }]
          })
        }
      };

      expect(() =>
        validateWithSchema('DATABASE_URL', undefined, mockSchema)
      ).toThrowError(
        'Validation failed for DATABASE_URL: [{"message":"Required field"}]'
      );
    });

    it('should handle complex issue structures', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({
            issues: [
              {
                message: 'Invalid type',
                path: ['nested', 'field'],
                code: 'INVALID_TYPE'
              }
            ]
          })
        }
      };

      expect(() =>
        validateWithSchema('CONFIG', { nested: { field: 'wrong' } }, mockSchema)
      ).toThrowError(/Validation failed for CONFIG:/);
    });
  });

  describe('async validation handling', () => {
    it('should throw an error when schema returns a Promise', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi
            .fn()
            .mockReturnValue(Promise.resolve({ value: 'async-value' }))
        }
      };

      expect(() =>
        validateWithSchema('ASYNC_VAR', 'value', mockSchema)
      ).toThrowError(
        'Async validation is not supported. Schema for "ASYNC_VAR" returned a Promise.'
      );
    });

    it('should handle rejected promises by throwing immediately', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi
            .fn()
            .mockReturnValue(Promise.reject(new Error('Async error')))
        }
      };

      expect(() =>
        validateWithSchema('ASYNC_ERROR', 'value', mockSchema)
      ).toThrowError(
        'Async validation is not supported. Schema for "ASYNC_ERROR" returned a Promise.'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty issues array', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ issues: [] })
        }
      };

      // Empty issues array is treated as no issues
      const result = validateWithSchema('EMPTY_ISSUES', 'value', mockSchema);
      expect(result).toBe('value');
    });

    it('should fallback to original value when result has neither value nor issues', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({})
        }
      };

      const result = validateWithSchema(
        'FALLBACK',
        'original-value',
        mockSchema
      );
      expect(result).toBe('original-value');
    });

    it('should handle null and undefined values', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ value: null })
        }
      };

      const resultNull = validateWithSchema('NULL_VAR', null, mockSchema);
      expect(resultNull).toBeNull();

      const mockSchemaUndefined: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ value: undefined })
        }
      };
      const resultUndefined = validateWithSchema(
        'UNDEFINED_VAR',
        undefined,
        mockSchemaUndefined
      );
      expect(resultUndefined).toBeUndefined();
    });

    it('should handle boolean transformations', () => {
      const mockSchema: StandardSchemaV1<unknown, boolean> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ value: true })
        }
      };

      const result = validateWithSchema('DEBUG', 'true', mockSchema);
      expect(result).toBe(true);
    });

    it('should preserve the key in error messages for debugging', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({
            issues: [{ message: 'Custom error' }]
          })
        }
      };

      expect(() =>
        validateWithSchema('MY_SPECIAL_KEY', 'value', mockSchema)
      ).toThrowError(/MY_SPECIAL_KEY/);
    });
  });

  describe('standard-schema compliance', () => {
    it('should access the ~standard property correctly', () => {
      const validateFn = vi.fn().mockReturnValue({ value: 'result' });
      const mockSchema: StandardSchemaV1<unknown, unknown> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: validateFn
        }
      };

      validateWithSchema('KEY', 'value', mockSchema);
      expect(validateFn).toHaveBeenCalledOnce();
    });

    it('should handle schemas with additional properties', () => {
      const mockSchema: StandardSchemaV1<unknown, unknown> & {
        customProp: string;
      } = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: vi.fn().mockReturnValue({ value: 'validated' })
        },
        customProp: 'custom'
      };

      const result = validateWithSchema('KEY', 'value', mockSchema);
      expect(result).toBe('validated');
    });
  });
});
