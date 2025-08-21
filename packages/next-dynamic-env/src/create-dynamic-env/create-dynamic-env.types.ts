import type { EnvEntry, OnValidationError } from '@/types';

/**
 * Configuration for createDynamicEnv with server/client separation
 */
export interface CreateDynamicEnvConfig<
  TServer extends Record<string, EnvEntry> = Record<string, EnvEntry>,
  TClient extends Record<string, EnvEntry> = Record<string, EnvEntry>
> {
  /**
   * Server-only environment variables
   * These will only be available on the server and will throw/return undefined on the client
   */
  server?: TServer;

  /**
   * Client environment variables
   * These will be available on both server and client (injected via DynamicEnvScript)
   */
  client?: TClient;

  /**
   * How to handle validation errors
   * - `'throw'`: Throw an error (default in development)
   * - `'warn'`: Log a warning and continue (default in production)
   * - function: Custom error handler
   */
  onValidationError?: OnValidationError;

  /**
   * Whether to skip validation (useful for build time)
   * @default false
   */
  skipValidation?: boolean;

  /**
   * Convert empty strings to undefined before validation
   * This is useful for optional fields that receive empty strings from environment variables
   * @default true
   */
  emptyStringAsUndefined?: boolean;
}
