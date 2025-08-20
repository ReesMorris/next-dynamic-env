import type { StandardSchemaV1 } from '@standard-schema/spec';
import { describe, expect, it, vi } from 'vitest';
import { processEnvEntry } from './process-env-entry';

// Mock the validateWithSchema function
vi.mock('../validate-with-schema', () => ({
  validateWithSchema: vi.fn((_key, value, _schema) => {
    // Simple mock implementation
    if (value === 'mock-invalid') {
      throw new Error('Mock validation error');
    }
    // For testing, just return the value with '_validated' suffix
    return `${value}_validated`;
  })
}));

describe('processEnvEntry', () => {
  describe('raw values (non-array entries)', () => {
    it('should return raw string value as-is when emptyStringAsUndefined is false', () => {
      const result = processEnvEntry('TEST_KEY', 'test-value', false);
      expect(result).toBe('test-value');
    });

    it('should return undefined value as-is', () => {
      const result = processEnvEntry('TEST_KEY', undefined, false);
      expect(result).toBeUndefined();
    });

    it('should convert empty string to undefined when emptyStringAsUndefined is true', () => {
      const result = processEnvEntry('TEST_KEY', '', true);
      expect(result).toBeUndefined();
    });

    it('should keep empty string when emptyStringAsUndefined is false', () => {
      const result = processEnvEntry('TEST_KEY', '', false);
      expect(result).toBe('');
    });

    it('should handle non-empty strings with emptyStringAsUndefined enabled', () => {
      const result = processEnvEntry('TEST_KEY', 'value', true);
      expect(result).toBe('value');
    });
  });

  describe('single-element tuples', () => {
    it('should treat single-element tuple as raw value', () => {
      const result = processEnvEntry('TEST_KEY', ['raw-value'], false);
      expect(result).toBe('raw-value');
    });

    it('should handle undefined in single-element tuple', () => {
      const result = processEnvEntry('TEST_KEY', [undefined], false);
      expect(result).toBeUndefined();
    });

    it('should convert empty string in tuple when emptyStringAsUndefined is true', () => {
      const result = processEnvEntry('TEST_KEY', [''], true);
      expect(result).toBeUndefined();
    });

    it('should keep empty string in tuple when emptyStringAsUndefined is false', () => {
      const result = processEnvEntry('TEST_KEY', [''], false);
      expect(result).toBe('');
    });
  });

  describe('two-element tuples with schema', () => {
    const mockSchema: StandardSchemaV1<unknown, string> = {
      '~standard': {
        vendor: 'test',
        version: 1,
        validate: vi.fn()
      }
    };

    it('should validate value with schema', () => {
      const result = processEnvEntry(
        'TEST_KEY',
        ['test-value', mockSchema],
        false
      );
      expect(result).toBe('test-value_validated');
    });

    it('should handle undefined value with schema', () => {
      const result = processEnvEntry(
        'TEST_KEY',
        [undefined, mockSchema],
        false
      );
      expect(result).toBe('undefined_validated');
    });

    it('should convert empty string before validation when emptyStringAsUndefined is true', () => {
      const result = processEnvEntry('TEST_KEY', ['', mockSchema], true);
      expect(result).toBe('undefined_validated');
    });

    it('should pass empty string to validation when emptyStringAsUndefined is false', () => {
      const result = processEnvEntry('TEST_KEY', ['', mockSchema], false);
      expect(result).toBe('_validated');
    });

    it('should throw error with key name when validation fails', () => {
      expect(() => {
        processEnvEntry('TEST_KEY', ['mock-invalid', mockSchema], false);
      }).toThrow('Validation failed for TEST_KEY: Mock validation error');
    });

    it('should handle non-Error validation failures', async () => {
      const { validateWithSchema } = vi.mocked(
        await import('../validate-with-schema')
      );
      validateWithSchema.mockImplementationOnce(() => {
        throw 'String error';
      });

      expect(() => {
        processEnvEntry('TEST_KEY', ['value', mockSchema], false);
      }).toThrow('Validation failed for TEST_KEY: String error');
    });
  });

  describe('two-element tuples with undefined schema', () => {
    it('should treat undefined schema as no validation', () => {
      const result = processEnvEntry(
        'TEST_KEY',
        ['raw-value', undefined],
        false
      );
      expect(result).toBe('raw-value');
    });

    it('should handle empty string with undefined schema and emptyStringAsUndefined', () => {
      const result = processEnvEntry('TEST_KEY', ['', undefined], true);
      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle numeric string values', () => {
      const result = processEnvEntry('PORT', '3000', false);
      expect(result).toBe('3000');
    });

    it('should handle boolean-like string values', () => {
      const result = processEnvEntry('DEBUG', 'true', false);
      expect(result).toBe('true');
    });

    it('should handle whitespace-only strings', () => {
      const result = processEnvEntry('TEST_KEY', '   ', false);
      expect(result).toBe('   ');
    });

    it('should not treat whitespace as empty string', () => {
      const result = processEnvEntry('TEST_KEY', '   ', true);
      expect(result).toBe('   ');
    });

    it('should handle special characters in values', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = processEnvEntry('TEST_KEY', specialValue, false);
      expect(result).toBe(specialValue);
    });

    it('should handle very long values', () => {
      const longValue = 'a'.repeat(10000);
      const result = processEnvEntry('TEST_KEY', longValue, false);
      expect(result).toBe(longValue);
    });
  });

  describe('error messages', () => {
    const mockSchema: StandardSchemaV1<unknown, string> = {
      '~standard': {
        vendor: 'test',
        version: 1,
        validate: vi.fn()
      }
    };

    it('should include the key name in error messages', () => {
      expect(() => {
        processEnvEntry('MY_SPECIAL_KEY', ['mock-invalid', mockSchema], false);
      }).toThrow(/MY_SPECIAL_KEY/);
    });

    it('should preserve the original error message', () => {
      expect(() => {
        processEnvEntry('TEST_KEY', ['mock-invalid', mockSchema], false);
      }).toThrow(/Mock validation error/);
    });
  });
});
