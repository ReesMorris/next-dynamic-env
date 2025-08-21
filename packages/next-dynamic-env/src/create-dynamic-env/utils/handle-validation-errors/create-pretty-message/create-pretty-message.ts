import type { ValidationError } from '@/types';
import { colors } from '@/utils/colors';
import { formatError } from '../format-error';

/**
 * Creates a visually appealing error message with colors and emojis for terminal output.
 *
 * This function generates a formatted error message that includes:
 * - A red, bold header with an error emoji
 * - Color-coded environment variable keys and their error messages
 * - A yellow footer with error count and helpful guidance
 *
 * @param errors - Array of validation errors with keys and error details
 * @returns A formatted string with ANSI colors, emojis, and structured layout
 *
 * @see {@link createPlainMessage} for the plain text version
 * @see {@link formatError} for individual error formatting
 *
 * @remarks
 * This function is automatically used when colors are supported in the environment.
 * It respects `NO_COLOR` and `FORCE_COLOR` environment variables.
 */
export const createPrettyMessage = (errors: ValidationError[]): string => {
  const header = `❌ ${colors.red(colors.bold('Environment validation failed:'))}\n`;

  const errorLines = errors.map(({ key, error }) => formatError(key, error));

  const footer = `\n\n${colors.yellow(`Found ${errors.length} validation error${errors.length === 1 ? '' : 's'}. Please check your environment variables.`)}`;

  return `${header}\n${errorLines.join('\n')}${footer}`;
};
