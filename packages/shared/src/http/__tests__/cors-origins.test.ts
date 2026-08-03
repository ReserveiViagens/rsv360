import {
  DEV_CORS_ORIGIN_ALLOWLIST,
  assertCookieMutationOrigin,
  corsOriginDelegate,
  formatBrowserSessionCookie,
  formatClearedBrowserSessionCookie,
  getCorsOriginAllowlist,
  isCorsOriginAllowed,
  isSecureBrowserCookieRequired,
} from '../cors-origins';

describe('cors-origins (PR-05b)', () => {
  it('defaults to explicit localhost + 127.0.0.1 allowlist (never *)', () => {
    const list = getCorsOriginAllowlist({});
    expect(list).toEqual([...DEV_CORS_ORIGIN_ALLOWLIST]);
    expect(list).toContain('http://localhost:3004');
    expect(list).toContain('http://127.0.0.1:3006');
    expect(list).not.toContain('*');
  });

  it('parses CORS_ORIGIN CSV and drops wildcard entries', () => {
    expect(
      getCorsOriginAllowlist({
        CORS_ORIGIN: 'http://localhost:3000, *, http://127.0.0.1:3004',
      }),
    ).toEqual(['http://localhost:3000', 'http://127.0.0.1:3004']);
  });

  it('falls back to dev allowlist when CORS_ORIGIN is only *', () => {
    expect(getCorsOriginAllowlist({ CORS_ORIGIN: '*' })).toEqual([
      ...DEV_CORS_ORIGIN_ALLOWLIST,
    ]);
  });

  it('exact-match allow / deny', () => {
    const list = getCorsOriginAllowlist({});
    expect(isCorsOriginAllowed('http://localhost:3004', list)).toBe(true);
    expect(isCorsOriginAllowed('http://evil.example', list)).toBe(false);
    expect(isCorsOriginAllowed('http://localhost:3004.evil.example', list)).toBe(
      false,
    );
  });

  it('corsOriginDelegate allows missing origin; denies evil', () => {
    const results: boolean[] = [];
    corsOriginDelegate(undefined, (_e, allow) => results.push(Boolean(allow)), {});
    corsOriginDelegate(
      'http://evil.example',
      (_e, allow) => results.push(Boolean(allow)),
      {},
    );
    corsOriginDelegate(
      'http://localhost:3000',
      (_e, allow) => results.push(Boolean(allow)),
      {},
    );
    expect(results).toEqual([true, false, true]);
  });
});

describe('cookie CSRF + browser cookie attrs (PR-16b)', () => {
  const env = { CORS_ORIGIN: 'https://app.example,http://localhost:3000' };

  it('allows allowlisted Origin', () => {
    expect(
      assertCookieMutationOrigin({ origin: 'https://app.example', referer: null }, env),
    ).toEqual({ ok: true, source: 'origin' });
  });

  it('allows allowlisted Referer when Origin absent', () => {
    expect(
      assertCookieMutationOrigin(
        { origin: null, referer: 'https://app.example/admin/security' },
        env,
      ),
    ).toEqual({ ok: true, source: 'referer' });
  });

  it('fail-closed when Origin and Referer missing', () => {
    expect(assertCookieMutationOrigin({ origin: null, referer: null }, env)).toEqual({
      ok: false,
      reason: 'missing_origin_referer',
    });
  });

  it('rejects evil Origin (Host header irrelevant)', () => {
    expect(
      assertCookieMutationOrigin({ origin: 'https://evil.example', referer: null }, env),
    ).toEqual({ ok: false, reason: 'origin_not_allowed' });
  });

  it('adds Secure only in production', () => {
    expect(
      formatBrowserSessionCookie('auth_token', 'abc', {
        env: { NODE_ENV: 'development' },
      }),
    ).toBe('auth_token=abc; Path=/; SameSite=Lax; Max-Age=604800');
    expect(
      formatBrowserSessionCookie('auth_token', 'abc', {
        env: { NODE_ENV: 'production' },
      }),
    ).toBe('auth_token=abc; Path=/; SameSite=Lax; Max-Age=604800; Secure');
    expect(isSecureBrowserCookieRequired({ NODE_ENV: 'production' })).toBe(true);
    expect(
      formatClearedBrowserSessionCookie('auth_token', { NODE_ENV: 'production' }),
    ).toContain('Secure');
  });
});
