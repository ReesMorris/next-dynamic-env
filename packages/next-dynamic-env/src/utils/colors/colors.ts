import { wrap } from './wrap';

/**
 * A lightweight color utility for terminal output without external dependencies.
 *
 * Provides methods for applying ANSI color codes and text styles to strings.
 * Automatically detects whether colors should be used based on the environment,
 * respecting NO_COLOR and FORCE_COLOR environment variables, TTY detection,
 * and browser environment detection.
 *
 * @remarks
 * When colors are disabled (e.g., NO_COLOR env var, non-TTY, browser),
 * all methods return the plain text without any formatting codes.
 *
 * @see {@link wrap} for the underlying implementation
 * @see {@link shouldUseColors} for color detection logic
 */
export const colors = {
  /** Applies red color (ANSI code 31) */
  red: (text: string) => wrap('\x1b[31m', text),

  /** Applies yellow color (ANSI code 33) */
  yellow: (text: string) => wrap('\x1b[33m', text),

  /** Applies green color (ANSI code 32) */
  green: (text: string) => wrap('\x1b[32m', text),

  /** Applies blue color (ANSI code 34) */
  blue: (text: string) => wrap('\x1b[34m', text),

  /** Applies cyan color (ANSI code 36) */
  cyan: (text: string) => wrap('\x1b[36m', text),

  /** Applies dim/faint style (ANSI code 2) */
  dim: (text: string) => wrap('\x1b[2m', text),

  /** Applies bold/bright style (ANSI code 1) */
  bold: (text: string) => wrap('\x1b[1m', text),

  /** Applies underline style (ANSI code 4) */
  underline: (text: string) => wrap('\x1b[4m', text)
};
