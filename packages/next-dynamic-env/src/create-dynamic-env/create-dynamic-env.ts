import { DEFAULT_WINDOW_ENV_VAR_NAME } from '@/constants';
import type { DynamicEnv, EnvVars } from '@/types';
import { isBrowser } from '@/utils';
import type { z } from 'zod';
import type {
  CreateDynamicEnvConfig,
  CreateDynamicEnvOptions
} from './create-dynamic-env.types';
import {
  createEnvProxy,
  isConfigWithSchema,
  validateRuntimeEnv
} from './utils';

/**
 * Creates a type-safe environment variable accessor object
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
 */
export function createDynamicEnv<T extends EnvVars>(
  envVars: T,
  options?: CreateDynamicEnvOptions
): DynamicEnv<T>;

/**
 * Creates a type-safe environment variable accessor object with Zod validation
 * @param config - Configuration with Zod schema and runtime environment
 * @returns An object with both the proxy accessor and raw values for DynamicEnvScript
 *
 * @example
 * import { z } from 'zod';
 *
 * export const dynamicEnv = createDynamicEnv({
 *   schema: z.object({
 *     API_URL: z.string().url(),
 *     APP_NAME: z.string().min(1),
 *     PORT: z.coerce.number().default(3000)
 *   }),
 *   runtimeEnv: {
 *     API_URL: process.env.API_URL,
 *     APP_NAME: process.env.APP_NAME,
 *     PORT: process.env.PORT
 *   }
 * });
 */
export function createDynamicEnv<T extends z.ZodObject<z.ZodRawShape>>(
  config: CreateDynamicEnvConfig<T>
): DynamicEnv<z.infer<T>>;

// The actual implementation
export function createDynamicEnv<
  T extends EnvVars | z.ZodObject<z.ZodRawShape>
>(
  configOrEnvVars: T | CreateDynamicEnvConfig<z.ZodObject<z.ZodRawShape>>,
  options?: CreateDynamicEnvOptions
): DynamicEnv<Record<string, unknown>> {
  // Check if it's a config object with schema
  if (isConfigWithSchema(configOrEnvVars)) {
    const {
      schema,
      runtimeEnv,
      onValidationError,
      varName = DEFAULT_WINDOW_ENV_VAR_NAME,
      skipValidation = false
    } = configOrEnvVars;

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

    return createEnvProxy({
      envVars: validatedEnv,
      rawEnvVars: runtimeEnv, // Pass original values for __raw
      varName,
      schema,
      onValidationError
    });
  }

  // Simple usage without schema
  const envVars = configOrEnvVars as EnvVars;
  const varName = options?.varName ?? DEFAULT_WINDOW_ENV_VAR_NAME;

  return createEnvProxy({
    envVars,
    varName
  });
}
