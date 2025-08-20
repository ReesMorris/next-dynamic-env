import type { ProcessedEnv, ServerEnv } from '@/types';
import { isBrowser } from '@/utils';

/**
 * Creates a proxy object for type-safe server environment variable access.
 *
 * This proxy:
 * - On server: Returns processed server values
 * - On browser: Throws error in development, returns undefined in production
 * - Provides access to raw values via __raw property
 * - Ensures server-only variables are never exposed to the client
 *
 * @param processedEnv - Processed server environment variables
 * @param rawEnv - Raw server environment variable values
 * @returns A proxy object for server environment access
 */
export const createServerEnvProxy = <T extends ProcessedEnv>(
  processedEnv: T,
  rawEnv: ProcessedEnv
): ServerEnv<T> => {
  return new Proxy({} as ServerEnv<T>, {
    get(_, prop: string | symbol) {
      // Handle special properties
      if (prop === '__raw') {
        return rawEnv;
      }
      if (prop === '__isServer') {
        return true;
      }

      const key = String(prop);

      // On the browser, server variables are not accessible
      if (isBrowser()) {
        if (process.env.NODE_ENV === 'development') {
          throw new Error(
            `Attempted to access server-only environment variable "${key}" on the client. ` +
              'Server environment variables are only available on the server.'
          );
        }
        return undefined;
      }

      // Return the processed value (server-side only)
      return processedEnv[key as keyof T];
    },

    has(_, prop: string | symbol) {
      const key = String(prop);
      // In browser, server env vars don't exist
      if (isBrowser()) {
        return key === '__raw' || key === '__isServer';
      }
      return key === '__raw' || key === '__isServer' || key in processedEnv;
    },

    ownKeys() {
      // In browser, only expose special properties
      if (isBrowser()) {
        return ['__raw', '__isServer'];
      }
      return [...Object.keys(processedEnv), '__raw', '__isServer'];
    },

    getOwnPropertyDescriptor(_, prop: string | symbol) {
      const key = String(prop);

      // In browser, only special properties are accessible
      if (isBrowser()) {
        if (key === '__raw' || key === '__isServer') {
          return { configurable: true, enumerable: true };
        }
        return undefined;
      }

      if (key === '__raw' || key === '__isServer' || key in processedEnv) {
        return { configurable: true, enumerable: true };
      }
      return undefined;
    }
  });
};
