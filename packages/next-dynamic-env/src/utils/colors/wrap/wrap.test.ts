import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shouldUseColors } from '../should-use-colors';
import { wrap } from './wrap';

vi.mock('../should-use-colors', () => ({
  shouldUseColors: vi.fn(() => true)
}));

describe('wrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when colors should be used', () => {
    beforeEach(() => {
      vi.mocked(shouldUseColors).mockReturnValue(true);
    });

    it('should wrap text with ANSI codes', () => {
      expect(wrap('\x1b[31m', 'error')).toBe('\x1b[31merror\x1b[0m');
    });

    it('should use custom reset code', () => {
      expect(wrap('\x1b[31m', 'error', '\x1b[39m')).toBe(
        '\x1b[31merror\x1b[39m'
      );
    });

    it('should handle empty text', () => {
      expect(wrap('\x1b[31m', '')).toBe('\x1b[31m\x1b[0m');
    });

    it('should handle multiple color codes', () => {
      expect(wrap('\x1b[1m\x1b[31m', 'bold red')).toBe(
        '\x1b[1m\x1b[31mbold red\x1b[0m'
      );
    });

    it('should preserve text with special characters', () => {
      expect(wrap('\x1b[32m', 'text\nwith\nnewlines')).toBe(
        '\x1b[32mtext\nwith\nnewlines\x1b[0m'
      );
      expect(wrap('\x1b[33m', 'text\twith\ttabs')).toBe(
        '\x1b[33mtext\twith\ttabs\x1b[0m'
      );
    });
  });

  describe('when colors should not be used', () => {
    beforeEach(() => {
      vi.mocked(shouldUseColors).mockReturnValue(false);
    });

    it('should return text without ANSI codes', () => {
      expect(wrap('\x1b[31m', 'error')).toBe('error');
    });

    it('should ignore custom reset code', () => {
      expect(wrap('\x1b[31m', 'error', '\x1b[39m')).toBe('error');
    });

    it('should handle empty text', () => {
      expect(wrap('\x1b[31m', '')).toBe('');
    });

    it('should return text unchanged regardless of codes', () => {
      expect(wrap('\x1b[1m\x1b[31m', 'bold red')).toBe('bold red');
      expect(wrap('\x1b[32m', 'green')).toBe('green');
      expect(wrap('', 'plain')).toBe('plain');
    });
  });

  it('should call shouldUseColors each time', () => {
    wrap('\x1b[31m', 'text1');
    wrap('\x1b[32m', 'text2');
    wrap('\x1b[33m', 'text3');

    expect(shouldUseColors).toHaveBeenCalledTimes(3);
  });
});
