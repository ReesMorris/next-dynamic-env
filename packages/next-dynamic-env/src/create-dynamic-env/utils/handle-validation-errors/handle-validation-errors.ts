import type { OnValidationError, ValidationError } from '@/types';
import { isBrowser } from '@/utils/is-browser/is-browser';
import { createPlainMessage } from './create-plain-message';
import { createPrettyMessage } from './create-pretty-message';

/**
 * Handles validation errors based on the configured error handling strategy.
 *
 * This function processes validation errors according to the specified strategy:
 * - `'throw'`: In browser, throws an Error; in Node.js, logs to console.error and exits process
 * - `'warn'`: Logs a warning message to console
 * - Custom function: Calls the provided error handler
 *
 * The function automatically selects the appropriate message format:
 * - Pretty formatted messages with colors for terminal environments
 * - Plain text messages for browser environments
 *
 * @param errors - Array of validation errors with their keys
 * @param onValidationError - Error handling strategy (`'throw'`, `'warn'`, or custom function)
 * @param skipValidation - Whether validation is being skipped (bypasses all error handling)
 *
 * @throws If `onValidationError` is `'throw'` and running in a browser
 *
 * @remarks
 * - In Node.js with `'throw'` mode, the function uses `process.exit(1)` instead of throwing
 *   to avoid showing stack traces in production environments
 * - Respects `NO_COLOR` and `FORCE_COLOR` environment variables for terminal output
 * - When `skipValidation` is `true`, no errors are processed regardless of strategy
 */
export const handleValidationErrors = (
  errors: ValidationError[],
  onValidationError: OnValidationError,
  skipValidation: boolean
): void => {
  // If there are no errors or validation is skipped, do nothing
  if (errors.length === 0 || skipValidation) {
    return;
  }

  const isInBrowser = isBrowser();
  const prettyMessage = isInBrowser
    ? createPlainMessage(errors)
    : createPrettyMessage(errors);
  const plainMessage = createPlainMessage(errors);

  if (onValidationError === 'throw') {
    if (isInBrowser) {
      throw new Error(plainMessage);
    } else {
      console.error(prettyMessage);
      process.exit(1);
    }
  }

  if (onValidationError === 'warn') {
    if (isInBrowser) {
      console.warn(plainMessage);
    } else {
      console.warn(prettyMessage);
    }
    return;
  }

  if (typeof onValidationError === 'function') {
    onValidationError(new Error(plainMessage));
  }
};
