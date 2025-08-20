import { WaitForEnvError } from '@/wait-for-env';

/**
 * Validates parameters for the waitForEnv function
 *
 * Performs validation checks on timeout and interval parameters
 * to ensure they meet the requirements for proper polling behavior.
 *
 * @param timeout - The timeout value in milliseconds. Must be greater than 0.
 * @param interval - The polling interval in milliseconds. Must be greater than 0 and less than timeout.
 *
 * @throws With code `'VALIDATION_ERROR'` if any parameter is invalid:
 * - If timeout is less than or equal to 0
 * - If interval is less than or equal to 0 or greater than or equal to timeout
 */
export const validateParams = (timeout: number, interval: number) => {
  if (timeout <= 0) {
    throw new WaitForEnvError(
      'Timeout must be greater than 0',
      'VALIDATION_ERROR',
      { timeout }
    );
  }

  if (interval <= 0 || interval >= timeout) {
    throw new WaitForEnvError(
      'Interval must be greater than 0 and less than timeout',
      'VALIDATION_ERROR',
      { interval, timeout }
    );
  }
};
