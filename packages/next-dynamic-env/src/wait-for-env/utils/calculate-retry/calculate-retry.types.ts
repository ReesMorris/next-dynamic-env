export interface RetryCalculation {
  /**
   * Indicates if a retry should be attempted
   */
  shouldRetry: boolean;

  /**
   * The next delay before the retry attempt
   */
  nextDelay: number;

  /**
   * The next attempt number (0-based)
   */
  nextAttempt: number;
}
