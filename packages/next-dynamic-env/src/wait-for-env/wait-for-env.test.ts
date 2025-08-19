import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForEnv } from './wait-for-env';

describe('waitForEnv', () => {
  beforeEach(() => {
    // Clean up window object
    Object.keys(window).forEach(key => {
      if (key.startsWith('__') && key.includes('ENV')) {
        delete (window as any)[key];
      }
    });

    // Clear all timers
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('server-side behavior', () => {
    beforeEach(() => {
      // Mock server environment
      vi.stubGlobal('window', undefined);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should resolve immediately on server', async () => {
      const promise = waitForEnv();

      // Should resolve without any delay
      await expect(promise).resolves.toBeUndefined();
    });

    it('should not call callbacks on server', async () => {
      const onReady = vi.fn();
      const onTimeout = vi.fn();

      await waitForEnv({ onReady, onTimeout });

      expect(onReady).not.toHaveBeenCalled();
      expect(onTimeout).not.toHaveBeenCalled();
    });
  });

  describe('client-side behavior', () => {
    it('should resolve immediately when env is already available', async () => {
      // Set env before calling waitForEnv
      (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };

      const onReady = vi.fn();
      const promise = waitForEnv({ onReady });

      await expect(promise).resolves.toBeUndefined();
      expect(onReady).toHaveBeenCalledTimes(1);
    });

    it('should wait for env to become available', async () => {
      const onReady = vi.fn();
      const promise = waitForEnv({ interval: 50, onReady });

      // Env not available initially
      expect((window as any).__NEXT_DYNAMIC_ENV__).toBeUndefined();

      // Set env after 100ms
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };
      }, 100);

      // Advance timers
      await vi.advanceTimersByTimeAsync(150);

      await expect(promise).resolves.toBeUndefined();
      expect(onReady).toHaveBeenCalledTimes(1);
    });

    it('should use custom variable name', async () => {
      const onReady = vi.fn();
      const promise = waitForEnv({
        varName: 'CUSTOM_ENV',
        interval: 50,
        onReady
      });

      // Set custom env after 100ms
      setTimeout(() => {
        (window as any).CUSTOM_ENV = { API_URL: 'test' };
      }, 100);

      // Advance timers
      await vi.advanceTimersByTimeAsync(150);

      await expect(promise).resolves.toBeUndefined();
      expect(onReady).toHaveBeenCalledTimes(1);
    });

    it('should timeout after specified duration', async () => {
      const onTimeout = vi.fn();

      // Start the waitForEnv and immediately set up expectation
      const promise = waitForEnv({
        timeout: 200,
        interval: 50,
        onTimeout
      });

      // Set up the rejection expectation before advancing timers
      const expectPromise = expect(promise).rejects.toThrow(
        'Environment variables (window.__NEXT_DYNAMIC_ENV__) not available after 200ms'
      );

      // Never set the env variable
      // Advance timers past timeout
      await vi.advanceTimersByTimeAsync(250);

      // Wait for the expectation to resolve
      await expectPromise;
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it('should use custom timeout message with custom varName', async () => {
      // Start the waitForEnv and immediately set up expectation
      const promise = waitForEnv({
        timeout: 100,
        varName: 'MY_ENV'
      });

      // Set up the rejection expectation before advancing timers
      const expectPromise = expect(promise).rejects.toThrow(
        'Environment variables (window.MY_ENV) not available after 100ms'
      );

      // Advance timers past timeout
      await vi.advanceTimersByTimeAsync(150);

      // Wait for the expectation to resolve
      await expectPromise;
    });

    it('should check at specified intervals', async () => {
      let checkCount = 0;
      const originalGet = Object.getOwnPropertyDescriptor(
        window,
        '__NEXT_DYNAMIC_ENV__'
      );

      // Mock property access to count checks
      Object.defineProperty(window, '__NEXT_DYNAMIC_ENV__', {
        get: () => {
          checkCount++;
          // Return undefined for first 3 checks, then return value
          return checkCount > 3 ? { API_URL: 'test' } : undefined;
        },
        configurable: true
      });

      const promise = waitForEnv({ interval: 30 });

      // Advance timers to trigger multiple checks
      await vi.advanceTimersByTimeAsync(150);

      await expect(promise).resolves.toBeUndefined();
      expect(checkCount).toBeGreaterThanOrEqual(4);

      // Restore original descriptor
      if (originalGet) {
        Object.defineProperty(window, '__NEXT_DYNAMIC_ENV__', originalGet);
      } else {
        delete (window as any).__NEXT_DYNAMIC_ENV__;
      }
    });

    it('should use default values', async () => {
      const promise = waitForEnv();

      // Set env after default interval
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };
      }, 100);

      // Advance timers
      await vi.advanceTimersByTimeAsync(150);

      await expect(promise).resolves.toBeUndefined();
    });

    it('should clear timeout when env becomes available', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Set env immediately
      (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };

      await waitForEnv();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should handle multiple concurrent waitForEnv calls', async () => {
      const onReady1 = vi.fn();
      const onReady2 = vi.fn();

      const promise1 = waitForEnv({ onReady: onReady1 });
      const promise2 = waitForEnv({ onReady: onReady2 });

      // Set env after 100ms
      setTimeout(() => {
        (window as any).__NEXT_DYNAMIC_ENV__ = { API_URL: 'test' };
      }, 100);

      // Advance timers
      await vi.advanceTimersByTimeAsync(150);

      await expect(Promise.all([promise1, promise2])).resolves.toEqual([
        undefined,
        undefined
      ]);

      expect(onReady1).toHaveBeenCalledTimes(1);
      expect(onReady2).toHaveBeenCalledTimes(1);
    });
  });
});
