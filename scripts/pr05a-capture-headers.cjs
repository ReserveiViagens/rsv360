#!/usr/bin/env node
/**
 * Capture security response headers for PR-05a evidence (before/after).
 * Usage: node scripts/pr05a-capture-headers.cjs after
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const tag = process.argv[2] || 'after';
const outDir = path.join(__dirname, '..', 'docs', 'evidence', 'pr-05a-headers');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { name: 'backend-3002', url: 'http://127.0.0.1:3002/health' },
  { name: 'site-3000', url: 'http://127.0.0.1:3000/' },
  { name: 'admin-3004', url: 'http://127.0.0.1:3004/' },
  { name: 'turismo-3005', url: 'http://127.0.0.1:3005/' },
  { name: 'guest-3006', url: 'http://127.0.0.1:3006/' },
];

const KEYS = [
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'x-powered-by',
  'content-security-policy',
  'permissions-policy',
];

function head(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    });
    req.on('error', (err) => resolve({ error: String(err.message || err) }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'timeout' });
    });
    req.end();
  });
}

(async () => {
  for (const t of targets) {
    const result = await head(t.url);
    const lines = [`URL=${t.url}`];
    if (result.error) {
      lines.push(`ERR=${result.error}`);
    } else {
      lines.push(`STATUS=${result.status}`);
      for (const k of KEYS) {
        const label = k
          .split('-')
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join('-')
          .replace('X-Content-Type-Options', 'X-Content-Type-Options')
          .replace('X-Frame-Options', 'X-Frame-Options')
          .replace('X-Powered-By', 'X-Powered-By');
        // Keep stable labels matching before-* files
        const pretty = {
          'strict-transport-security': 'Strict-Transport-Security',
          'x-content-type-options': 'X-Content-Type-Options',
          'x-frame-options': 'X-Frame-Options',
          'referrer-policy': 'Referrer-Policy',
          'x-powered-by': 'X-Powered-By',
          'content-security-policy': 'Content-Security-Policy',
          'permissions-policy': 'Permissions-Policy',
        }[k];
        const v = result.headers[k];
        lines.push(`${pretty}=${v == null ? '' : Array.isArray(v) ? v.join(', ') : v}`);
      }
    }
    const file = path.join(outDir, `${tag}-${t.name}.txt`);
    fs.writeFileSync(file, lines.join('\n') + '\n', 'utf8');
    console.log('wrote', file);
  }
})();
