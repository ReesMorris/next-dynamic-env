import { describe, expect, it, vi } from 'vitest';
import { checkDuplicateKeys } from './check-duplicate-keys';

describe('checkDuplicateKeys', () => {
  it('should not warn when there are no duplicate keys', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const clientKeys = ['API_URL', 'APP_NAME'];
    const serverKeys = ['DATABASE_URL', 'SECRET_KEY'];

    checkDuplicateKeys(clientKeys, serverKeys);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should warn when there is one duplicate key', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const clientKeys = ['API_URL', 'SHARED_VAR'];
    const serverKeys = ['DATABASE_URL', 'SHARED_VAR'];

    checkDuplicateKeys(clientKeys, serverKeys);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('SHARED_VAR'));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Client values will take precedence')
    );
    warnSpy.mockRestore();
  });

  it('should warn when there are multiple duplicate keys', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const clientKeys = ['API_URL', 'SHARED_VAR', 'ANOTHER_SHARED'];
    const serverKeys = ['DATABASE_URL', 'SHARED_VAR', 'ANOTHER_SHARED'];

    checkDuplicateKeys(clientKeys, serverKeys);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('SHARED_VAR, ANOTHER_SHARED')
    );
    warnSpy.mockRestore();
  });

  it('should handle empty arrays', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    checkDuplicateKeys([], []);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should handle when only one array is empty', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    checkDuplicateKeys(['API_URL'], []);
    checkDuplicateKeys([], ['DATABASE_URL']);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
