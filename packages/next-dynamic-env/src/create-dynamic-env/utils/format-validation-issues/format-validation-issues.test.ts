import { describe, expect, it } from 'vitest';
import { formatValidationIssues } from './format-validation-issues';

describe('formatValidationIssues', () => {
  it('should return single issue message directly', () => {
    const issues = [{ message: 'Invalid value' }] as any;
    expect(formatValidationIssues(issues)).toBe('Invalid value');
  });

  it('should format multiple issues with indices', () => {
    const issues = [
      { message: 'First error' },
      { message: 'Second error' },
      { message: 'Third error' }
    ] as any;
    expect(formatValidationIssues(issues)).toBe(
      '1. First error, 2. Second error, 3. Third error'
    );
  });

  it('should handle non-array input', () => {
    expect(formatValidationIssues('not an array' as any)).toBe(
      'Validation failed'
    );
    expect(formatValidationIssues(null as any)).toBe('Validation failed');
    expect(formatValidationIssues(undefined as any)).toBe('Validation failed');
    expect(formatValidationIssues({} as any)).toBe('Validation failed');
  });

  it('should handle empty array', () => {
    expect(formatValidationIssues([])).toBe('');
  });

  it('should handle issues with undefined messages', () => {
    const issues = [
      { message: 'Valid message' },
      { message: undefined },
      { message: 'Another message' }
    ] as any;
    expect(formatValidationIssues(issues)).toBe(
      '1. Valid message, 2. undefined, 3. Another message'
    );
  });
});
