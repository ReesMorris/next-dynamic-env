import { isBrowser } from '@/utils/is-browser/is-browser';

/**
 * Determines whether ANSI color codes should be used in the current environment.
 *
 * This function implements a comprehensive color detection strategy that respects
 * various environment variables and terminal capabilities. The detection follows
 * this priority order:
 *
 * 1. Browser environment - always returns false
 * 2. NO_COLOR env var - forces colors off (follows https://no-color.org/)
 * 3. FORCE_COLOR env var - forces colors on
 * 4. TERM=dumb - disables colors for dumb terminals
 * 5. TTY detection - checks if stdout is a TTY
 * 6. CI environment - enables colors in CI environments
 * 7. Default - returns true if none of the above conditions apply
 *
 * @returns `true` if colors should be used, `false` otherwise
 *
 * @see {@link https://no-color.org/} for NO_COLOR specification
 * @see {@link https://github.com/chalk/supports-color} for similar implementations
 */
export const shouldUseColors = (): boolean => {
  if (isBrowser()) {
    return false;
  }

  if (process.env.NO_COLOR) {
    return false;
  }

  if (process.env.FORCE_COLOR) {
    return true;
  }

  if (process.env.TERM === 'dumb') {
    return false;
  }

  if (!process.stdout?.isTTY) {
    return false;
  }

  if (process.env.CI) {
    return true;
  }

  return true;
};
