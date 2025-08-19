import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForEnv } from './wait-for-env';
import { WaitForEnvError } from './wait-for-env-error';

describe('waitForEnv', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('parameter validation', () => {
    it('should throw error for invalid timeout', () => {
      expect(() => waitForEnv({ timeout: 0 })).toThrow(WaitForEnvError);
      expect(() => waitForEnv({ timeout: -100 })).toThrow(
        'Timeout must be greater than 0'
      );
    });

    it('should throw error for invalid interval', () => {
      expect(() => waitForEnv({ interval: 0 })).toThrow(
        'Interval must be greater than 0'
      );
      expect(() => waitForEnv({ interval: 6000, timeout: 5000 })).toThrow(
        'Interval must be greater than 0 and less than timeout'
      );
    });

    it('should throw error for invalid varName', () => {
      expect(() => waitForEnv({ varName: '' })).toThrow(
        'Variable name must be a non-empty string'
      );
      expect(() => waitForEnv({ varName: null as any })).toThrow(
        'Variable name must be a non-empty string'
      );
    });
  });

  describe('memory leak prevention', () => {
    it('should clear interval on timeout', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const promise = waitForEnv({ timeout: 100, interval: 20 });

      // Immediately set up the rejection expectation
      const expectation = expect(promise).rejects.toThrow(WaitForEnvError);

      // Advance past timeout
      await vi.advanceTimersByTimeAsync(150);

      await expectation;

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should clear timers on success', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const promise = waitForEnv({ timeout: 200, interval: 20 });

      // Immediately set up the resolution expectation
      const expectation = expect(promise).resolves.toEqual({ API_URL: 'test' });

      // Set env after 50ms
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      await expectation;

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('retry mechanism', () => {
    it('should retry with exponential backoff', async () => {
      const onRetry = vi.fn();
      const onTimeout = vi.fn();

      const promise = waitForEnv({
        timeout: 100,
        interval: 20,
        retries: 2,
        backoffMultiplier: 2,
        onRetry,
        onTimeout
      });

      // Immediately set up the rejection expectation
      const expectation = expect(promise).rejects.toThrow(WaitForEnvError);

      // First attempt fails at 100ms
      await vi.advanceTimersByTimeAsync(100);
      expect(onRetry).toHaveBeenCalledWith(1, 200); // Next timeout: 100 * 2

      // Second attempt fails at 200ms
      await vi.advanceTimersByTimeAsync(200);
      expect(onRetry).toHaveBeenCalledWith(2, 400); // Next timeout: 200 * 2

      // Third attempt fails at 400ms
      await vi.advanceTimersByTimeAsync(400);

      await expectation;
      expect(onTimeout).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it('should succeed on retry', async () => {
      const onRetry = vi.fn();
      const onReady = vi.fn();

      const promise = waitForEnv({
        timeout: 100,
        interval: 20,
        retries: 2,
        onRetry,
        onReady
      });

      // First attempt fails
      await vi.advanceTimersByTimeAsync(100);
      expect(onRetry).toHaveBeenCalledTimes(1);

      // Set env during second attempt
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toEqual({ API_URL: 'test' });
      expect(onReady).toHaveBeenCalledWith({ API_URL: 'test' });
    });
  });

  describe('partial load detection', () => {
    it('should detect missing required keys', async () => {
      const onPartialLoad = vi.fn();

      const promise = waitForEnv({
        timeout: 200,
        interval: 30,
        requiredKeys: ['API_URL', 'APP_NAME', 'SECRET_KEY'],
        onPartialLoad
      });

      // Set partial env
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = {
          API_URL: 'test',
          APP_NAME: 'MyApp'
        };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      // Should have detected partial load
      expect(onPartialLoad).toHaveBeenCalledWith(
        ['API_URL', 'APP_NAME'],
        ['SECRET_KEY']
      );

      // Add missing key
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = {
          API_URL: 'test',
          APP_NAME: 'MyApp',
          SECRET_KEY: 'secret'
        };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toEqual({
        API_URL: 'test',
        APP_NAME: 'MyApp',
        SECRET_KEY: 'secret'
      });
    });

    it('should timeout if required keys never appear', async () => {
      const onPartialLoad = vi.fn();

      const promise = waitForEnv({
        timeout: 100,
        interval: 20,
        requiredKeys: ['API_URL', 'MISSING_KEY'],
        onPartialLoad
      });

      // Immediately set up the rejection expectation
      const expectation = expect(promise).rejects.toThrow(WaitForEnvError);

      // Set partial env
      (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };

      await vi.advanceTimersByTimeAsync(150);

      await expectation;
      expect(onPartialLoad).toHaveBeenCalled();
    });
  });

  describe('custom validation', () => {
    it('should use custom validation function', async () => {
      const validate = vi.fn((env: any) => {
        return env.API_URL?.startsWith('https://');
      });

      const promise = waitForEnv({
        timeout: 300,
        interval: 30,
        validate
      });

      // Set env with invalid URL
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = {
          API_URL: 'http://insecure.com'
        };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      // Validation should have been called and failed
      expect(validate).toHaveBeenCalledWith({ API_URL: 'http://insecure.com' });

      // Update to valid URL
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = {
          API_URL: 'https://secure.com'
        };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toEqual({ API_URL: 'https://secure.com' });
    });

    it('should combine validation with required keys', async () => {
      const validate = vi.fn((env: any) => env.PORT > 1000);

      const promise = waitForEnv({
        timeout: 200,
        interval: 30,
        requiredKeys: ['API_URL', 'PORT'],
        validate
      });

      // Set env with all keys but invalid validation
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = {
          API_URL: 'test',
          PORT: 500
        };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      // Should not resolve yet
      expect(validate).toHaveBeenCalledWith({ API_URL: 'test', PORT: 500 });

      // Fix validation
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = {
          API_URL: 'test',
          PORT: 3000
        };
      }, 50);

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toEqual({ API_URL: 'test', PORT: 3000 });
    });
  });

  describe('debug mode', () => {
    it('should log debug messages when enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const promise = waitForEnv({
        timeout: 50,
        interval: 20,
        debug: true
      });

      // Immediately set up the rejection expectation
      const expectation = expect(promise).rejects.toThrow();

      await vi.advanceTimersByTimeAsync(100);

      await expectation;

      // Should have logged debug messages
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[waitForEnv]')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[waitForEnv] Debug info:\n',
        expect.stringContaining('Error Code: TIMEOUT')
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should not log when debug is disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const promise = waitForEnv({
        timeout: 50,
        interval: 20,
        debug: false
      });

      // Immediately set up the rejection expectation
      const expectation = expect(promise).rejects.toThrow();

      await vi.advanceTimersByTimeAsync(100);

      await expectation;

      // Should not have logged
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[waitForEnv]')
      );
    });
  });

  describe('error details', () => {
    it('should include detailed error information', async () => {
      const result = waitForEnv({
        timeout: 100,
        requiredKeys: ['API_URL', 'APP_NAME'],
        retries: 1
      });

      // Set up the promise to be handled properly (result is always a Promise in browser)
      const errorPromise = (result as Promise<any>).catch(
        (error: any) => error
      );

      await vi.advanceTimersByTimeAsync(300);

      const error = await errorPromise;
      expect(error).toBeInstanceOf(WaitForEnvError);
      const err = error as WaitForEnvError;

      expect(err.code).toBe('TIMEOUT');
      expect(err.varName).toBe('__NEXT_DYNAMIC_ENV__');
      expect(err.attempts).toBe(2);
      expect(err.missingKeys).toEqual(['API_URL', 'APP_NAME']);

      const debugInfo = err.getDebugInfo();
      expect(debugInfo).toContain('Error Code: TIMEOUT');
      expect(debugInfo).toContain('Variable Name: __NEXT_DYNAMIC_ENV__');
      expect(debugInfo).toContain('Attempts: 2');
      expect(debugInfo).toContain('Missing Keys: API_URL, APP_NAME');
    });
  });

  describe('type safety', () => {
    it('should return typed environment', async () => {
      interface MyEnv {
        API_URL: string;
        PORT: number;
      }

      const promise = waitForEnv<MyEnv>({
        timeout: 100,
        interval: 20
      });

      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = {
          API_URL: 'https://api.example.com',
          PORT: 3000
        };
      }, 30);

      await vi.advanceTimersByTimeAsync(50);

      const result = await promise;

      // TypeScript should recognize these types
      const apiUrl: string = result.API_URL;
      const port: number = result.PORT;

      expect(apiUrl).toBe('https://api.example.com');
      expect(port).toBe(3000);
    });
  });
});
