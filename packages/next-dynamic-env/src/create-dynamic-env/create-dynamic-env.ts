import type { EnvVars } from '../types';
import { isBrowser } from '../utils';

// Internal type that includes __raw
type DynamicEnvProxy<T extends EnvVars> = Readonly<T> & { __raw: T };

// Public type that hides __raw from autocomplete
type DynamicEnvPublic<T extends EnvVars> = Readonly<T>;

/**
 * Creates a type-safe environment variable accessor object with raw values for the script
 *
 * @param envVars - Object containing your environment variables
 * @returns An object with both the proxy accessor and raw values for DynamicEnvScript
 *
 * @example
 * ```ts
 * export const dynamicEnv = createDynamicEnv({
 *   API_URL: process.env.API_URL,
 *   APP_NAME: process.env.APP_NAME,
 * });
 *
 * // In your layout:
 * <DynamicEnvScript env={dynamicEnv} />
 *
 * // Usage - clean property access!
 * const apiUrl = dynamicEnv.API_URL;
 * const appName = dynamicEnv.APP_NAME;
 * ```
 */
export const createDynamicEnv = <T extends EnvVars>(
  envVars: T
): DynamicEnvPublic<T> => {
  const proxy = new Proxy({} as T, {
    get(_, key: string | symbol) {
      // Special property to get raw values for DynamicEnvScript
      if (key === '__raw') {
        return envVars;
      }

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
  }) as DynamicEnvProxy<T>;

  // Return with the public type that doesn't expose __raw
  return proxy as DynamicEnvPublic<T>;
};
