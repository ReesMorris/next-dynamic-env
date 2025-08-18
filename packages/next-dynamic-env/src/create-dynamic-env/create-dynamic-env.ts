import type { EnvVars } from '../types';
import { isBrowser } from '../utils';

/**
 * Creates a type-safe environment variable accessor function
 *
 * @param envVars - Object containing your environment variables
 * @returns A function to access environment variables that works on both server and client
 *
 * @example
 * ```ts
 * const RUNTIME_ENV = {
 *   API_URL: process.env.API_URL,
 *   APP_NAME: process.env.APP_NAME,
 * } as const;
 *
 * export const env = createDynamicEnv(RUNTIME_ENV);
 *
 * // Usage
 * const apiUrl = env('API_URL');
 * ```
 */
export const createDynamicEnv = <T extends EnvVars>(envVars: T) => {
  return function env<K extends keyof T>(key: K): T[K] {
    // Server-side: always use the passed envVars
    if (!isBrowser()) {
      return envVars[key];
    }

    // Client-side: prefer window.__ENV__, fallback to envVars (build-time vars)
    const windowEnv = window.__ENV__?.[key as string];
    return (windowEnv !== undefined ? windowEnv : envVars[key]) as T[K];
  };
};
