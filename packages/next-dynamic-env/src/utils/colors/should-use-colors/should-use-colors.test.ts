import { isBrowser } from '@/utils/is-browser/is-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shouldUseColors } from './should-use-colors';

vi.mock('@/utils/is-browser/is-browser', () => ({
  isBrowser: vi.fn(() => false)
}));

describe('shouldUseColors', () => {
  const originalEnv = process.env;
  const originalStdout = process.stdout;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isBrowser).mockReturnValue(false);
    process.env = { ...originalEnv };
    Object.defineProperty(process, 'stdout', {
      value: { ...originalStdout, isTTY: true },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, 'stdout', {
      value: originalStdout,
      writable: true,
      configurable: true
    });
  });

  it('should return false when NO_COLOR is set', () => {
    process.env.NO_COLOR = '1';
    expect(shouldUseColors()).toBe(false);

    process.env.NO_COLOR = 'true';
    expect(shouldUseColors()).toBe(false);
  });

  it('should return true when FORCE_COLOR is set', () => {
    process.env.FORCE_COLOR = '1';
    expect(shouldUseColors()).toBe(true);

    process.env.FORCE_COLOR = 'true';
    expect(shouldUseColors()).toBe(true);
  });

  it('should prioritize NO_COLOR over FORCE_COLOR', () => {
    process.env.NO_COLOR = '1';
    process.env.FORCE_COLOR = '1';
    expect(shouldUseColors()).toBe(false);
  });

  it('should return false when not in TTY', () => {
    Object.defineProperty(process, 'stdout', {
      value: { isTTY: false },
      writable: true,
      configurable: true
    });
    expect(shouldUseColors()).toBe(false);
  });

  it('should return false when stdout is undefined', () => {
    Object.defineProperty(process, 'stdout', {
      value: undefined,
      writable: true,
      configurable: true
    });
    expect(shouldUseColors()).toBe(false);
  });

  it('should return true when FORCE_COLOR is set even without TTY', () => {
    process.env.FORCE_COLOR = '1';
    Object.defineProperty(process, 'stdout', {
      value: { isTTY: false },
      writable: true,
      configurable: true
    });
    expect(shouldUseColors()).toBe(true);
  });

  it('should return true in CI environment with TTY', () => {
    process.env.CI = 'true';
    expect(shouldUseColors()).toBe(true);

    process.env.CI = '1';
    expect(shouldUseColors()).toBe(true);
  });

  it('should return false when TERM is dumb', () => {
    process.env.TERM = 'dumb';
    expect(shouldUseColors()).toBe(false);
  });

  it('should return true by default with TTY', () => {
    expect(shouldUseColors()).toBe(true);
  });

  it('should handle complex scenarios correctly', () => {
    // CI with dumb terminal
    process.env.CI = 'true';
    process.env.TERM = 'dumb';
    expect(shouldUseColors()).toBe(false);

    // CI with NO_COLOR
    delete process.env.TERM;
    process.env.NO_COLOR = '1';
    expect(shouldUseColors()).toBe(false);

    // FORCE_COLOR overrides everything except NO_COLOR and browser
    delete process.env.NO_COLOR;
    process.env.FORCE_COLOR = '1';
    process.env.TERM = 'dumb';
    Object.defineProperty(process, 'stdout', {
      value: { isTTY: false },
      writable: true,
      configurable: true
    });
    expect(shouldUseColors()).toBe(true);
  });

  it('should return false in browser environment', () => {
    vi.mocked(isBrowser).mockReturnValue(true);
    expect(shouldUseColors()).toBe(false);

    // Even with FORCE_COLOR, browser should not use colors
    process.env.FORCE_COLOR = '1';
    expect(shouldUseColors()).toBe(false);
  });
});
