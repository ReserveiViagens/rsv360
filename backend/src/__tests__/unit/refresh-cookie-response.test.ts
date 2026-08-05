/**
 * PR-10c-pré-b — refresh cookie Set-Cookie / strip / CSRF guard.
 */
const {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH_API,
} = require('@rsv360/shared');
const {
  sendAuthJson,
  clearRefreshTokenCookie,
  cookieMutationOriginGuard,
  serializeRefreshCookie,
  shouldStripRefreshFromJson,
} = require('../../api/v1/auth/refresh-cookie-response');

type MockRes = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string | string[]>;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
  getHeader: (name: string) => string | string[] | undefined;
  setHeader: (name: string, value: string | string[]) => void;
};

function mockRes(): MockRes {
  const headers: Record<string, string | string[]> = {};
  return {
    statusCode: 200,
    body: null,
    headers,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    getHeader(name: string) {
      return headers[String(name).toLowerCase()];
    },
    setHeader(name: string, value: string | string[]) {
      headers[String(name).toLowerCase()] = value;
    },
  };
}

describe('refresh-cookie-response (PR-10c-pré-b)', () => {
  it('serializes HttpOnly refresh cookie with Path=/api/v1/auth', () => {
    const raw = serializeRefreshCookie('tok%en');
    expect(raw).toContain(`${REFRESH_TOKEN_COOKIE_NAME}=`);
    expect(raw).toContain(`Path=${REFRESH_TOKEN_COOKIE_PATH_API}`);
    expect(raw).toContain('HttpOnly');
    expect(raw).toContain('SameSite=Lax');
  });

  it('serializes and clears the same cross-subdomain cookie Domain', () => {
    const previous = process.env.AUTH_REFRESH_COOKIE_DOMAIN;
    process.env.AUTH_REFRESH_COOKIE_DOMAIN = '.reserveiviagens.com.br';
    try {
      const raw = serializeRefreshCookie('token');
      expect(raw).toContain('Domain=.reserveiviagens.com.br');
      const res = mockRes();
      clearRefreshTokenCookie(res);
      expect(String(res.getHeader('set-cookie'))).toContain(
        'Domain=.reserveiviagens.com.br',
      );
    } finally {
      if (previous === undefined) delete process.env.AUTH_REFRESH_COOKIE_DOMAIN;
      else process.env.AUTH_REFRESH_COOKIE_DOMAIN = previous;
    }
  });

  it('strips refresh from JSON when Origin present (browser)', () => {
    const req = { get: (h: string) => (h === 'origin' ? 'http://localhost:3004' : undefined) };
    const res = mockRes();
    sendAuthJson(res, req, {
      success: true,
      data: { access_token: 'a', refresh_token: 'r' },
    });
    expect(res.body).toEqual({ success: true, data: { access_token: 'a' } });
    const setCookie = res.getHeader('set-cookie');
    expect(String(setCookie)).toContain(REFRESH_TOKEN_COOKIE_NAME);
    expect(String(setCookie)).toContain(REFRESH_TOKEN_COOKIE_PATH_API);
  });

  it('keeps refresh in JSON when Origin absent (BFF / server)', () => {
    const req = { get: () => undefined };
    const res = mockRes();
    sendAuthJson(res, req, {
      success: true,
      data: { access_token: 'a', refresh_token: 'r' },
    });
    expect((res.body as { data: { refresh_token: string } }).data.refresh_token).toBe('r');
    expect(shouldStripRefreshFromJson(req)).toBe(false);
  });

  it('clears refresh cookie', () => {
    const res = mockRes();
    clearRefreshTokenCookie(res);
    expect(String(res.getHeader('set-cookie'))).toContain('Max-Age=0');
  });

  it('CSRF rejects cookie mutation from evil Origin', () => {
    const prev = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'http://localhost:3004,http://localhost:3005';
    const req = {
      method: 'POST',
      headers: { cookie: `${REFRESH_TOKEN_COOKIE_NAME}=abc` },
      get(name: string) {
        if (name === 'origin') return 'https://evil.example';
        return undefined;
      },
    };
    const res = mockRes();
    let nextCalled = false;
    cookieMutationOriginGuard(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
    if (prev === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = prev;
  });

  it('CSRF allows cookie mutation from allowlisted Origin', () => {
    const prev = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'http://localhost:3004';
    const req = {
      method: 'POST',
      headers: { cookie: `${REFRESH_TOKEN_COOKIE_NAME}=abc` },
      get(name: string) {
        if (name === 'origin') return 'http://localhost:3004';
        return undefined;
      },
    };
    const res = mockRes();
    let nextCalled = false;
    cookieMutationOriginGuard(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    if (prev === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = prev;
  });

  it('CSRF skips when no refresh cookie (Bearer-only)', () => {
    const req = {
      method: 'POST',
      headers: {},
      get: () => undefined,
    };
    const res = mockRes();
    let nextCalled = false;
    cookieMutationOriginGuard(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
