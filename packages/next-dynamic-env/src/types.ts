import type z from 'zod';

export type EnvVars = Record<string, string | undefined>;

/**
 * Dynamic environment variable object with raw values
 */
export type DynamicEnv<T> = Readonly<T> & { readonly __raw: T };

/**
 * Defines behavior when validation fails.
 * - 'throw': Throws an error on validation failure
 * - 'warn': Logs a warning on validation failure
 * - Function: Custom handler for validation errors
 */
export type onValidationError =
  | 'throw'
  | 'warn'
  | ((errors: z.ZodError) => void);
