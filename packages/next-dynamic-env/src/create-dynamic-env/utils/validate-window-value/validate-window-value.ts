import { isZodSchema } from '@/validation';
import type z from 'zod';
import type { ValidateWindowValueOptions } from './validate-window-value.types';

/**
 * Validates a single value from the window object against a Zod schema field.
 *
 * This function is used internally to validate individual environment variables
 * that are dynamically injected into the window object at runtime. It extracts
 * the specific field schema for the given key and validates the value against it.
 *
 * @param options - Configuration options for validation
 *
 * @returns The validated and transformed value if successful, or the original value if:
 * - No schema is provided
 * - The schema doesn't contain a field for the given key
 * - Validation fails and error handling is set to 'warn' or custom handler
 *
 * @throws When validation fails and `onValidationError` is `'throw'`
 */
export const validateWindowValue = ({
  key,
  value,
  schema,
  onValidationError
}: ValidateWindowValueOptions): unknown => {
  if (!schema) {
    return value;
  }

  if (!isZodSchema(schema)) {
    return value;
  }

  const fieldSchema = schema.shape[key];
  if (!fieldSchema) {
    return value;
  }

  try {
    // fieldSchema is a ZodType, which has safeParse
    const result = (fieldSchema as z.ZodType).safeParse(value);

    if (!result || !result.success) {
      const errorHandler =
        onValidationError ??
        (process.env.NODE_ENV === 'development' ? 'throw' : 'warn');

      if (errorHandler === 'throw') {
        throw new Error(
          `Validation failed for ${key}: ${result.error.message}`
        );
      } else if (errorHandler === 'warn') {
        console.warn(`Validation failed for ${key}: ${result.error.message}`);
        return value;
      } else if (typeof errorHandler === 'function') {
        errorHandler(result.error);
        return value;
      }

      return value;
    }

    return result.data;
  } catch (error) {
    // Re-throw if it's our validation error
    if (error instanceof Error && error.message.includes('Validation failed')) {
      throw error;
    }
    // Otherwise, return the raw value
    return value;
  }
};
