import type { RetryCalculation } from './calculate-retry.types';

/**
 * Calculates retry parameters for exponential backoff
 *
 * @param attemptNumber - Current attempt number (0-based)
 * @param currentTimeout - Current timeout in milliseconds
 * @param maxRetries - Maximum number of retry attempts
 * @param backoffMultiplier - Multiplier for exponential backoff (default: 2)
 * @returns Object containing retry decision and next delay
 */
export const calculateRetry = (
  attemptNumber: number,
  currentTimeout: number,
  maxRetries: number,
  backoffMultiplier = 2
): RetryCalculation => {
  const shouldRetry = attemptNumber < maxRetries;
  const nextDelay = shouldRetry
    ? currentTimeout * backoffMultiplier
    : currentTimeout;
  const nextAttempt = attemptNumber + 1;

  return {
    shouldRetry,
    nextDelay,
    nextAttempt
  };
};
