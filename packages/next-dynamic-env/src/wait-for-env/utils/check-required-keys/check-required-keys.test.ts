import { describe, expect, it } from 'vitest';
import { checkRequiredKeys } from './check-required-keys';

describe('checkRequiredKeys', () => {
  describe('when no required keys are specified', () => {
    it('should return empty array for empty required keys array', () => {
      const env = { API_URL: 'test', APP_NAME: 'MyApp' };
      expect(checkRequiredKeys(env, [])).toEqual([]);
    });

    it('should return empty array for undefined required keys', () => {
      const env = { API_URL: 'test' };
      expect(checkRequiredKeys(env, undefined as any)).toEqual([]);
    });

    it('should return empty array for null required keys', () => {
      const env = { API_URL: 'test' };
      expect(checkRequiredKeys(env, null as any)).toEqual([]);
    });
  });

  describe('when environment is invalid', () => {
    it('should return all required keys when env is null', () => {
      const requiredKeys = ['API_URL', 'APP_NAME', 'SECRET_KEY'];
      expect(checkRequiredKeys(null, requiredKeys)).toEqual(requiredKeys);
    });

    it('should return all required keys when env is undefined', () => {
      const requiredKeys = ['API_URL', 'APP_NAME'];
      expect(checkRequiredKeys(undefined, requiredKeys)).toEqual(requiredKeys);
    });

    it('should return all required keys when env is not an object', () => {
      const requiredKeys = ['API_URL', 'APP_NAME'];
      expect(checkRequiredKeys('string', requiredKeys)).toEqual(requiredKeys);
      expect(checkRequiredKeys(123, requiredKeys)).toEqual(requiredKeys);
      expect(checkRequiredKeys(true, requiredKeys)).toEqual(requiredKeys);
    });

    it('should return all required keys when env is an array', () => {
      const requiredKeys = ['API_URL', 'APP_NAME'];
      expect(checkRequiredKeys([], requiredKeys)).toEqual(requiredKeys);
      expect(checkRequiredKeys(['item'], requiredKeys)).toEqual(requiredKeys);
    });
  });

  describe('when checking for missing keys', () => {
    it('should return empty array when all required keys are present', () => {
      const env = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'MyApp',
        SECRET_KEY: 'secret123'
      };
      const requiredKeys = ['API_URL', 'APP_NAME', 'SECRET_KEY'];
      expect(checkRequiredKeys(env, requiredKeys)).toEqual([]);
    });

    it('should return missing keys when some are not present', () => {
      const env = {
        API_URL: 'https://api.example.com',
        APP_NAME: 'MyApp'
      };
      const requiredKeys = ['API_URL', 'APP_NAME', 'SECRET_KEY', 'MISSING_KEY'];
      expect(checkRequiredKeys(env, requiredKeys)).toEqual([
        'SECRET_KEY',
        'MISSING_KEY'
      ]);
    });

    it('should return all keys when none are present', () => {
      const env = {};
      const requiredKeys = ['API_URL', 'APP_NAME', 'SECRET_KEY'];
      expect(checkRequiredKeys(env, requiredKeys)).toEqual(requiredKeys);
    });

    it('should handle keys with undefined values as present', () => {
      const env = {
        API_URL: undefined,
        APP_NAME: null,
        SECRET_KEY: ''
      };
      const requiredKeys = ['API_URL', 'APP_NAME', 'SECRET_KEY'];
      // Keys exist even if values are falsy
      expect(checkRequiredKeys(env, requiredKeys)).toEqual([]);
    });

    it('should be case-sensitive when checking keys', () => {
      const env = {
        api_url: 'https://api.example.com',
        APP_NAME: 'MyApp'
      };
      const requiredKeys = ['API_URL', 'APP_NAME'];
      expect(checkRequiredKeys(env, requiredKeys)).toEqual(['API_URL']);
    });

    it('should handle duplicate required keys correctly', () => {
      const env = { API_URL: 'test' };
      const requiredKeys = [
        'API_URL',
        'APP_NAME',
        'APP_NAME',
        'SECRET_KEY',
        'SECRET_KEY'
      ];
      const missing = checkRequiredKeys(env, requiredKeys);
      expect(missing).toEqual([
        'APP_NAME',
        'APP_NAME',
        'SECRET_KEY',
        'SECRET_KEY'
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty environment object', () => {
      expect(checkRequiredKeys({}, ['KEY1', 'KEY2'])).toEqual(['KEY1', 'KEY2']);
    });

    it('should handle single required key', () => {
      expect(checkRequiredKeys({ KEY1: 'value' }, ['KEY1'])).toEqual([]);
      expect(checkRequiredKeys({}, ['KEY1'])).toEqual(['KEY1']);
    });

    it('should preserve order of missing keys', () => {
      const env = { KEY2: 'value' };
      const requiredKeys = ['KEY1', 'KEY2', 'KEY3', 'KEY4'];
      expect(checkRequiredKeys(env, requiredKeys)).toEqual([
        'KEY1',
        'KEY3',
        'KEY4'
      ]);
    });

    it('should work with nested object values', () => {
      const env = {
        API_CONFIG: { url: 'test' },
        APP_SETTINGS: { name: 'MyApp' }
      };
      const requiredKeys = ['API_CONFIG', 'APP_SETTINGS', 'MISSING'];
      expect(checkRequiredKeys(env, requiredKeys)).toEqual(['MISSING']);
    });
  });
});
