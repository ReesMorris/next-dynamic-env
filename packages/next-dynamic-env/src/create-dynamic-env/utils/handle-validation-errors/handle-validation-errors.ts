import type { OnValidationError, ValidationError } from '@/types';

/**
 * Handles validation errors based on the configured error handling strategy.
 *
 * @param errors - Array of validation errors with their keys
 * @param onValidationError - Error handling strategy (`'throw'`, `'warn'`, or custom function)
 * @param skipValidation - Whether validation is being skipped
 *
 * @throws If `onValidationError` is '`throw'` and there are errors
 */
export const handleValidationErrors = (
  errors: ValidationError[],
  onValidationError: OnValidationError,
  skipValidation: boolean
): void => {
  if (errors.length === 0 || skipValidation) {
    return;
  }

  const errorMessage = errors
    .map(
      ({ key, error }) =>
        `  - ${key}: ${error instanceof Error ? error.message : String(error)}`
    )
    .join('\n');

  const fullMessage = `Environment validation failed:\n${errorMessage}`;

  if (onValidationError === 'throw') {
    throw new Error(fullMessage);
  }

  if (onValidationError === 'warn') {
    console.warn(fullMessage);
    return;
  }

  if (typeof onValidationError === 'function') {
    onValidationError(new Error(fullMessage));
  }
};
