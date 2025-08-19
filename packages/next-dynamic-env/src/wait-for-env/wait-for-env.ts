import { DEFAULT_WINDOW_ENV_VAR_NAME } from '../constants';
import { isBrowser } from '../utils';
import { validateParams } from './utils';
import type { WaitForEnvOptions } from './wait-for-env.types';
import { WaitForEnvError } from './wait-for-env-error';

/**
 * Waits for the global environment variables to be available on the window object.
 * Useful for client-side code that runs before React hydration (e.g., `instrumentation-client.ts`)
 *
 * @param options - Configuration options
 * @returns A Promise that resolves with the environment variables when available
 * @throws WaitForEnvError if environment variables are not available within the timeout period
 *
 * @example
 * ```ts
 * // Basic usage
 * await waitForEnv();
 *
 * // With required keys
 * await waitForEnv({
 *   requiredKeys: ['API_URL', 'APP_NAME'],
 *   onPartialLoad: (loaded, missing) => {
 *     console.warn(`Missing env vars: ${missing.join(', ')}`);
 *   }
 * });
 *
 * // With custom validation
 * await waitForEnv({
 *   validate: (env) => env.API_URL && env.API_URL.startsWith('https://'),
 *   retries: 3,
 *   debug: true
 * });
 * ```
 */
export const waitForEnv = <T = Record<string, unknown>>({
  timeout = 5000,
  interval = 50,
  varName = DEFAULT_WINDOW_ENV_VAR_NAME,
  retries = 0,
  backoffMultiplier = 2,
  requiredKeys = [],
  validate,
  debug = false,
  onReady,
  onTimeout,
  onRetry,
  onPartialLoad
}: WaitForEnvOptions<T> = {}): T | Promise<T> => {
  // If we're on the server, resolve immediately with empty object
  if (!isBrowser()) {
    const emptyEnv = {} as T;
    onReady?.(emptyEnv);
    return emptyEnv;
  }

  // Make sure parameters are valid
  validateParams(timeout, interval, varName);

  const log = (message: string) => {
    if (debug) {
      console.log(`[waitForEnv] ${message}`);
    }
  };

  // Main polling function
  const attemptLoad = (
    attemptNumber: number,
    attemptTimeout: number
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      let intervalId: NodeJS.Timeout | undefined;
      let timeoutId: NodeJS.Timeout | undefined;
      let pollCount = 0;

      const cleanup = () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      const checkEnv = () => {
        pollCount++;
        log(`Polling attempt ${pollCount} for window.${varName}`);

        // biome-ignore lint/suspicious/noExplicitAny: The variable may or may not exist
        const env = (window as any)[varName] as T | undefined;

        if (env) {
          // Check for required keys
          if (requiredKeys.length > 0) {
            const envKeys = Object.keys(env);
            const missingKeys = requiredKeys.filter(
              key => !envKeys.includes(key)
            );

            if (missingKeys.length > 0) {
              log(
                `Partial load detected. Missing keys: ${missingKeys.join(', ')}`
              );
              onPartialLoad?.(envKeys, missingKeys);

              // Continue waiting for all required keys
              return;
            }
          }

          // Run custom validation if provided
          if (validate && !validate(env)) {
            log('Custom validation failed, continuing to wait...');
            return;
          }

          // Environment is ready!
          log(`Environment loaded successfully after ${pollCount} polls`);
          cleanup();
          onReady?.(env);
          resolve(env);
        }
      };

      // Set up timeout
      timeoutId = setTimeout(() => {
        cleanup();

        const shouldRetry = attemptNumber < retries;

        if (shouldRetry) {
          const nextDelay = attemptTimeout * backoffMultiplier;
          log(
            `Timeout reached, retrying... (attempt ${attemptNumber + 1}/${retries + 1}, next timeout: ${nextDelay}ms)`
          );
          onRetry?.(attemptNumber + 1, nextDelay);

          // Retry with exponential backoff
          attemptLoad(attemptNumber + 1, nextDelay)
            .then(resolve)
            .catch(reject);
        } else {
          log(`Timeout reached after ${attemptNumber + 1} attempts`);
          onTimeout?.();

          const error = new WaitForEnvError(
            `Environment variables (window.${varName}) not available after ${timeout}ms`,
            'TIMEOUT',
            varName,
            {
              timeout: attemptTimeout,
              attempts: attemptNumber + 1,
              missingKeys: requiredKeys.length > 0 ? requiredKeys : undefined
            }
          );

          if (debug) {
            console.error('[waitForEnv] Debug info:\n', error.getDebugInfo());
          }

          reject(error);
        }
      }, attemptTimeout);

      // Start polling immediately
      checkEnv();

      // Set up interval for subsequent checks
      intervalId = setInterval(checkEnv, interval);
    });
  };

  // Start the first attempt
  return attemptLoad(0, timeout);
};
