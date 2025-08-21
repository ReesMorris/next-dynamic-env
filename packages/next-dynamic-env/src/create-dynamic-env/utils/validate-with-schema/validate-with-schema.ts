import type { StandardSchemaV1 } from '@standard-schema/spec';
import { formatValidationIssues } from '../format-validation-issues';

/**
 * Validates a value against a standard-schema compatible validator.
 *
 * This function provides a unified interface for validating environment variables
 * using any validator that implements the standard-schema specification (e.g., Zod, Yup, Valibot).
 * It handles both successful validation with potential transformations and validation failures
 * with formatted error messages.
 *
 * @param key - The name of the environment variable being validated (used for error messages)
 * @param value - The value to validate (typically a string from `process.env`)
 * @param schema - A standard-schema compatible validator instance
 *
 * @returns The validated and potentially transformed value
 *
 * @throws If validation fails, containing formatted validation issues
 * @throws If the schema returns a Promise (async validation is not supported)
 *
 * @remarks
 * - Async validation is not supported and will throw an error
 * - The function extracts transformed values from successful validation
 * - Validation issues are formatted using formatValidationIssues for readability
 * - Compatible with any standard-schema compliant validator
 *
 * @see {@link https://github.com/standard-schema/standard-schema} for standard-schema specification
 * @see {@link formatValidationIssues} for error message formatting
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
    throw new Error(formatValidationIssues(result.issues));
  }

  if ('value' in result) {
    return result.value;
  }

  // Fallback if schema doesn't follow standard-schema properly
  return value;
};
