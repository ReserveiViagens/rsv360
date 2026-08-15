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

/** @type {Map<string, number>} in-process counters — PR-16d-telemetry */
const cspTelemetryCounts = new Map();

function resolveCspTelemetryApp(env = process.env) {
  const raw = String(env.CSP_TELEMETRY_APP || 'unknown').trim() || 'unknown';
  return raw.slice(0, 48).replace(/[^\w.-]/g, '_');
}

function cspTelemetryBucketKey(summary, app) {
  const directive =
    summary.effectiveDirective || summary.violatedDirective || 'unknown';
  const blocked = summary.blockedUri || 'unknown';
  const path = summary.documentPath || '/';
  return `${app}\t${directive}\t${blocked}\t${path}`;
}

/**
 * PR-16d-telemetry: bump in-memory counts; optional JSONL append (CSP_TELEMETRY_FILE).
 * Never writes raw report bodies, query strings, cookies, or IPs.
 */
function recordCspTelemetry(summary, env = process.env) {
  const app = resolveCspTelemetryApp(env);
  const key = cspTelemetryBucketKey(summary, app);
  cspTelemetryCounts.set(key, (cspTelemetryCounts.get(key) || 0) + 1);

  const filePath = String(env.CSP_TELEMETRY_FILE || '').trim();
  if (!filePath) return;

  try {
    const fs = require('fs');
    const path = require('path');
    const dir = path.dirname(filePath);
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      app,
      disposition: summary.disposition || 'report',
      effectiveDirective: summary.effectiveDirective || null,
      violatedDirective: summary.violatedDirective || null,
      blockedUri: summary.blockedUri || null,
      documentPath: summary.documentPath || null,
    });
    fs.appendFileSync(filePath, `${line}\n`, { encoding: 'utf8', flag: 'a' });
  } catch {
    // Fail soft — disk full / read-only FS must not break collectors.
  }
}

function getCspTelemetrySnapshot() {
  const byApp = Object.create(null);
  const byDirective = Object.create(null);
  const rows = [];

  for (const [key, count] of cspTelemetryCounts.entries()) {
    const [app, directive, blockedUri, documentPath] = key.split('\t');
    byApp[app] = (byApp[app] || 0) + count;
    byDirective[directive] = (byDirective[directive] || 0) + count;
    rows.push({ app, directive, blockedUri, documentPath, count });
  }

  rows.sort((a, b) => b.count - a.count || a.app.localeCompare(b.app));

  return {
    event: 'csp_telemetry_snapshot',
    generatedAt: new Date().toISOString(),
    total: rows.reduce((n, r) => n + r.count, 0),
    byApp,
    byDirective,
    rows: rows.slice(0, 200),
  };
}

function resetCspTelemetryForTests() {
  cspTelemetryCounts.clear();
}

/**
 * Structured CSP violation log — no cookies, IPs, full URLs with query, or report bodies.
 * Always safe to call from /api/csp-report handlers; returns HTTP status.
 * PR-16d-telemetry: also records aggregate buckets (+ optional JSONL).
 */
function handleCspViolationReport(rawBody, env = process.env) {
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
      app: resolveCspTelemetryApp(env),
    };

    console.info(JSON.stringify(summary));
    recordCspTelemetry(summary, env);
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
  recordCspTelemetry,
  getCspTelemetrySnapshot,
  resetCspTelemetryForTests,
  DEFAULT_CSP_REPORT_PATH,
};
