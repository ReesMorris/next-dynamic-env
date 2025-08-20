import type z from 'zod';

/**
 * Options for creating an environment variable proxy.
 * @template T The type of environment variables
 */
export interface CreateEnvProxyOptions<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  /**
   * The object containing environment variables to be proxied.
   */
  envVars: T;

  /**
   * The original raw environment variables (before validation/transformation).
   * Used for the __raw property to maintain string values for serialization.
   */
  rawEnvVars?: Record<string, string | undefined>;

  /**
   * Optional Zod schema for validating environment variables.
   */
  schema?: z.ZodObject<z.ZodRawShape>;

  /**
   * Defines behavior when validation fails.
   * - 'throw': Throws an error on validation failure
   * - 'warn': Logs a warning on validation failure
   * - Function: Custom handler for validation errors
   */
  onValidationError?: 'throw' | 'warn' | ((errors: z.ZodError) => void);

  /**
   * Keys that are available on the client
   */
  clientKeys?: Array<keyof T>;

  /**
   * Keys that are only available on the server
   */
  serverKeys?: Array<keyof T>;
}
