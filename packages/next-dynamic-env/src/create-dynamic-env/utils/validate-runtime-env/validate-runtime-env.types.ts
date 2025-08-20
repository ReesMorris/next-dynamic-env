import type { onValidationError } from '@/types';
import type z from 'zod';

/**
 * Options for validating runtime environment variables.
 */
export interface ValidateRuntimeEnvOptions<
  T extends z.ZodRawShape = z.ZodRawShape
> {
  /**
   * The Zod schema used to validate the runtime environment variables.
   */
  schema: z.ZodObject<T>;

  /**
   * The runtime environment variables to validate against the schema.
   */
  runtimeEnv: Record<string, string | undefined>;

  /**
   * Determines how validation errors are handled.
   * - `'throw'`: Throws an error when validation fails.
   * - `'warn'`: Logs a warning when validation fails.
   * - Function: A custom handler for validation errors.
   * @default 'throw'
   */
  onValidationError?: onValidationError;

  /**
   * When true, skips the validation process entirely.
   * @default false
   */
  skipValidation?: boolean;
}
