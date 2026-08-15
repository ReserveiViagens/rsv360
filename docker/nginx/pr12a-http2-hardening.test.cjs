/**
 * PR-12a — assert nginx conf pins HTTP/2 Rapid Reset mitigations.
 * Run: node --test docker/nginx/pr12a-http2-hardening.test.cjs
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = __dirname;
const prod = fs.readFileSync(path.join(dir, 'nginx.conf'), 'utf8');
const testConf = fs.readFileSync(path.join(dir, 'nginx.test.conf'), 'utf8');

function assertHardening(label, src) {
  assert.match(src, /keepalive_requests\s+100\s*;/, `${label}: keepalive_requests 100`);
  assert.match(
    src,
    /http2_max_concurrent_streams\s+128\s*;/,
    `${label}: http2_max_concurrent_streams 128`,
  );
  assert.match(src, /limit_conn_zone\s+\$binary_remote_addr\s+zone=perip:10m\s*;/, `${label}: limit_conn_zone`);
  assert.match(src, /limit_conn\s+perip\s+32\s*;/, `${label}: limit_conn perip 32`);
  assert.doesNotMatch(
    src,
    /keepalive_requests\s+(?:[2-9]\d{2,}|\d{4,})\s*;/,
    `${label}: keepalive_requests must stay < 200`,
  );
}

describe('PR-12a nginx HTTP/2 hardening', () => {
  it('nginx.conf pins streams, keepalive, and limit_conn', () => {
    assertHardening('nginx.conf', prod);
    assert.match(prod, /listen\s+443\s+ssl\s+http2\s*;/);
  });

  it('nginx.test.conf mirrors http{} hardening', () => {
    assertHardening('nginx.test.conf', testConf);
  });
});
