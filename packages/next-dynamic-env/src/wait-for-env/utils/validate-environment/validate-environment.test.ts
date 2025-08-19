import { describe, expect, it, vi } from 'vitest';
import { validateEnvironment } from './validate-environment';

describe('validateEnvironment', () => {
  describe('environment loading validation', () => {
    it('should return invalid when env is undefined', () => {
      const result = validateEnvironment(undefined, [], undefined);
      expect(result).toEqual({
        isValid: false,
        reason: 'NOT_LOADED'
      });
    });

    it('should return invalid when env is null', () => {
      const result = validateEnvironment(null, [], undefined);
      expect(result).toEqual({
        isValid: false,
        reason: 'NOT_LOADED'
      });
    });

    it('should return invalid when env is false', () => {
      const result = validateEnvironment(false, [], undefined);
      expect(result).toEqual({
        isValid: false,
        reason: 'NOT_LOADED'
      });
    });

    it('should return invalid when env is 0', () => {
      const result = validateEnvironment(0, [], undefined);
      expect(result).toEqual({
        isValid: false,
        reason: 'NOT_LOADED'
      });
    });

    it('should return invalid when env is empty string', () => {
      const result = validateEnvironment('', [], undefined);
      expect(result).toEqual({
        isValid: false,
        reason: 'NOT_LOADED'
      });
    });

    it('should accept empty object as valid', () => {
      const result = validateEnvironment({}, [], undefined);
      expect(result).toEqual({
        isValid: true
      });
    });

    it('should accept non-empty object as valid', () => {
      const result = validateEnvironment({ key: 'value' }, [], undefined);
      expect(result).toEqual({
        isValid: true
      });
    });
  });

  describe('required keys validation', () => {
    it('should pass when no required keys specified', () => {
      const env = { API_URL: 'test' };
      const result = validateEnvironment(env, [], undefined);
      expect(result).toEqual({
        isValid: true
      });
    });

    it('should pass when all required keys are present', () => {
      const env = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'MyApp',
        SECRET_KEY: 'secret'
      };
      const result = validateEnvironment(
        env,
        ['API_URL', 'APP_NAME', 'SECRET_KEY'],
        undefined
      );
      expect(result).toEqual({
        isValid: true
      });
    });

    it('should fail when some required keys are missing', () => {
      const env = {
        API_URL: 'https://api.example.com'
      };
      const result = validateEnvironment(
        env,
        ['API_URL', 'APP_NAME', 'SECRET_KEY'],
        undefined
      );
      expect(result).toEqual({
        isValid: false,
        reason: 'MISSING_KEYS',
        missingKeys: ['APP_NAME', 'SECRET_KEY']
      });
    });

    it('should fail when all required keys are missing', () => {
      const env = {};
      const result = validateEnvironment(
        env,
        ['API_URL', 'APP_NAME'],
        undefined
      );
      expect(result).toEqual({
        isValid: false,
        reason: 'MISSING_KEYS',
        missingKeys: ['API_URL', 'APP_NAME']
      });
    });

    it('should handle keys with falsy values as present', () => {
      const env = {
        API_URL: '',
        APP_NAME: null,
        PORT: 0,
        ENABLED: false
      };
      const result = validateEnvironment(
        env,
        ['API_URL', 'APP_NAME', 'PORT', 'ENABLED'],
        undefined
      );
      expect(result).toEqual({
        isValid: true
      });
    });
  });

  describe('custom validation', () => {
    it('should pass when custom validation returns true', () => {
      const env = { API_URL: 'https://api.example.com' };
      const customValidate = vi.fn(() => true);

      const result = validateEnvironment(env, [], customValidate);

      expect(result).toEqual({
        isValid: true
      });
      expect(customValidate).toHaveBeenCalledWith(env);
      expect(customValidate).toHaveBeenCalledTimes(1);
    });

    it('should fail when custom validation returns false', () => {
      const env = { API_URL: 'http://api.example.com' };
      const customValidate = vi.fn(() => false);

      const result = validateEnvironment(env, [], customValidate);

      expect(result).toEqual({
        isValid: false,
        reason: 'CUSTOM_VALIDATION_FAILED'
      });
      expect(customValidate).toHaveBeenCalledWith(env);
    });

    it('should fail when custom validation throws an error', () => {
      const env = { API_URL: 'test' };
      const customValidate = vi.fn(() => {
        throw new Error('Validation error');
      });

      const result = validateEnvironment(env, [], customValidate);

      expect(result).toEqual({
        isValid: false,
        reason: 'CUSTOM_VALIDATION_FAILED'
      });
      expect(customValidate).toHaveBeenCalledWith(env);
    });

    it('should handle complex custom validation', () => {
      interface MyEnv {
        API_URL: string;
        PORT: number;
      }

      const env: MyEnv = { API_URL: 'https://api.example.com', PORT: 3000 };
      const customValidate = (e: MyEnv) => {
        return (
          e.API_URL.startsWith('https://') && e.PORT > 1000 && e.PORT < 65536
        );
      };

      const result = validateEnvironment(env, [], customValidate);
      expect(result).toEqual({
        isValid: true
      });
    });

    it('should fail complex custom validation', () => {
      interface MyEnv {
        API_URL: string;
        PORT: number;
      }

      const env: MyEnv = { API_URL: 'http://api.example.com', PORT: 500 };
      const customValidate = (e: MyEnv) => {
        return e.API_URL.startsWith('https://') && e.PORT > 1000;
      };

      const result = validateEnvironment(env, [], customValidate);
      expect(result).toEqual({
        isValid: false,
        reason: 'CUSTOM_VALIDATION_FAILED'
      });
    });
  });

  describe('combined validations', () => {
    it('should check required keys before custom validation', () => {
      const env = { API_URL: 'https://api.example.com' };
      const customValidate = vi.fn(() => true);

      const result = validateEnvironment(
        env,
        ['API_URL', 'APP_NAME'],
        customValidate
      );

      expect(result).toEqual({
        isValid: false,
        reason: 'MISSING_KEYS',
        missingKeys: ['APP_NAME']
      });
      // Custom validation should not be called if required keys are missing
      expect(customValidate).not.toHaveBeenCalled();
    });

    it('should run custom validation when all required keys are present', () => {
      const env = { API_URL: 'http://api.example.com', APP_NAME: 'MyApp' };
      const customValidate = vi.fn((e: any) =>
        e.API_URL.startsWith('https://')
      );

      const result = validateEnvironment(
        env,
        ['API_URL', 'APP_NAME'],
        customValidate
      );

      expect(result).toEqual({
        isValid: false,
        reason: 'CUSTOM_VALIDATION_FAILED'
      });
      expect(customValidate).toHaveBeenCalledWith(env);
    });

    it('should pass all validations', () => {
      const env = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'MyApp',
        PORT: 3000
      };
      const customValidate = (e: any) => e.PORT > 1000;

      const result = validateEnvironment(
        env,
        ['API_URL', 'APP_NAME'],
        customValidate
      );

      expect(result).toEqual({
        isValid: true
      });
    });
  });

  describe('type safety', () => {
    it('should work with generic types', () => {
      interface MyEnv {
        API_URL: string;
        PORT: number;
        FEATURES: string[];
      }

      const env: MyEnv = {
        API_URL: 'https://api.example.com',
        PORT: 3000,
        FEATURES: ['feature1', 'feature2']
      };

      const customValidate = (e: MyEnv) => {
        return e.FEATURES.length > 0 && e.PORT > 0;
      };

      const result = validateEnvironment<MyEnv>(
        env,
        ['API_URL', 'PORT', 'FEATURES'],
        customValidate
      );
      expect(result).toEqual({
        isValid: true
      });
    });
  });

  describe('edge cases', () => {
    it('should handle array as environment', () => {
      const env = ['item1', 'item2'];
      const result = validateEnvironment(env, [], undefined);
      // Arrays are truthy but won't have the required keys
      expect(result).toEqual({
        isValid: true
      });
    });

    it('should handle string as environment', () => {
      const env = 'not an object';
      const result = validateEnvironment(env, ['key'], undefined);
      expect(result).toEqual({
        isValid: false,
        reason: 'MISSING_KEYS',
        missingKeys: ['key']
      });
    });

    it('should handle number as environment', () => {
      const env = 42;
      const result = validateEnvironment(env, [], e => e === 42);
      expect(result).toEqual({
        isValid: true
      });
    });

    it('should handle undefined required keys parameter', () => {
      const env = { API_URL: 'test' };
      const result = validateEnvironment(env, undefined as any, undefined);
      expect(result).toEqual({
        isValid: true
      });
    });

    it('should prioritize NOT_LOADED over other validations', () => {
      const customValidate = vi.fn(() => false);
      const result = validateEnvironment(
        undefined,
        ['KEY1', 'KEY2'],
        customValidate
      );

      expect(result).toEqual({
        isValid: false,
        reason: 'NOT_LOADED'
      });
      expect(customValidate).not.toHaveBeenCalled();
    });
  });
});
