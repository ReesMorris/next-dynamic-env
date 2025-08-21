import { isBrowser } from '@/utils/is-browser/is-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { colors } from './colors';

vi.mock('@/utils/is-browser/is-browser', () => ({
  isBrowser: vi.fn(() => false)
}));

describe('colors', () => {
  const originalEnv = process.env;
  const originalStdout = process.stdout;

  beforeEach(() => {
    process.env = { ...originalEnv };
    Object.defineProperty(process, 'stdout', {
      value: { ...originalStdout, isTTY: true },
      writable: true
    });
    vi.clearAllMocks();
  });

  describe('color functions', () => {
    it('should apply red color', () => {
      expect(colors.red('error')).toBe('\x1b[31merror\x1b[0m');
    });

    it('should apply yellow color', () => {
      expect(colors.yellow('warning')).toBe('\x1b[33mwarning\x1b[0m');
    });

    it('should apply green color', () => {
      expect(colors.green('success')).toBe('\x1b[32msuccess\x1b[0m');
    });

    it('should apply blue color', () => {
      expect(colors.blue('info')).toBe('\x1b[34minfo\x1b[0m');
    });

    it('should apply cyan color', () => {
      expect(colors.cyan('debug')).toBe('\x1b[36mdebug\x1b[0m');
    });

    it('should apply dim style', () => {
      expect(colors.dim('muted')).toBe('\x1b[2mmuted\x1b[0m');
    });

    it('should apply bold style', () => {
      expect(colors.bold('important')).toBe('\x1b[1mimportant\x1b[0m');
    });

    it('should apply underline style', () => {
      expect(colors.underline('link')).toBe('\x1b[4mlink\x1b[0m');
    });
  });

  describe('color detection', () => {
    it('should not apply colors when NO_COLOR is set', () => {
      process.env.NO_COLOR = '1';
      expect(colors.red('text')).toBe('text');
    });

    it('should apply colors when FORCE_COLOR is set even without TTY', () => {
      process.env.FORCE_COLOR = '1';
      Object.defineProperty(process, 'stdout', {
        value: { isTTY: false },
        writable: true
      });
      expect(colors.red('text')).toBe('\x1b[31mtext\x1b[0m');
    });

    it('should not apply colors when not in TTY', () => {
      Object.defineProperty(process, 'stdout', {
        value: { isTTY: false },
        writable: true
      });
      expect(colors.red('text')).toBe('text');
    });

    it('should apply colors in CI environment', () => {
      process.env.CI = 'true';
      expect(colors.red('text')).toBe('\x1b[31mtext\x1b[0m');
    });

    it('should not apply colors when TERM is dumb', () => {
      process.env.TERM = 'dumb';
      expect(colors.red('text')).toBe('text');
    });

    it('should not apply colors in browser environment', () => {
      vi.mocked(isBrowser).mockReturnValue(true);
      expect(colors.red('text')).toBe('text');
      vi.mocked(isBrowser).mockReturnValue(false);
    });
  });
});
