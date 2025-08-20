import type { DynamicEnv } from '@/types';
import { isBrowser } from '@/utils';
import type { z } from 'zod';
import type { CreateDynamicEnvConfig } from './create-dynamic-env.types';
import {
  checkDuplicateKeys,
  createEnvProxy,
  processEmptyStrings,
  validateRuntimeEnv
} from './utils';

/**
 * Creates a type-safe environment variable accessor with server/client separation
 * @param config - Configuration with Zod schema and server/client environment variables
 * @returns An object with validated environment variables
 *
 * @example
 * import { z } from 'zod';
 *
 * export const dynamicEnv = createDynamicEnv({
 *   schema: z.object({
 *     // Server-only variables
 *     DATABASE_URL: z.string().url(),
 *     API_SECRET: z.string().min(1),
 *     // Client variables
 *     API_URL: z.string().url(),
 *     APP_NAME: z.string().min(1),
 *   }),
 *   server: {
 *     DATABASE_URL: process.env.DATABASE_URL,
 *     API_SECRET: process.env.API_SECRET,
 *   },
 *   client: {
 *     API_URL: process.env.API_URL,
 *     APP_NAME: process.env.APP_NAME,
 *   }
 * });
 */
export function createDynamicEnv<T extends z.ZodObject<z.ZodRawShape>>(
  config: CreateDynamicEnvConfig<T>
): DynamicEnv<z.infer<T>> {
  const {
    schema,
    server = {},
    client = {},
    onValidationError = 'throw',
    skipValidation = false,
    emptyStringAsUndefined = true
  } = config;

  // Extract client keys for the proxy to know what's available on client
  const clientKeys = Object.keys(client) as Array<keyof z.infer<T>>;
  const serverKeys = Object.keys(server) as Array<keyof z.infer<T>>;

  // Check for duplicate keys between server and client
  checkDuplicateKeys(clientKeys, serverKeys);

  // Process environment variables: convert empty strings to undefined if enabled
  let processedServer = { ...server };
  let processedClient = { ...client };

  // If `emptyStringAsUndefined` is true, convert empty strings to undefined
  if (emptyStringAsUndefined) {
    processedServer = processEmptyStrings(processedServer);
    processedClient = processEmptyStrings(processedClient);
  }

  // Combine server and client env vars (client takes precedence)
  const runtimeEnv = { ...processedServer, ...processedClient };

  // On the client side, skip initial validation since process.env values are undefined
  // Validation will happen when accessing values from the window object
  const shouldSkipInitialValidation = isBrowser() || skipValidation;

  // Validate runtime environment (skip on client or if explicitly requested)
  const validatedEnv = validateRuntimeEnv({
    schema,
    runtimeEnv,
    onValidationError,
    skipValidation: shouldSkipInitialValidation
  });

  return createEnvProxy<z.infer<T>>({
    envVars: validatedEnv as z.infer<T>,
    rawEnvVars: runtimeEnv, // Pass original values for __raw
    clientKeys,
    serverKeys,
    schema,
    onValidationError
  });
}
