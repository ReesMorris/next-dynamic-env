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
}
