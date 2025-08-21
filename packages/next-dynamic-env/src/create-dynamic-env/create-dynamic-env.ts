import type {
  DynamicEnvResult,
  EnvEntry,
  InferEnvConfig,
  ProcessedEnv,
  ValidationError
} from '@/types';
import { isBrowser, isBuildPhase } from '@/utils';
import type { CreateDynamicEnvConfig } from './create-dynamic-env.types';
import {
  createClientEnvProxy,
  createServerEnvProxy,
  handleValidationErrors,
  processEnvironmentVariables
} from './utils';

/**
 * Creates type-safe environment variable accessors with server/client separation
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * export const { clientEnv, serverEnv } = createDynamicEnv({
 *   server: {
 *     DATABASE_URL: [process.env.DATABASE_URL, z.url()],
 *     API_SECRET: process.env.API_SECRET, // No validation
 *   },
 *   client: {
 *     API_URL: [process.env.NEXT_PUBLIC_API_URL, z.url()],
 *     APP_NAME: [process.env.NEXT_PUBLIC_APP_NAME, z.string().min(1)],
 *     DEBUG: process.env.NEXT_PUBLIC_DEBUG, // No validation
 *   }
 * });
 *
 * // In layout.tsx
 * <DynamicEnvScript clientEnv={clientEnv} />
 *
 * // In server components
 * const db = connect(serverEnv.DATABASE_URL);
 *
 * // In client components
 * console.log(clientEnv.API_URL);
 * ```
 */
export const createDynamicEnv = <
  TServer extends Record<string, EnvEntry>,
  TClient extends Record<string, EnvEntry>
>(
  config: CreateDynamicEnvConfig<TServer, TClient>
): DynamicEnvResult<InferEnvConfig<TClient>, InferEnvConfig<TServer>> => {
  const {
    server = {} as TServer,
    client = {} as TClient,
    onValidationError = 'throw',
    skipValidation = false,
    emptyStringAsUndefined = true
  } = config;

  // Initialize environment objects
  let processedClientEnv: ProcessedEnv = {};
  let rawClientEnv: ProcessedEnv = {};
  let processedServerEnv: ProcessedEnv = {};
  let rawServerEnv: ProcessedEnv = {};
  const allErrors: ValidationError[] = [];

  // Skip validation during Next.js build phase
  // Environment variables won't be available when building Docker images
  const shouldSkipValidation = skipValidation || isBuildPhase();

  // Only process on server - in browser, values come from window
  if (!isBrowser()) {
    // Process server variables
    const serverResult = processEnvironmentVariables(
      server,
      shouldSkipValidation,
      emptyStringAsUndefined
    );
    processedServerEnv = serverResult.processedEnv;
    rawServerEnv = serverResult.rawEnv;
    allErrors.push(...serverResult.errors);

    // Process client variables
    const clientResult = processEnvironmentVariables(
      client,
      shouldSkipValidation,
      emptyStringAsUndefined
    );
    processedClientEnv = clientResult.processedEnv;
    rawClientEnv = clientResult.rawEnv;
    allErrors.push(...clientResult.errors);
  }

  // Handle validation errors
  handleValidationErrors(allErrors, onValidationError, shouldSkipValidation);

  // Create separate proxies for client and server
  const clientEnv = createClientEnvProxy(
    processedClientEnv as InferEnvConfig<TClient>,
    rawClientEnv
  );

  const serverEnv = createServerEnvProxy(
    processedServerEnv as InferEnvConfig<TServer>,
    rawServerEnv
  );

  return { clientEnv, serverEnv };
};
