import { isBrowser } from '../utils';
import type { WaitForEnvOptions } from './wait-for-env.types'; /**
 * Waits for the global environment variables to be available on the window object.
 * Useful for client-side code that runs before React hydration (e.g., `instrumentation-client.ts`)
 *
 * @param options - Configuration options
 * @returns A Promise that resolves when the environment variables are available
 * @throws An error if environment variables are not available within the timeout period
 *
 * @example
 * ```ts
 * // In instrumentation-client.ts or similar
 * import { env, waitForEnv } from 'next-dynamic-env';
 *
 * (async () => {
 *   await waitForEnv();
 *   const dsn = env('SENTRY_DSN');
 *   // Initialize Sentry...
 * })();
 * ```
 */
export const waitForEnv = ({
  timeout = 5000,
  interval = 50,
  varName = '__NEXT_DYNAMIC_ENV__',
  onReady,
  onTimeout
}: WaitForEnvOptions = {}): Promise<void> => {
  // If we're on the server, resolve immediately
  if (!isBrowser()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      onTimeout?.();
      reject(
        new Error(
          `Environment variables (window.${varName}) not available after ${timeout}ms`
        )
      );
    }, timeout);

    const check = () => {
      // biome-ignore lint/suspicious/noExplicitAny: The variable may or may not exist
      if ((window as any)[varName]) {
        clearTimeout(timeoutId);
        onReady?.();
        resolve();
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
};
