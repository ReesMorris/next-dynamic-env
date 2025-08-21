import { colors } from '@/utils/colors';

/**
 * Formats a single validation error for pretty terminal display.
 *
 * This function creates a visually appealing error message by:
 * - Formatting the key with cyan color and consistent padding
 * - Extracting the error message from Error objects
 * - Removing redundant key prefixes from error messages
 * - Applying dim styling to the error message
 *
 * @param key - The environment variable key that failed validation
 * @param error - The validation error (Error object or any value)
 * @returns A formatted string with colored key and dimmed error message
 *
 * @remarks
 * The function strips redundant key prefixes from error messages
 * when the error message starts with the key followed by a colon.
 */
export const formatError = (key: string, error: unknown): string => {
  const keyDisplay = colors.cyan(key.padEnd(20));
  let message = '';

  if (error instanceof Error) {
    const errorMsg = error.message;
    const colonIndex = errorMsg.indexOf(':');
    if (colonIndex !== -1) {
      message = errorMsg.substring(colonIndex + 1).trim();
    } else {
      message = errorMsg;
    }
  } else {
    message = String(error);
  }

  return `  ${keyDisplay} ${colors.dim(message)}`;
};
