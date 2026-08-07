/**
 * PR-10c-pré-a — resolveRefreshToken: cookie first, body legacy + flag.
 * PR-10c-telemetry — Prometheus counters for deprecated body / cookie-required reject.
 */
const { resolveRefreshToken } = require('../../api/v1/auth/resolve-refresh-token');
const {
  authRefreshDeprecatedTotal,
  authRefreshCookieRequiredRejectedTotal,
} = require('../../monitoring/prometheus');

function mockReq({
  cookie,
  body,
  transport,
  origin,
}: {
  cookie?: string;
  body?: Record<string, unknown>;
  transport?: string;
  origin?: string;
} = {}) {
  return {
    headers: { cookie },
    body: body || {},
    originalUrl: '/api/v1/auth/refresh',
    get(name: string) {
      const key = String(name).toLowerCase();
      if (key === 'x-rsv-refresh-transport') return transport;
      if (key === 'origin') return origin;
      return undefined;
    },
  };
}

describe('resolveRefreshToken (PR-10c-pré-a)', () => {
  const prev = process.env.AUTH_REFRESH_COOKIE_REQUIRED;

  afterEach(() => {
    if (prev === undefined) delete process.env.AUTH_REFRESH_COOKIE_REQUIRED;
    else process.env.AUTH_REFRESH_COOKIE_REQUIRED = prev;
  });

  it('prefers cookie over body', () => {
    delete process.env.AUTH_REFRESH_COOKIE_REQUIRED;
    const r = resolveRefreshToken(
      mockReq({
        cookie: 'rsv360_refresh_token=from-cookie',
        body: { refresh_token: 'from-body' },
      }),
    );
    expect(r).toEqual({ token: 'from-cookie', source: 'cookie' });
  });

  it('accepts body legacy when flag OFF and logs deprecation path', async () => {
    process.env.AUTH_REFRESH_COOKIE_REQUIRED = 'false';
    const before = await authRefreshDeprecatedTotal.get();
    const beforeCount =
      before.values.find(
        (v: { labels: { transport?: string }; value: number }) =>
          v.labels.transport === 'direct-body',
      )?.value ?? 0;
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const r = resolveRefreshToken(
      mockReq({ body: { refresh_token: 'legacy' }, origin: 'http://localhost:3004' }),
    );
    expect(r).toEqual({ token: 'legacy', source: 'body' });
    expect(warn).toHaveBeenCalled();
    const payload = JSON.parse(String(warn.mock.calls[0][0]));
    expect(payload.event).toBe('auth_refresh_body_deprecated');
    expect(payload.origin).toBe('http://localhost:3004');
    const after = await authRefreshDeprecatedTotal.get();
    const afterCount =
      after.values.find(
        (v: { labels: { transport?: string }; value: number }) =>
          v.labels.transport === 'direct-body',
      )?.value ?? 0;
    expect(afterCount).toBe(beforeCount + 1);
    warn.mockRestore();
  });

  it('does not deprecate when BFF forwards cookie via body', () => {
    process.env.AUTH_REFRESH_COOKIE_REQUIRED = 'false';
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const r = resolveRefreshToken(
      mockReq({
        body: { refresh_token: 'via-bff' },
        transport: 'bff-cookie',
      }),
    );
    expect(r).toEqual({ token: 'via-bff', source: 'body' });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('rejects direct body when AUTH_REFRESH_COOKIE_REQUIRED=true', async () => {
    process.env.AUTH_REFRESH_COOKIE_REQUIRED = 'true';
    const before = await authRefreshCookieRequiredRejectedTotal.get();
    const beforeCount =
      before.values.find(
        (v: { labels: { transport?: string }; value: number }) =>
          v.labels.transport === 'direct-body',
      )?.value ?? 0;
    const r = resolveRefreshToken(mockReq({ body: { refresh_token: 'legacy' } }));
    expect(r).toEqual({
      error: true,
      status: 401,
      message: 'Refresh via cookie obrigatório',
    });
    const after = await authRefreshCookieRequiredRejectedTotal.get();
    const afterCount =
      after.values.find(
        (v: { labels: { transport?: string }; value: number }) =>
          v.labels.transport === 'direct-body',
      )?.value ?? 0;
    expect(afterCount).toBe(beforeCount + 1);
  });

  it('allows BFF cookie transport when flag ON', () => {
    process.env.AUTH_REFRESH_COOKIE_REQUIRED = 'true';
    const r = resolveRefreshToken(
      mockReq({ body: { refresh_token: 'via-bff' }, transport: 'bff-cookie' }),
    );
    expect(r).toEqual({ token: 'via-bff', source: 'body' });
  });
});
