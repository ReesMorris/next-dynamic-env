import { shouldUseColors } from '../should-use-colors';

/**
 * Wraps text with ANSI escape codes for terminal formatting.
 *
 * This function conditionally applies ANSI escape codes based on the environment
 * and user preferences. It respects NO_COLOR and FORCE_COLOR environment variables,
 * and automatically detects TTY support.
 *
 * @param code - The ANSI escape code to apply (e.g., '\x1b[31m' for red)
 * @param text - The text to wrap with the escape code
 * @param reset - The reset code to append after the text (defaults to '\x1b[0m' for full reset)
 * @returns The text wrapped with ANSI codes if colors are enabled, otherwise the plain text
 *
 * @see {@link shouldUseColors} for color detection logic
 */
export const wrap = (code: string, text: string, reset = '\x1b[0m'): string => {
  if (!shouldUseColors()) {
    return text;
  }
  return `${code}${text}${reset}`;
};
