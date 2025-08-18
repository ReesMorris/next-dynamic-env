export interface WaitForEnvOptions {
  /**
   * Timeout in milliseconds (default: 5000)
   */
  timeout?: number;

  /**
   * Polling interval in milliseconds (default: 50)
   */
  interval?: number;

  /**
   * Custom variable name for the global object
   * @default '__ENV__'
   */
  varName?: string;

  /**
   * Callback function to be called when the environment variables are ready
   */
  onReady?: () => void;

  /**
   * Callback function to be called when the timeout is reached
   */
  onTimeout?: () => void;
}
