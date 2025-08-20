import type { EnvEntry } from '@/types';
import { validateWithSchema } from '../validate-with-schema';

/**
 * Processes an environment variable entry and returns its validated or raw value.
 *
 * This function handles three types of environment entries:
 * 1. Raw values (strings or undefined) - returned as-is with optional empty string handling
 * 2. Single-element tuples `[value]` - treated as raw values with no validation
 * 3. Two-element tuples `[value, schema]` - validated against the provided schema
 *
 * @param key - The environment variable key/name (used for error messages)
 * @param entry - The environment entry to process. Can be:
 * - A raw string or undefined value
 * - A tuple `[value]` for raw value without validation
 * - A tuple `[value, schema]` for validated value
 * @param emptyStringAsUndefined - If true, converts empty strings to undefined
 *
 * @returns The processed value, which may be:
 * - The original raw value (if no schema provided)
 * - `undefined` (if empty string and `emptyStringAsUndefined` is true)
 * - The validated and potentially transformed value (if schema provided)
 *
 * @throws If validation fails when a schema is provided. The error message
 * includes the key name and the underlying validation error details.
 */
export const processEnvEntry = (
  key: string,
  entry: EnvEntry,
  emptyStringAsUndefined: boolean
): unknown => {
  // Handle raw values (not arrays)
  if (!Array.isArray(entry)) {
    const value = entry;
    if (emptyStringAsUndefined && value === '') {
      return undefined;
    }
    return value;
  }

  // Handle tuple format
  const [rawValue, schema] = entry;

  // Convert empty string to undefined if enabled
  const value =
    emptyStringAsUndefined && rawValue === '' ? undefined : rawValue;

  // No schema provided, return raw value
  if (!schema) {
    return value;
  }

  // Validate with standard schema
  return validateWithSchema(key, value, schema);
};
