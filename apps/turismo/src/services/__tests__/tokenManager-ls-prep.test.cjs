/**
 * PR turismo-ls-prep — assert apiClient.ts never persists refresh in setTokens.
 * Run: node --test apps/turismo/src/services/__tests__/tokenManager-ls-prep.test.cjs
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'apiClient.ts'), 'utf8');

describe('turismo-ls-prep apiClient tokenManager (source contract)', () => {
  it('enables withCredentials for cookie refresh', () => {
    assert.match(src, /withCredentials:\s*true/);
  });

  it('setTokens clears refresh LS keys and does not setItem refresh', () => {
    assert.match(src, /REFRESH_LS_KEYS/);
    assert.match(src, /localStorage\.removeItem\(key\)/);
    assert.doesNotMatch(
      src,
      /setTokens:[\s\S]{0,400}localStorage\.setItem\(['"]refresh_token['"]/,
    );
    assert.doesNotMatch(
      src,
      /setTokens:[\s\S]{0,400}localStorage\.setItem\(['"]refreshToken['"]/,
    );
  });

  it('exposes setAccessToken and clearRefreshTokens', () => {
    assert.match(src, /setAccessToken:/);
    assert.match(src, /clearRefreshTokens:/);
  });
});

describe('turismo-ls-prep authService (source contract)', () => {
  const authSrc = fs.readFileSync(path.join(__dirname, '..', 'authService.ts'), 'utf8');

  it('login accepts access_token without requiring refresh_token in JSON', () => {
    assert.match(authSrc, /if \(parsed\?\.access_token\)/);
    assert.match(authSrc, /tokenManager\.setAccessToken/);
  });

  it('refresh posts empty body when no legacy LS refresh', () => {
    assert.match(
      authSrc,
      /legacyRefresh \? \{ refresh_token: legacyRefresh \} : \{\}/,
    );
  });
});
