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
 * - On the client: Checks `window[varName]` first, falls back to `envVars`
 * - The special `__raw` property always returns the original `envVars` object
 * - Non-string property keys return `undefined`
 * - Validation only occurs for values retrieved from the window object
 */
export const createEnvProxy = <T extends Record<string, unknown>>({
  envVars,
  rawEnvVars,
  varName,
  schema,
  onValidationError
}: CreateEnvProxyOptions<T>): DynamicEnv<T> => {
  // Use rawEnvVars for __raw if provided (for Zod validation case), otherwise use envVars
  const rawValues = rawEnvVars || envVars;
  return new Proxy({ __raw: rawValues } as DynamicEnv<T>, {
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
      const windowEnv = (window as unknown as Record<string, unknown>)[
        varName
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
