import { DEFAULT_WINDOW_ENV_VAR_NAME } from '@/constants';
import type { DynamicEnv } from '@/types';
import { isBrowser } from '@/utils';
import { validateWindowValue } from '../validate-window-value';
import type { CreateEnvProxyOptions } from './create-env-proxy.types';

/**
 * Creates a proxy object for accessing environment variables with dynamic runtime support.
 *
 * This function creates a Proxy that intelligently handles environment variable access
 * based on the execution context (server vs client). It provides a unified interface
 * for accessing environment variables while supporting runtime injection on the client.
 *
 * @template T - The type of the environment variables object
 *
 * @param options - Configuration options for the proxy
 *
 * @returns A proxy object that provides typed access to environment variables
 *
 * @remarks
 * - On the server: Always returns values from `envVars`
 * - On the client: Checks `window` first, falls back to `envVars`
 * - Server-only variables throw an error on the client in development
 * - The special `__raw` property returns only client variables when on the client
 * - Non-string property keys return `undefined`
 * - Validation only occurs for values retrieved from the window object
 */
export const createEnvProxy = <T extends Record<string, unknown>>({
  envVars,
  rawEnvVars,
  schema,
  onValidationError,
  clientKeys = [],
  serverKeys = []
}: CreateEnvProxyOptions<T>): DynamicEnv<T> => {
  const isClient = isBrowser();

  // Always filter raw values to only include client keys
  // This ensures server variables are never exposed in __raw
  const rawValues = rawEnvVars || envVars;
  const filteredRawValues = Object.fromEntries(
    Object.entries(rawValues).filter(([key]) =>
      clientKeys.includes(key as keyof T)
    )
  );

  return new Proxy({ __raw: filteredRawValues } as DynamicEnv<T>, {
    get(target, key: string | symbol) {
      // Return the __raw property directly
      if (key === '__raw') {
        return target.__raw;
      }

      if (typeof key !== 'string') {
        return undefined;
      }

      // Check if this is a server-only variable being accessed on the client
      if (isClient && serverKeys.includes(key as keyof T)) {
        // In development, throw a descriptive error
        if (process.env.NODE_ENV === 'development') {
          throw new Error(
            `❌ Attempted to access server-only environment variable "${key}" on the client.\n` +
              `Server-only variables (${serverKeys.join(', ')}) are not available in the browser.\n` +
              `If you need this value on the client, move it to the 'client' object in your configuration.`
          );
        }
        // In production, return undefined
        return undefined;
      }

      // Server-side: always use the passed envVars
      if (!isClient) {
        return envVars[key];
      }

      // Client-side: prefer window.__NEXT_DYNAMIC_ENV__, fallback to envVars (build-time vars)
      const windowEnv = (window as unknown as Record<string, unknown>)[
        DEFAULT_WINDOW_ENV_VAR_NAME
      ] as Record<string, unknown> | undefined;

      if (windowEnv && windowEnv[key] !== undefined) {
        // Validate window value if schema is provided
        return validateWindowValue({
          key,
          value: windowEnv[key],
          schema,
          onValidationError
        });
      }

      return envVars[key];
    }
  });
};
