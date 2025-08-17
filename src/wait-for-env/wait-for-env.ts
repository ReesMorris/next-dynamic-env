import { isBrowser } from '../utils';
import type { WaitForEnvOptions } from './wait-for-env.types';

/**
 * Waits for the global environment variables to be available on the window object.
 * Useful for client-side code that runs before React hydration (e.g., instrumentation)
 *
 * @param options - Configuration options
 * @returns A Promise that resolves when the environment variables are available
 * @throws An error if environment variables are not available within the timeout period
 *
 * @example
 * ```ts
 * // In instrumentation.ts or similar
 * import { waitForEnv } from 'next-public-env';
 *
 * async function initializeSentry() {
 *   await waitForEnv();
 *   const dsn = window.__ENV__.SENTRY_DSN;
 *   // Initialize Sentry...
 * }
 * ```
 */
export const waitForEnv = ({
  timeout = 5000,
  interval = 50,
  varName = '__ENV__'
}: WaitForEnvOptions = {}): Promise<void> => {
  // If we're on the server, resolve immediately
  if (!isBrowser()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () =>
        reject(
          new Error(
            `Environment variables (window.${varName}) not available after ${timeout}ms`
          )
        ),
      timeout
    );

    const check = () => {
      // biome-ignore lint/suspicious/noExplicitAny: The variable may or may not exist
      if ((window as any)[varName]) {
        clearTimeout(timeoutId);
        resolve();
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
};
