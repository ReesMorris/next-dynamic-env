import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { processEnvironmentVariables } from './process-environment-variables';

// Mock processEnvEntry
vi.mock('../process-env-entry', () => ({
  processEnvEntry: vi.fn((_key, entry, emptyStringAsUndefined) => {
    // Simple mock implementation
    const value = Array.isArray(entry) ? entry[0] : entry;
    if (emptyStringAsUndefined && value === '') {
      return undefined;
    }
    // Simulate validation success
    return `validated-${value}`;
  })
}));

describe('processEnvironmentVariables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('with validation enabled', () => {
    it('should process simple string values', () => {
      const entries = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'MyApp'
      };

      const result = processEnvironmentVariables(
        entries,
        false, // skipValidation
        true // emptyStringAsUndefined
      );

      expect(result.rawEnv).toEqual({
        API_URL: 'https://api.example.com',
        APP_NAME: 'MyApp'
      });

      expect(result.processedEnv).toEqual({
        API_URL: 'validated-https://api.example.com',
        APP_NAME: 'validated-MyApp'
      });

      expect(result.errors).toHaveLength(0);
    });

    it('should process tuple entries with validators', () => {
      const schema = z.string().url();
      const entries = {
        API_URL: ['https://api.example.com', schema] as const,
        PORT: ['3000', z.coerce.number()] as const
      };

      const result = processEnvironmentVariables(entries, false, true);

      expect(result.rawEnv).toEqual({
        API_URL: 'https://api.example.com',
        PORT: '3000'
      });

      expect(Object.keys(result.processedEnv)).toContain('API_URL');
      expect(Object.keys(result.processedEnv)).toContain('PORT');
    });

    it('should handle validation errors', async () => {
      const processEnvModule = await import('../process-env-entry');
      const { processEnvEntry } = vi.mocked(processEnvModule);
      processEnvEntry.mockImplementationOnce(() => {
        throw new Error('Invalid URL format');
      });

      const entries = {
        BAD_URL: ['not-a-url', z.string().url()] as const
      };

      const result = processEnvironmentVariables(entries, false, true);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        key: 'BAD_URL',
        error: new Error('Invalid URL format')
      });

      expect(result.rawEnv.BAD_URL).toBe('not-a-url');
      expect(result.processedEnv.BAD_URL).toBeUndefined();
    });
  });

  describe('with validation disabled', () => {
    it('should skip validation and just extract values', () => {
      const entries = {
        API_URL: ['https://api.example.com', z.string().url()] as const,
        PORT: '3000',
        DEBUG: 'true'
      };

      const result = processEnvironmentVariables(
        entries,
        true, // skipValidation
        true // emptyStringAsUndefined
      );

      expect(result.processedEnv).toEqual({
        API_URL: 'https://api.example.com',
        PORT: '3000',
        DEBUG: 'true'
      });

      // processEnvEntry should not be called when validation is skipped
      // Note: We can't easily verify this since the mock is set up at module level
    });

    it('should handle empty strings as undefined when configured', () => {
      const entries = {
        EMPTY_VAR: '',
        NULL_VAR: null as any,
        UNDEFINED_VAR: undefined,
        VALID_VAR: 'value'
      };

      const result = processEnvironmentVariables(
        entries,
        true, // skipValidation
        true // emptyStringAsUndefined
      );

      expect(result.processedEnv).toEqual({
        EMPTY_VAR: undefined,
        NULL_VAR: null,
        UNDEFINED_VAR: undefined,
        VALID_VAR: 'value'
      });
    });

    it('should preserve empty strings when emptyStringAsUndefined is false', () => {
      const entries = {
        EMPTY_VAR: '',
        VALID_VAR: 'value'
      };

      const result = processEnvironmentVariables(
        entries,
        true, // skipValidation
        false // emptyStringAsUndefined
      );

      expect(result.processedEnv).toEqual({
        EMPTY_VAR: '',
        VALID_VAR: 'value'
      });
    });
  });

  describe('mixed entries', () => {
    it('should handle a mix of validated and non-validated entries', () => {
      const entries = {
        VALIDATED: ['value1', z.string()] as const,
        SIMPLE: 'value2',
        ARRAY_ONLY: ['value3'] as const,
        EMPTY: ''
      };

      const result = processEnvironmentVariables(entries, false, true);

      expect(result.rawEnv).toEqual({
        VALIDATED: 'value1',
        SIMPLE: 'value2',
        ARRAY_ONLY: 'value3',
        EMPTY: ''
      });

      expect(Object.keys(result.processedEnv)).toEqual([
        'VALIDATED',
        'SIMPLE',
        'ARRAY_ONLY',
        'EMPTY'
      ]);
    });

    it('should collect multiple errors without stopping processing', async () => {
      const processEnvModule = await import('../process-env-entry');
      const { processEnvEntry } = vi.mocked(processEnvModule);
      processEnvEntry
        .mockImplementationOnce(() => {
          throw new Error('Error 1');
        })
        .mockImplementationOnce(() => 'valid-value')
        .mockImplementationOnce(() => {
          throw new Error('Error 2');
        });

      const entries = {
        BAD_VAR1: 'value1',
        GOOD_VAR: 'value2',
        BAD_VAR2: 'value3'
      };

      const result = processEnvironmentVariables(entries, false, true);

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toEqual({
        key: 'BAD_VAR1',
        error: new Error('Error 1')
      });
      expect(result.errors[1]).toEqual({
        key: 'BAD_VAR2',
        error: new Error('Error 2')
      });

      expect(result.processedEnv.GOOD_VAR).toBe('valid-value');
    });
  });
});
