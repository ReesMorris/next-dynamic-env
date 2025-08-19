import { describe, expect, it } from 'vitest';
import { WaitForEnvError } from '../../wait-for-env-error';
import { validateParams } from './validate-params';

describe('validateParams', () => {
  describe('timeout validation', () => {
    it('should throw error when timeout is 0', () => {
      expect(() => validateParams(0, 50, '__NEXT_DYNAMIC_ENV__')).toThrow(
        WaitForEnvError
      );

      expect(() => validateParams(0, 50, '__NEXT_DYNAMIC_ENV__')).toThrow(
        'Timeout must be greater than 0'
      );
    });

    it('should throw error when timeout is negative', () => {
      expect(() => validateParams(-100, 50, '__NEXT_DYNAMIC_ENV__')).toThrow(
        WaitForEnvError
      );

      expect(() => validateParams(-100, 50, '__NEXT_DYNAMIC_ENV__')).toThrow(
        'Timeout must be greater than 0'
      );
    });

    it('should throw error with correct error code for invalid timeout', () => {
      try {
        validateParams(-1, 50, '__NEXT_DYNAMIC_ENV__');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(WaitForEnvError);
        const err = error as WaitForEnvError;
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.varName).toBe('__NEXT_DYNAMIC_ENV__');
        expect(err.details).toEqual({ timeout: -1 });
      }
    });

    it('should not throw error for valid positive timeout', () => {
      expect(() =>
        validateParams(5000, 50, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
      expect(() =>
        validateParams(1, 0.5, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
      expect(() =>
        validateParams(Number.MAX_SAFE_INTEGER, 50, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
    });
  });

  describe('interval validation', () => {
    it('should throw error when interval is 0', () => {
      expect(() => validateParams(5000, 0, '__NEXT_DYNAMIC_ENV__')).toThrow(
        WaitForEnvError
      );

      expect(() => validateParams(5000, 0, '__NEXT_DYNAMIC_ENV__')).toThrow(
        'Interval must be greater than 0 and less than timeout'
      );
    });

    it('should throw error when interval is negative', () => {
      expect(() => validateParams(5000, -50, '__NEXT_DYNAMIC_ENV__')).toThrow(
        WaitForEnvError
      );

      expect(() => validateParams(5000, -50, '__NEXT_DYNAMIC_ENV__')).toThrow(
        'Interval must be greater than 0 and less than timeout'
      );
    });

    it('should throw error when interval equals timeout', () => {
      expect(() => validateParams(100, 100, '__NEXT_DYNAMIC_ENV__')).toThrow(
        'Interval must be greater than 0 and less than timeout'
      );
    });

    it('should throw error when interval is greater than timeout', () => {
      expect(() => validateParams(100, 200, '__NEXT_DYNAMIC_ENV__')).toThrow(
        'Interval must be greater than 0 and less than timeout'
      );

      expect(() => validateParams(5000, 6000, '__NEXT_DYNAMIC_ENV__')).toThrow(
        'Interval must be greater than 0 and less than timeout'
      );
    });

    it('should throw error with correct error code and details for invalid interval', () => {
      try {
        validateParams(100, 150, '__NEXT_DYNAMIC_ENV__');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(WaitForEnvError);
        const err = error as WaitForEnvError;
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.varName).toBe('__NEXT_DYNAMIC_ENV__');
        expect(err.details).toEqual({ interval: 150, timeout: 100 });
      }
    });

    it('should not throw error for valid interval less than timeout', () => {
      expect(() =>
        validateParams(5000, 50, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
      expect(() =>
        validateParams(100, 99, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
      expect(() =>
        validateParams(1000, 1, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
    });
  });

  describe('varName validation', () => {
    it('should throw error when varName is empty string', () => {
      expect(() => validateParams(5000, 50, '')).toThrow(WaitForEnvError);

      expect(() => validateParams(5000, 50, '')).toThrow(
        'Variable name must be a non-empty string'
      );
    });

    it('should throw error when varName is null', () => {
      expect(() => validateParams(5000, 50, null as any)).toThrow(
        WaitForEnvError
      );

      expect(() => validateParams(5000, 50, null as any)).toThrow(
        'Variable name must be a non-empty string'
      );
    });

    it('should throw error when varName is undefined', () => {
      expect(() => validateParams(5000, 50, undefined as any)).toThrow(
        WaitForEnvError
      );

      expect(() => validateParams(5000, 50, undefined as any)).toThrow(
        'Variable name must be a non-empty string'
      );
    });

    it('should throw error when varName is not a string', () => {
      expect(() => validateParams(5000, 50, 123 as any)).toThrow(
        'Variable name must be a non-empty string'
      );

      expect(() => validateParams(5000, 50, {} as any)).toThrow(
        'Variable name must be a non-empty string'
      );

      expect(() => validateParams(5000, 50, [] as any)).toThrow(
        'Variable name must be a non-empty string'
      );

      expect(() => validateParams(5000, 50, true as any)).toThrow(
        'Variable name must be a non-empty string'
      );
    });

    it('should throw error with correct error code for invalid varName', () => {
      try {
        validateParams(5000, 50, '');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(WaitForEnvError);
        const err = error as WaitForEnvError;
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.varName).toBe('undefined');
      }
    });

    it('should set varName to "undefined" in error when varName is falsy', () => {
      try {
        validateParams(5000, 50, null as any);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(WaitForEnvError);
        const err = error as WaitForEnvError;
        expect(err.varName).toBe('undefined');
      }
    });

    it('should not throw error for valid non-empty string varName', () => {
      expect(() =>
        validateParams(5000, 50, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
      expect(() => validateParams(5000, 50, 'MY_ENV')).not.toThrow();
      expect(() => validateParams(5000, 50, 'a')).not.toThrow();
      expect(() => validateParams(5000, 50, ' ')).not.toThrow(); // Space is technically valid
    });
  });

  describe('combined validation', () => {
    it('should validate all parameters in order', () => {
      // Timeout validation should be checked first
      expect(() => validateParams(0, 0, '')).toThrow(
        'Timeout must be greater than 0'
      );

      // Then interval validation
      expect(() => validateParams(100, 200, '')).toThrow(
        'Interval must be greater than 0 and less than timeout'
      );

      // Then varName validation
      expect(() => validateParams(100, 50, '')).toThrow(
        'Variable name must be a non-empty string'
      );
    });

    it('should pass validation with all valid parameters', () => {
      expect(() =>
        validateParams(5000, 50, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
      expect(() => validateParams(10000, 100, 'CUSTOM_ENV')).not.toThrow();
      expect(() => validateParams(1, 0.1, 'ENV')).not.toThrow();
    });

    it('should handle edge cases correctly', () => {
      // Maximum safe values
      expect(() =>
        validateParams(Number.MAX_SAFE_INTEGER, 1, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();

      // Minimum valid values
      expect(() => validateParams(2, 1, 'E')).not.toThrow();

      // Decimal values
      expect(() =>
        validateParams(100.5, 50.25, '__NEXT_DYNAMIC_ENV__')
      ).not.toThrow();
    });
  });

  describe('error details', () => {
    it('should include timeout in error details when timeout is invalid', () => {
      try {
        validateParams(-500, 50, '__NEXT_DYNAMIC_ENV__');
      } catch (error) {
        const err = error as WaitForEnvError;
        expect(err.details).toHaveProperty('timeout', -500);
        expect(err.timeout).toBe(-500);
      }
    });

    it('should include both interval and timeout in error details when interval is invalid', () => {
      try {
        validateParams(100, 200, '__NEXT_DYNAMIC_ENV__');
      } catch (error) {
        const err = error as WaitForEnvError;
        expect(err.details).toHaveProperty('interval', 200);
        expect(err.details).toHaveProperty('timeout', 100);
      }
    });

    it('should not include extra details for varName validation errors', () => {
      try {
        validateParams(5000, 50, '');
      } catch (error) {
        const err = error as WaitForEnvError;
        expect(err.details).toBeUndefined();
      }
    });
  });
});
