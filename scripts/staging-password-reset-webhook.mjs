#!/usr/bin/env node
/**
 * Webhook local D2.8 — recebe POST do backend e exibe o link de reset.
 * Uso: node scripts/staging-password-reset-webhook.mjs
 * .env: PASSWORD_RESET_EMAIL_WEBHOOK=http://host.docker.internal:9876/password-reset
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fileEnv = loadDotEnv(path.join(root, '.env'));

const PORT = Number(process.env.STAGING_WEBHOOK_PORT || fileEnv.STAGING_WEBHOOK_PORT || 9876);
const SECRET = (
  process.env.PASSWORD_RESET_EMAIL_WEBHOOK_SECRET ||
  fileEnv.PASSWORD_RESET_EMAIL_WEBHOOK_SECRET ||
  ''
).trim();
const logFile = path.join(root, 'logs', 'staging-password-reset-webhook.log');

function appendLog(line) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${line}\n`);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/password-reset') {
    res.writeHead(404);
    res.end('not found');
    return;
  }

  if (SECRET) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${SECRET}`) {
      res.writeHead(401);
      res.end('unauthorized');
      return;
    }
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  let payload;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    res.writeHead(400);
    res.end('invalid json');
    return;
  }

  const line = `[reset] to=${payload.to} url=${payload.resetUrl}`;
  console.log(line);
  appendLog(line);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[staging-webhook] listening on http://0.0.0.0:${PORT}/password-reset`);
  console.log(`[staging-webhook] log file: ${logFile}`);
});
