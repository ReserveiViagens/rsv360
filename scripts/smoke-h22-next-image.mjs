#!/usr/bin/env node
/**
 * H2.2 smoke — prove next/image optimization works after sharp 0.35.x bump.
 *
 * Starts site-publico production server (expects prior `npm run build`),
 * requests `/_next/image` for a local public asset, asserts image response.
 *
 * Usage (from repo root, after build):
 *   node scripts/smoke-h22-next-image.mjs
 */
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const appDir = join(root, 'apps', 'site-publico');
const port = Number(process.env.H22_SMOKE_PORT || 3017);
const assetPath = '/icons/icon-192x192.png';
const assetFs = join(appDir, 'public', 'icons', 'icon-192x192.png');

function fail(msg) {
  console.error(`H22_SMOKE_FAIL ${msg}`);
  process.exit(1);
}

async function waitHealthy(url, ms = 60000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status > 0) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  fail(`server not healthy within ${ms}ms: ${url}`);
}

async function main() {
  if (!existsSync(join(appDir, '.next'))) {
    fail('missing apps/site-publico/.next — run npm run build --workspace apps/site-publico first');
  }
  if (!existsSync(assetFs)) {
    fail(`missing smoke asset ${assetFs}`);
  }

  const require = createRequire(join(appDir, 'package.json'));
  let sharpVersion = 'unknown';
  try {
    const sharp = require('sharp');
    sharpVersion = sharp?.versions?.sharp || 'loaded';
  } catch (err) {
    fail(`cannot require sharp from site-publico: ${err?.message || err}`);
  }

  const origSize = statSync(assetFs).size;
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(
    npmCmd,
    ['run', 'start', '--', '-p', String(port)],
    {
      cwd: appDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(port),
        // PR-04a boot assert — placeholder fake (≥32), not a real secret
        JWT_SECRET: process.env.JWT_SECRET || 'h22-smoke-jwt-secret-placeholder-32chars-min',
        JWT_REFRESH_SECRET:
          process.env.JWT_REFRESH_SECRET ||
          'h22-smoke-jwt-secret-placeholder-32chars-min',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    },
  );

  let stderr = '';
  child.stderr.on('data', (d) => {
    stderr += d.toString();
  });

  const cleanup = () => {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });

  try {
    await waitHealthy(`http://127.0.0.1:${port}/`);

    const qs = new URLSearchParams({
      url: assetPath,
      w: '64',
      q: '75',
    });
    const imgUrl = `http://127.0.0.1:${port}/_next/image?${qs.toString()}`;
    const res = await fetch(imgUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get('content-type') || '';

    if (res.status !== 200) {
      fail(`/_next/image status=${res.status} ct=${ct} body=${buf.slice(0, 200).toString('utf8')}`);
    }
    if (!ct.startsWith('image/')) {
      fail(`expected image/* content-type, got ${ct}`);
    }
    if (buf.length < 32) {
      fail(`image body too small: ${buf.length}`);
    }
    // Optimized w=64 should be smaller than original 192px icon in typical cases
    if (buf.length >= origSize) {
      console.warn(
        `H22_SMOKE_WARN optimized size ${buf.length} >= original ${origSize} (still image/* 200)`,
      );
    }

    console.log(
      JSON.stringify({
        ok: true,
        sharp: sharpVersion,
        status: res.status,
        contentType: ct,
        bytes: buf.length,
        originalBytes: origSize,
        url: imgUrl,
      }),
    );
    console.log(
      `H22_SMOKE_SUMMARY pass=1/1 sharp=${sharpVersion} ct=${ct} bytes=${buf.length} orig=${origSize}`,
    );
    cleanup();
    process.exit(0);
  } finally {
    cleanup();
    await new Promise((r) => setTimeout(r, 300));
    if (child.exitCode === null && !child.killed) {
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
    }
    if (stderr && /error|ERR_/i.test(stderr)) {
      console.error('H22_SMOKE_SERVER_STDERR_TAIL', stderr.slice(-800));
    }
  }
}

main().catch((err) => fail(err?.stack || String(err)));
