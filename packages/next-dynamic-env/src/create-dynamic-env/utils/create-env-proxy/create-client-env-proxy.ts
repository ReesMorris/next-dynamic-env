import { DEFAULT_WINDOW_ENV_VAR_NAME } from '@/constants';
import type { ClientEnv, ProcessedEnv } from '@/types';
import { isBrowser } from '@/utils';

/**
 * Creates a proxy object for type-safe client environment variable access.
 *
 * This proxy:
 * - On server: Returns processed client values
 * - On browser: Returns values from `window[DEFAULT_WINDOW_ENV_VAR_NAME]`
 * - Provides access to raw values via `__raw` property
 *
 * @param processedEnv - Processed client environment variables
 * @param rawEnv - Raw client environment variable values
 * @returns A proxy object for client environment access
 */
export const createClientEnvProxy = <T extends ProcessedEnv>(
  processedEnv: T,
  rawEnv: ProcessedEnv
): ClientEnv<T> => {
  return new Proxy({} as ClientEnv<T>, {
    get(_, prop: string | symbol) {
      // Handle special properties
      if (prop === '__raw') {
        return rawEnv;
      }
      if (prop === '__isClient') {
        return true;
      }

      const key = String(prop);

      // On the browser, get client variables from window if available
      if (isBrowser()) {
        const windowEnv = window[DEFAULT_WINDOW_ENV_VAR_NAME];
        if (windowEnv && key in windowEnv) {
          return windowEnv[key];
        }
      }

      // Return the processed value (server-side or fallback)
      return processedEnv[key as keyof T];
    },

    has(_, prop: string | symbol) {
      const key = String(prop);
      return key === '__raw' || key === '__isClient' || key in processedEnv;
    },

    ownKeys() {
      return [...Object.keys(processedEnv), '__raw', '__isClient'];
    },

    getOwnPropertyDescriptor(_, prop: string | symbol) {
      const key = String(prop);
      if (key === '__raw' || key === '__isClient' || key in processedEnv) {
        return { configurable: true, enumerable: true };
      }
      return undefined;
    }
  });
};
