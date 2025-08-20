/**
 * Error codes used in `WaitForEnvError`
 */
export type WaitForEnvErrorCode =
  | 'TIMEOUT'
  | 'VALIDATION_ERROR'
  | 'PARTIAL_LOAD';

/**
 * Custom error class for waitForEnv failures
 */
export class WaitForEnvError extends Error {
  public readonly code: WaitForEnvErrorCode;
  public readonly timeout?: number;
  public readonly attempts?: number;
  public readonly missingKeys?: string[];
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: WaitForEnvErrorCode,
    details?: {
      timeout?: number;
      attempts?: number;
      missingKeys?: string[];
      [key: string]: unknown;
    }
  ) {
    super(message);
    this.name = 'WaitForEnvError';
    this.code = code;
    this.timeout = details?.timeout;
    this.attempts = details?.attempts;
    this.missingKeys = details?.missingKeys;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WaitForEnvError);
    }
  }

  /**
   * Helper method to get debugging information
   */
  getDebugInfo(): string {
    const info = [`Error Code: ${this.code}`];

    if (this.timeout) {
      info.push(`Timeout: ${this.timeout}ms`);
    }

    if (this.attempts) {
      info.push(`Attempts: ${this.attempts}`);
    }

    if (this.missingKeys && this.missingKeys.length > 0) {
      info.push(`Missing Keys: ${this.missingKeys.join(', ')}`);
    }

    if (typeof window !== 'undefined') {
      info.push(
        `Window State: ${
          Object.keys(window)
            .filter(k => k.includes('ENV'))
            .join(', ') || 'No ENV vars found'
        }`
      );
    }

    return info.join('\n');
  }
}
