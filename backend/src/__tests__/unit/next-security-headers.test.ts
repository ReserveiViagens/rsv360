/**
 * PR-05a — shared Next security headers helper.
 */
'use strict';

type HeaderPair = { key: string; value: string };

const { getNextSecurityHeaders } = require('../../../../packages/shared/security-headers.cjs') as {
  getNextSecurityHeaders: () => HeaderPair[];
};

describe('getNextSecurityHeaders', () => {
  const prev = process.env.ENABLE_HSTS;

  afterEach(() => {
    if (prev === undefined) delete process.env.ENABLE_HSTS;
    else process.env.ENABLE_HSTS = prev;
  });

  it('includes nosniff, DENY, referrer; omits HSTS by default', () => {
    delete process.env.ENABLE_HSTS;
    const headers = getNextSecurityHeaders();
    const keys = headers.map((h: HeaderPair) => h.key);
    expect(keys).toContain('X-Content-Type-Options');
    expect(keys).toContain('X-Frame-Options');
    expect(keys).toContain('Referrer-Policy');
    expect(keys).not.toContain('Strict-Transport-Security');
    expect(headers.find((h: HeaderPair) => h.key === 'X-Frame-Options')?.value).toBe('DENY');
  });

  it('adds HSTS without preload when ENABLE_HSTS=true', () => {
    process.env.ENABLE_HSTS = 'true';
    const hsts = getNextSecurityHeaders().find(
      (h: HeaderPair) => h.key === 'Strict-Transport-Security',
    );
    expect(hsts?.value).toMatch(/max-age=/);
    expect(hsts?.value.toLowerCase()).not.toContain('preload');
  });
});
