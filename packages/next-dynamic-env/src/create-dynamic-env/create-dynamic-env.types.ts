import type { z } from 'zod';

/**
 * Configuration for createDynamicEnv with server/client separation
 */
export interface CreateDynamicEnvConfig<T extends z.ZodObject<z.ZodRawShape>> {
  /**
   * Zod schema for validating all environment variables (both server and client)
   */
  schema: T;

  /**
   * Server-only environment variables
   * These will only be available on the server and will throw/return undefined on the client
   */
  server?: Partial<Record<keyof z.infer<T>, string | undefined>>;

  /**
   * Client environment variables
   * These will be available on both server and client (injected via DynamicEnvScript)
   */
  client?: Partial<Record<keyof z.infer<T>, string | undefined>>;

  /**
   * How to handle validation errors
   * - 'throw': Throw an error (default in development)
   * - 'warn': Log a warning and continue (default in production)
   * - function: Custom error handler
   */
  onValidationError?: 'throw' | 'warn' | ((errors: z.ZodError) => void);

  /**
   * Whether to skip validation (useful for build time)
   * @default false
   */
  skipValidation?: boolean;
}
