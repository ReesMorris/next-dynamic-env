import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Validates a value against a standard-schema compatible validator.
 *
 * This function provides a unified interface for validating environment variables
 * using any validator that implements the standard-schema specification (e.g., Zod, Yup, Valibot).
 *
 * @param key - The name of the environment variable being validated (used for error messages)
 * @param value - The value to validate (typically a string from `process.env`)
 * @param schema - A standard-schema compatible validator instance
 *
 * @returns The validated and potentially transformed value
 *
 * @throws If validation fails, containing details about validation issues
 * @throws If the schema returns a Promise (async validation is not supported)
 *
 * @see {@link https://github.com/standard-schema/standard-schema} for standard-schema specification
 */
export const validateWithSchema = (
  key: string,
  value: unknown,
  schema: StandardSchemaV1<unknown, unknown>
): unknown => {
  const result = schema['~standard'].validate(value);

  // Handle async validation (not supported in synchronous context)
  if (result instanceof Promise) {
    throw new Error(
      `Async validation is not supported. Schema for "${key}" returned a Promise.`
    );
  }

  if ('issues' in result && result.issues && result.issues.length > 0) {
    const error = new Error(
      `Validation failed for ${key}: ${JSON.stringify(result.issues)}`
    );
    throw error;
  }

  if ('value' in result) {
    return result.value;
  }

  // Fallback if schema doesn't follow standard-schema properly
  return value;
};
