import { DEFAULT_WINDOW_ENV_VAR_NAME } from '@/constants';
import type { DynamicEnv, EnvVars } from '@/types';
import { isBrowser } from '@/utils';
import type { CreateDynamicEnvOptions } from './create-dynamic-env.types';

/**
 * Creates a type-safe environment variable accessor object with raw values for the script
 *
 * @param envVars - Object containing your environment variables
 * @param options - Optional configuration
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
  envVars: T,
  { varName = DEFAULT_WINDOW_ENV_VAR_NAME }: CreateDynamicEnvOptions = {}
): DynamicEnv<T> => {
  return new Proxy({ __raw: envVars } as DynamicEnv<T>, {
    get(target, key: string | symbol) {
      // Return the __raw property directly
      if (key === '__raw') {
        return target.__raw;
      }

      if (typeof key !== 'string') {
        return undefined;
      }

      // Server-side: always use the passed envVars
      if (!isBrowser()) {
        return envVars[key];
      }

      // Client-side: prefer window[varName], fallback to envVars (build-time vars)
      // biome-ignore lint/suspicious/noExplicitAny: Window is not explicitly typed
      const windowEnv = (window as any)[varName]?.[key];
      return windowEnv !== undefined ? windowEnv : envVars[key];
    }
  });
};
