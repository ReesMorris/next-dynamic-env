import type { ValidationError } from '@/types';

/**
 * Creates a plain text error message without ANSI formatting.
 *
 * This function generates a simple, readable error message suitable for
 * environments that don't support ANSI colors (e.g., browsers, non-TTY outputs).
 * It lists all validation errors in a bulleted format with clear key-value pairs.
 *
 * @param errors - Array of validation errors with keys and error details
 * @returns A plain text error message with bulleted list of failures
 *
 * @see {@link createPrettyMessage} for the colored terminal version
 */
export const createPlainMessage = (errors: ValidationError[]): string => {
  const errorMessage = errors
    .map(
      ({ key, error }) =>
        `  - ${key}: ${error instanceof Error ? error.message : String(error)}`
    )
    .join('\n');

  return `Environment validation failed:\n${errorMessage}`;
};
