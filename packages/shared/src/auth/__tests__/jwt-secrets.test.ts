/**
 * PR-04a — unit tests for fail-closed JWT secret helpers.
 */
import {
  JwtSecretMissingError,
  assertJwtSecretsConfigured,
  getJwtRefreshSecret,
  getJwtSecret,
  JWT_HS256_VERIFY_OPTIONS,
} from '../jwt-secrets';

describe('jwt-secrets (PR-04a)', () => {
  it('getJwtSecret throws when absent', () => {
    expect(() => getJwtSecret({})).toThrow(JwtSecretMissingError);
    expect(() => getJwtSecret({ JWT_SECRET: '   ' })).toThrow(JwtSecretMissingError);
  });

  it('getJwtSecret returns trimmed value', () => {
    expect(getJwtSecret({ JWT_SECRET: '  abcdefghijklmnopqrstuvwxyz012345  ' })).toBe(
      'abcdefghijklmnopqrstuvwxyz012345',
    );
  });

  it('getJwtRefreshSecret inherits JWT_SECRET when refresh absent', () => {
    const env = { JWT_SECRET: 'access-secret-minimum-32-characters!!' };
    expect(getJwtRefreshSecret(env)).toBe(env.JWT_SECRET);
  });

  it('getJwtRefreshSecret prefers JWT_REFRESH_SECRET when set', () => {
    const env = {
      JWT_SECRET: 'access-secret-minimum-32-characters!!',
      JWT_REFRESH_SECRET: 'refresh-secret-minimum-32-characters!',
    };
    expect(getJwtRefreshSecret(env)).toBe(env.JWT_REFRESH_SECRET);
  });

  it('assertJwtSecretsConfigured fails closed', () => {
    expect(() => assertJwtSecretsConfigured({})).toThrow(JwtSecretMissingError);
    expect(() =>
      assertJwtSecretsConfigured({ JWT_SECRET: 'access-secret-minimum-32-characters!!' }),
    ).not.toThrow();
  });

  it('pins HS256 algorithms', () => {
    expect(JWT_HS256_VERIFY_OPTIONS.algorithms).toEqual(['HS256']);
  });
});
