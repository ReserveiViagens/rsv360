import {
  asNumber,
  asRequiredString,
  asString,
  asStringArray,
} from '../../../../server/lib/parse';

describe('parse helpers (PR-C 2)', () => {
  describe('asString', () => {
    it('returns string identity', () => {
      expect(asString('abc')).toBe('abc');
    });

    it('returns first element of string[]', () => {
      expect(asString(['a', 'b'])).toBe('a');
    });

    it('returns undefined for empty array', () => {
      expect(asString([])).toBeUndefined();
    });

    it('returns undefined for object / ParsedQs-like', () => {
      expect(asString({ foo: 'bar' })).toBeUndefined();
      expect(asString({ nested: ['x'] })).toBeUndefined();
    });

    it('returns undefined for null/undefined/number', () => {
      expect(asString(null)).toBeUndefined();
      expect(asString(undefined)).toBeUndefined();
      expect(asString(1)).toBeUndefined();
    });
  });

  describe('asRequiredString', () => {
    it('returns string or default fallback', () => {
      expect(asRequiredString('x')).toBe('x');
      expect(asRequiredString(undefined)).toBe('');
      expect(asRequiredString(null, 'fb')).toBe('fb');
      expect(asRequiredString(['y'])).toBe('y');
    });
  });

  describe('asStringArray', () => {
    it('wraps string and filters non-strings from arrays', () => {
      expect(asStringArray('a')).toEqual(['a']);
      expect(asStringArray(['a', 1, 'b'])).toEqual(['a', 'b']);
      expect(asStringArray({ x: 1 })).toEqual([]);
      expect(asStringArray(undefined)).toEqual([]);
    });
  });

  describe('asNumber', () => {
    it('parses finite numeric strings only', () => {
      expect(asNumber('42')).toBe(42);
      expect(asNumber(['3.5'])).toBe(3.5);
      expect(asNumber('')).toBeUndefined();
      expect(asNumber('nan')).toBeUndefined();
      expect(asNumber({ n: 1 })).toBeUndefined();
      expect(asNumber(undefined)).toBeUndefined();
    });
  });
});
