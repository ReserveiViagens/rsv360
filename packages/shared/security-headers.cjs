/**
 * Shared Next.js security headers (PR-05a + PR-16c).
 * Require from next.config.js: require('../../packages/shared/security-headers.cjs')
 *
 * PR-16c: Content-Security-Policy-Report-Only only (never enforce — that is PR-16d).
 * Branding backend CSP (Express) is intentionally untouched.
 */
'use strict';

const DEFAULT_CSP_REPORT_PATH = '/api/csp-report';

/**
 * Report-Only policy covering Fase 0 third parties:
 * Turnstile · Mercado Pago SDK · GA/GTM · Meta · TikTok · Google Fonts.
 * 'unsafe-inline'/'unsafe-eval' retained in RO so Next hydration noise does not flood reports;
 * tightening is PR-16d after telemetry.
 */
function buildCspReportOnlyPolicy(env = process.env) {
  const reportUri = String(env.CSP_REPORT_URI || DEFAULT_CSP_REPORT_PATH).trim() || DEFAULT_CSP_REPORT_PATH;

  return [
    "default-src 'self'",
    [
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      'https://challenges.cloudflare.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://connect.facebook.net',
      'https://analytics.tiktok.com',
      'https://sdk.mercadopago.com',
      'https://http2.mlstatic.com',
      'https://www.mercadopago.com',
      'https://www.mercadopago.com.br',
    ].join(' '),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    [
      "connect-src 'self' https: wss:",
      'https://challenges.cloudflare.com',
      'https://api.mercadopago.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://analytics.tiktok.com',
      'https://connect.facebook.net',
    ].join(' '),
    [
      "frame-src 'self'",
      'https://challenges.cloudflare.com',
      'https://www.googletagmanager.com',
      'https://www.facebook.com',
      'https://www.mercadopago.com',
      'https://www.mercadopago.com.br',
      'https://sdk.mercadopago.com',
    ].join(' '),
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `report-uri ${reportUri}`,
    'report-to csp-endpoint',
  ].join('; ');
}

function buildReportingEndpointsHeader(env = process.env) {
  const reportUri = String(env.CSP_REPORT_URI || DEFAULT_CSP_REPORT_PATH).trim() || DEFAULT_CSP_REPORT_PATH;
  return `csp-endpoint="${reportUri}"`;
}

function getNextSecurityHeaders(env = process.env) {
  const headers = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Reporting-Endpoints', value: buildReportingEndpointsHeader(env) },
    {
      key: 'Content-Security-Policy-Report-Only',
      value: buildCspReportOnlyPolicy(env),
    },
  ];
  if (env.ENABLE_HSTS === 'true') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=15552000; includeSubDomains',
    });
  }
  return headers;
}

function sanitizeReportUri(uri) {
  if (uri == null) return null;
  const raw = String(uri).trim();
  if (!raw) return null;
  if (
    raw === 'inline' ||
    raw === 'eval' ||
    raw === 'data' ||
    raw === 'blob' ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw.split(':')[0] || raw;
  }
  try {
    const u = new URL(raw);
    // Origin + first path segment only — no query/hash (tokens, PII).
    const firstSeg = u.pathname.split('/').filter(Boolean)[0];
    return firstSeg ? `${u.origin}/${firstSeg}` : u.origin;
  } catch {
    return 'invalid';
  }
}

function sanitizeDocumentPath(uri) {
  if (uri == null) return null;
  try {
    const u = new URL(String(uri));
    return u.pathname || '/';
  } catch {
    return null;
  }
}

/**
 * Structured CSP violation log — no cookies, IPs, full URLs with query, or report bodies.
 * Always safe to call from /api/csp-report handlers; returns HTTP status.
 */
function handleCspViolationReport(rawBody) {
  try {
    let parsed = rawBody;
    if (typeof rawBody === 'string') {
      const trimmed = rawBody.trim();
      if (!trimmed) return { status: 204 };
      parsed = JSON.parse(trimmed);
    }
    if (!parsed || typeof parsed !== 'object') return { status: 204 };

    const report = parsed['csp-report'] || parsed.body || parsed;
    if (!report || typeof report !== 'object') return { status: 204 };

    const summary = {
      event: 'csp_report',
      disposition: report.disposition || 'report',
      effectiveDirective:
        report['effective-directive'] || report.effectiveDirective || null,
      violatedDirective:
        report['violated-directive'] || report.violatedDirective || null,
      blockedUri: sanitizeReportUri(report['blocked-uri'] || report.blockedURI),
      documentPath: sanitizeDocumentPath(report['document-uri'] || report.documentURI),
      statusCode: report['status-code'] || report.statusCode || null,
    };

    console.info(JSON.stringify(summary));
  } catch {
    // Fail soft — never echo parse errors or raw body.
  }
  return { status: 204 };
}

module.exports = {
  getNextSecurityHeaders,
  buildCspReportOnlyPolicy,
  buildReportingEndpointsHeader,
  handleCspViolationReport,
  sanitizeReportUri,
  DEFAULT_CSP_REPORT_PATH,
};
