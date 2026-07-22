/**
 * PR-06a — admin login timing-safe compare.
 */
import { safeEqualPassword } from '@/lib/safe-equal-password';

describe('admin auth login (PR-06a)', () => {
  it('safeEqualPassword accepts matching passwords', () => {
    expect(safeEqualPassword('secret-admin', 'secret-admin')).toBe(true);
  });

  it('safeEqualPassword rejects mismatches without length oracle', () => {
    expect(safeEqualPassword('short', 'much-longer-password')).toBe(false);
    expect(safeEqualPassword('a', 'b')).toBe(false);
  });
});
