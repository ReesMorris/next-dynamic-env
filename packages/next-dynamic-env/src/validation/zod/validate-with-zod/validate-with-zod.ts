import type z from 'zod';
import { formatZodError } from '../format-zod-error';

/**
 * Validate environment variables against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param env - The environment variables to validate
 * @param onValidationError - Optional callback for handling validation errors
 * @returns The validated environment variables as a record
 */
export const validateWithZod = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  env: Record<string, string | undefined>,
  onValidationError?: 'throw' | 'warn' | ((errors: z.ZodError) => void)
): Record<string, unknown> => {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errorHandler =
      onValidationError ??
      (process.env.NODE_ENV === 'development' ? 'throw' : 'warn');

    if (errorHandler === 'throw') {
      throw new Error(formatZodError(result.error));
    } else if (errorHandler === 'warn') {
      console.warn(formatZodError(result.error));
      // Return the unvalidated env as fallback
      return env as Record<string, unknown>;
    } else {
      // Custom error handler
      errorHandler(result.error);
      return env as Record<string, unknown>;
    }
  }

  return result.data;
};
