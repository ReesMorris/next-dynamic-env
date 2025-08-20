export interface WaitForEnvOptions<T = Record<string, unknown>> {
  /**
   * Timeout in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Polling interval in milliseconds
   * @default 50
   */
  interval?: number;

  /**
   * Number of retry attempts before giving up
   * @default 0
   */
  retries?: number;

  /**
   * Delay multiplier for exponential backoff between retries
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Required environment variable keys to wait for
   *
   * If specified, will wait until all these keys are present
   *
   * @default []
   */
  requiredKeys?: string[];

  /**
   * Custom validation function to check if environment is ready
   *
   * Return `true` when environment is ready, false to keep waiting
   */
  validate?: (env: T) => boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Callback function to be called when the environment variables are ready
   */
  onReady?: (env: T) => void;

  /**
   * Callback function to be called when the timeout is reached
   */
  onTimeout?: () => void;

  /**
   * Callback function to be called on each retry attempt
   */
  onRetry?: (attempt: number, nextDelay: number) => void;

  /**
   * Callback function to be called when partial environment is detected
   */
  onPartialLoad?: (loadedKeys: string[], missingKeys: string[]) => void;
}
