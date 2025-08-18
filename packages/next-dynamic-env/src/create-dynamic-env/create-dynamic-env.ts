import type { EnvVars } from '../types';
import { isBrowser } from '../utils';

/**
 * Creates a type-safe environment variable accessor object
 *
 * @param envVars - Object containing your environment variables
 * @returns An object to access environment variables that works on both server and client
 *
 * @example
 * ```ts
 * const RUNTIME_ENV = {
 *   API_URL: process.env.API_URL,
 *   APP_NAME: process.env.APP_NAME,
 * } as const;
 *
 * export const dynamicEnv = createDynamicEnv(RUNTIME_ENV);
 *
 * // Usage - clean property access!
 * const apiUrl = dynamicEnv.API_URL;
 * const appName = dynamicEnv.APP_NAME;
 * ```
 */
export const createDynamicEnv = <T extends EnvVars>(
  envVars: T
): Readonly<T> => {
  return new Proxy({} as T, {
    get(_, key: string | symbol) {
      if (typeof key !== 'string') {
        return undefined;
      }

      // Server-side: always use the passed envVars
      if (!isBrowser()) {
        return envVars[key];
      }

      // Client-side: prefer window.__NEXT_DYNAMIC_ENV__, fallback to envVars (build-time vars)
      const windowEnv = window.__NEXT_DYNAMIC_ENV__?.[key];
      return windowEnv !== undefined ? windowEnv : envVars[key];
    }
  });
};
