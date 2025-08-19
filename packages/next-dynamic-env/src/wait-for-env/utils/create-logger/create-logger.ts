import type { Logger } from './create-logger.types';

/**
 * Creates a logger with optional prefix and debug mode
 *
 * @param enabled - Whether logging is enabled
 * @param prefix - Optional prefix for all log messages
 * @returns Logger object with log, warn, and error methods
 */
export const createLogger = (enabled: boolean, prefix?: string): Logger => {
  const formatMessage = (message: string): string => {
    return prefix ? `[${prefix}] ${message}` : message;
  };

  return {
    log: (message: string) => {
      if (enabled) {
        console.log(formatMessage(message));
      }
    },
    warn: (message: string) => {
      if (enabled) {
        console.warn(formatMessage(message));
      }
    },
    error: (message: string, details?: unknown) => {
      if (enabled) {
        if (details !== undefined) {
          console.error(formatMessage(message), details);
        } else {
          console.error(formatMessage(message));
        }
      }
    }
  };
};
