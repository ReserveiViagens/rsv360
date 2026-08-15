/**
 * PR-05a / PR-16c — shared Next security headers helper.
 */
'use strict';

type HeaderPair = { key: string; value: string };

const {
  getNextSecurityHeaders,
  buildCspReportOnlyPolicy,
  handleCspViolationReport,
  sanitizeReportUri,
  getCspTelemetrySnapshot,
  resetCspTelemetryForTests,
} = require('../../../../packages/shared/security-headers.cjs') as {
  getNextSecurityHeaders: (env?: Record<string, string | undefined>) => HeaderPair[];
  buildCspReportOnlyPolicy: (env?: Record<string, string | undefined>) => string;
  handleCspViolationReport: (
    raw: unknown,
    env?: Record<string, string | undefined>,
  ) => { status: number };
  sanitizeReportUri: (uri: unknown) => string | null;
  getCspTelemetrySnapshot: () => {
    total: number;
    byApp: Record<string, number>;
    byDirective: Record<string, number>;
    rows: Array<{ app: string; directive: string; count: number }>;
  };
  resetCspTelemetryForTests: () => void;
};

describe('getNextSecurityHeaders', () => {
  const prev = process.env.ENABLE_HSTS;

  afterEach(() => {
    if (prev === undefined) delete process.env.ENABLE_HSTS;
    else process.env.ENABLE_HSTS = prev;
  });

  it('includes nosniff, DENY, referrer; omits HSTS by default', () => {
    delete process.env.ENABLE_HSTS;
    const headers = getNextSecurityHeaders({});
    const keys = headers.map((h: HeaderPair) => h.key);
    expect(keys).toContain('X-Content-Type-Options');
    expect(keys).toContain('X-Frame-Options');
    expect(keys).toContain('Referrer-Policy');
    expect(keys).not.toContain('Strict-Transport-Security');
    expect(headers.find((h: HeaderPair) => h.key === 'X-Frame-Options')?.value).toBe('DENY');
  });

  it('adds HSTS without preload when ENABLE_HSTS=true', () => {
    const hsts = getNextSecurityHeaders({ ENABLE_HSTS: 'true' }).find(
      (h: HeaderPair) => h.key === 'Strict-Transport-Security',
    );
    expect(hsts?.value).toMatch(/max-age=/);
    expect(hsts?.value.toLowerCase()).not.toContain('preload');
  });

  it('PR-16c emits Report-Only CSP and never enforce Content-Security-Policy', () => {
    const headers = getNextSecurityHeaders({});
    const keys = headers.map((h: HeaderPair) => h.key);
    expect(keys).toContain('Content-Security-Policy-Report-Only');
    expect(keys).toContain('Reporting-Endpoints');
    expect(keys).not.toContain('Content-Security-Policy');

    const csp = headers.find(
      (h: HeaderPair) => h.key === 'Content-Security-Policy-Report-Only',
    )?.value;
    expect(csp).toContain('challenges.cloudflare.com');
    expect(csp).toContain('sdk.mercadopago.com');
    expect(csp).toContain('googletagmanager.com');
    expect(csp).toContain('connect.facebook.net');
    expect(csp).toContain('analytics.tiktok.com');
    expect(csp).toContain('fonts.googleapis.com');
    expect(csp).toContain('fonts.gstatic.com');
    expect(csp).toMatch(/report-uri\s+\/api\/csp-report/);
    expect(csp).toContain('report-to csp-endpoint');
  });

  it('honors CSP_REPORT_URI override', () => {
    const policy = buildCspReportOnlyPolicy({
      CSP_REPORT_URI: 'https://collector.example/csp',
    });
    expect(policy).toContain('report-uri https://collector.example/csp');
  });
});

describe('handleCspViolationReport (PR-16c)', () => {
  beforeEach(() => {
    resetCspTelemetryForTests();
  });

  it('logs sanitized summary without query strings and returns 204', () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});
    const result = handleCspViolationReport(
      JSON.stringify({
        'csp-report': {
          'effective-directive': 'script-src',
          'violated-directive': 'script-src',
          'blocked-uri': 'https://evil.example/x?token=secret',
          'document-uri': 'https://app.example/checkout?email=a@b.c',
          'status-code': 200,
        },
      }),
      { CSP_TELEMETRY_APP: 'site-publico' },
    );
    expect(result.status).toBe(204);
    expect(info).toHaveBeenCalled();
    const logged = JSON.parse(String(info.mock.calls[0][0]));
    expect(logged.event).toBe('csp_report');
    expect(logged.app).toBe('site-publico');
    expect(logged.blockedUri).toBe('https://evil.example/x');
    expect(logged.documentPath).toBe('/checkout');
    expect(JSON.stringify(logged)).not.toMatch(/token=secret|a@b\.c|cookie/i);
    info.mockRestore();
  });

  it('PR-16d-telemetry aggregates counts by app and directive', () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});
    const payload = JSON.stringify({
      'csp-report': {
        'effective-directive': 'script-src',
        'blocked-uri': 'https://evil.example/a',
        'document-uri': 'https://app.example/p',
      },
    });
    handleCspViolationReport(payload, { CSP_TELEMETRY_APP: 'admin' });
    handleCspViolationReport(payload, { CSP_TELEMETRY_APP: 'admin' });
    handleCspViolationReport(
      JSON.stringify({
        'csp-report': {
          'effective-directive': 'img-src',
          'blocked-uri': 'https://cdn.example/i',
          'document-uri': 'https://app.example/p',
        },
      }),
      { CSP_TELEMETRY_APP: 'turismo' },
    );
    const snap = getCspTelemetrySnapshot();
    expect(snap.total).toBe(3);
    expect(snap.byApp.admin).toBe(2);
    expect(snap.byApp.turismo).toBe(1);
    expect(snap.byDirective['script-src']).toBe(2);
    expect(snap.byDirective['img-src']).toBe(1);
    info.mockRestore();
  });

  it('sanitizeReportUri strips query and deep paths', () => {
    expect(sanitizeReportUri('https://cdn.example/a/b/c?q=1')).toBe('https://cdn.example/a');
    expect(sanitizeReportUri('inline')).toBe('inline');
  });

  it('returns 204 on malformed body', () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});
    expect(handleCspViolationReport('not-json')).toEqual({ status: 204 });
    expect(info).not.toHaveBeenCalled();
    info.mockRestore();
  });
});
