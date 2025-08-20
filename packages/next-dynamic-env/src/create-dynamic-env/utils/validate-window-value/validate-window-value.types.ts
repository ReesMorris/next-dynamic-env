import type { onValidationError } from '@/types';
import type z from 'zod';

/**
 * Options for validating a value from the window object.
 */
export interface ValidateWindowValueOptions<
  T extends z.ZodRawShape = z.ZodRawShape
> {
  /**
   * The key used to identify the window value being validated
   */
  key: string;

  /**
   * The value to be validated (typically a string from window object)
   */
  value: unknown;

  /**
   * Optional Zod schema used to validate the structure and types of the value
   */
  schema?: z.ZodObject<T>;

  /**
   * Determines how validation errors are handled:
   * - `'throw'`: throws an error when validation fails
   * - `'warn'`: logs a warning when validation fails
   * - function: custom handler called with the validation errors
   */
  onValidationError?: onValidationError;
}
