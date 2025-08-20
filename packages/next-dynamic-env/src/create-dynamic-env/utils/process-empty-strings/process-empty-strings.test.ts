import { describe, expect, it } from 'vitest';
import { processEmptyStrings } from './process-empty-strings';

describe('processEmptyStrings', () => {
  it('should convert empty strings to undefined', () => {
    const input = {
      VAR1: '',
      VAR2: 'value',
      VAR3: ''
    };

    const result = processEmptyStrings(input);

    expect(result).toEqual({
      VAR1: undefined,
      VAR2: 'value',
      VAR3: undefined
    });
  });

  it('should leave non-empty strings unchanged', () => {
    const input = {
      VAR1: 'value1',
      VAR2: 'value2',
      VAR3: 'value3'
    };

    const result = processEmptyStrings(input);

    expect(result).toEqual(input);
  });

  it('should handle objects with undefined values', () => {
    const input = {
      VAR1: undefined,
      VAR2: '',
      VAR3: 'value'
    };

    const result = processEmptyStrings(input);

    expect(result).toEqual({
      VAR1: undefined,
      VAR2: undefined,
      VAR3: 'value'
    });
  });

  it('should handle empty objects', () => {
    const input = {};

    const result = processEmptyStrings(input);

    expect(result).toEqual({});
  });

  it('should return a new object', () => {
    const input = {
      VAR1: 'value'
    };

    const result = processEmptyStrings(input);

    expect(result).not.toBe(input);
    expect(result).toEqual(input);
  });

  it('should handle objects with only empty strings', () => {
    const input = {
      VAR1: '',
      VAR2: '',
      VAR3: ''
    };

    const result = processEmptyStrings(input);

    expect(result).toEqual({
      VAR1: undefined,
      VAR2: undefined,
      VAR3: undefined
    });
  });

  it('should handle whitespace strings (not convert them)', () => {
    const input = {
      VAR1: ' ',
      VAR2: '  ',
      VAR3: '\t',
      VAR4: '\n',
      VAR5: ''
    };

    const result = processEmptyStrings(input);

    expect(result).toEqual({
      VAR1: ' ',
      VAR2: '  ',
      VAR3: '\t',
      VAR4: '\n',
      VAR5: undefined
    });
  });
});
