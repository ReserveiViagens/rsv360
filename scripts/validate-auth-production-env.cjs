#!/usr/bin/env node
/** Valida variáveis auth obrigatórias para produção (D2.8 + D2.9). */
const fs = require('fs');
const path = require('path');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function env(key, fileEnv) {
  return process.env[key] ?? fileEnv[key] ?? '';
}

const root = path.resolve(__dirname, '..');
const fileEnv = loadDotEnv(path.join(root, '.env'));
const nodeEnv = env('NODE_ENV', fileEnv) || 'development';
const isProd = nodeEnv === 'production';

const errors = [];
const warnings = [];

const oauthSecret = env('OAUTH_BFF_SECRET', fileEnv);
if (!oauthSecret || oauthSecret.includes('CHANGE_ME') || oauthSecret === 'rsv360-docker-dev-oauth-bff') {
  if (isProd) errors.push('OAUTH_BFF_SECRET: defina segredo forte (openssl rand -hex 32)');
  else warnings.push('OAUTH_BFF_SECRET: usando default dev — OK para local Docker');
}

if (isProd && env('OAUTH_DEV_MOCK', fileEnv) === 'true') {
  errors.push('OAUTH_DEV_MOCK: deve ser false em produção');
}

const siteUrl = env('NEXT_PUBLIC_SITE_URL', fileEnv);
if (isProd && !siteUrl.startsWith('https://')) {
  warnings.push('NEXT_PUBLIC_SITE_URL: use HTTPS em produção');
}

const hasSmtp = env('SMTP_HOST', fileEnv) && env('SMTP_USER', fileEnv) && env('SMTP_PASS', fileEnv);
const hasWebhook = env('PASSWORD_RESET_EMAIL_WEBHOOK', fileEnv);
if (isProd && !hasSmtp && !hasWebhook) {
  warnings.push('D2.8 e-mail: configure SMTP ou PASSWORD_RESET_EMAIL_WEBHOOK no backend');
}

const hasGoogle = env('GOOGLE_CLIENT_ID', fileEnv) && env('GOOGLE_CLIENT_SECRET', fileEnv);
const hasFacebook = env('FACEBOOK_APP_ID', fileEnv) && env('FACEBOOK_APP_SECRET', fileEnv);
if (isProd && !hasGoogle && !hasFacebook && env('OAUTH_DEV_MOCK', fileEnv) !== 'true') {
  warnings.push('OAuth: configure Google e/ou Facebook, ou habilite apenas login e-mail/senha');
}

if (isProd && hasGoogle) {
  const expected = `${siteUrl.replace(/\/$/, '')}/api/auth/google/callback`;
  const configured = env('GOOGLE_REDIRECT_URI', fileEnv);
  if (configured && configured !== expected) {
    warnings.push(`GOOGLE_REDIRECT_URI (${configured}) difere do esperado (${expected})`);
  }
}

console.log(`[auth-env] NODE_ENV=${nodeEnv}`);
for (const w of warnings) console.warn(`[auth-env] WARN: ${w}`);
for (const e of errors) console.error(`[auth-env] ERROR: ${e}`);

if (errors.length) {
  process.exit(1);
}
console.log('[auth-env] OK — variáveis auth produção válidas (ou avisos apenas)');
