import { describe, expect, it, vi } from 'vitest';
import { validateWithSchema } from './validate-with-schema';

vi.mock('../format-validation-issues', () => ({
  formatValidationIssues: vi.fn((issues: any) => {
    if (Array.isArray(issues) && issues.length > 0) {
      return issues[0].message || 'Validation failed';
    }
    return 'Validation failed';
  })
}));

describe('validateWithSchema', () => {
  it('should return validated value when validation passes', () => {
    const mockSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: vi.fn(() => ({ value: 'validated-value' }))
      }
    } as any;

    const result = validateWithSchema('TEST_KEY', 'input-value', mockSchema);
    expect(result).toBe('validated-value');
    expect(mockSchema['~standard'].validate).toHaveBeenCalledWith(
      'input-value'
    );
  });

  it('should throw formatted error when validation fails', () => {
    const mockSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: vi.fn(() => ({
          issues: [{ message: 'Invalid format' }]
        }))
      }
    } as any;

    expect(() =>
      validateWithSchema('TEST_KEY', 'bad-value', mockSchema)
    ).toThrow('Invalid format');
  });

  it('should throw error for async validation', () => {
    const mockSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: vi.fn(() => Promise.resolve({ value: 'async-value' }))
      }
    } as any;

    expect(() => validateWithSchema('ASYNC_KEY', 'value', mockSchema)).toThrow(
      'Async validation is not supported. Schema for "ASYNC_KEY" returned a Promise.'
    );
  });

  it('should return original value as fallback when no value in result', () => {
    const mockSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: vi.fn(() => ({}))
      }
    } as any;

    const result = validateWithSchema('TEST_KEY', 'original-value', mockSchema);
    expect(result).toBe('original-value');
  });

  it('should handle empty issues array', () => {
    const mockSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: vi.fn(() => ({
          issues: [],
          value: 'validated-value'
        }))
      }
    } as any;

    const result = validateWithSchema('TEST_KEY', 'input', mockSchema);
    expect(result).toBe('validated-value');
  });

  it('should handle multiple validation issues', () => {
    const mockSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: vi.fn(() => ({
          issues: [{ message: 'Error 1' }, { message: 'Error 2' }]
        }))
      }
    } as any;

    expect(() =>
      validateWithSchema('TEST_KEY', 'bad-value', mockSchema)
    ).toThrow('Error 1');
  });
});
