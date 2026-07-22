#!/usr/bin/env node
/**
 * H2.2 / H2.3 smoke — prove next/image optimization works (sharp + next patch).
 *
 * Starts site-publico production server (expects prior `npm run build`),
 * requests `/_next/image` for a local public asset, asserts image response,
 * then exits with a trustworthy exit code (cleanup must not hang).
 *
 * Usage (from repo root, after build):
 *   node scripts/smoke-h22-next-image.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const appDir = join(root, 'apps', 'site-publico');
const port = Number(process.env.H22_SMOKE_PORT || 3017);
const assetPath = '/icons/icon-192x192.png';
const assetFs = join(appDir, 'public', 'icons', 'icon-192x192.png');

function fail(msg) {
  console.error(`H22_SMOKE_FAIL ${msg}`);
  process.exitCode = 1;
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
    await delay(500);
  }
  fail(`server not healthy within ${ms}ms: ${url}`);
  throw new Error('unhealthy');
}

/** Kill npm/next child tree (Windows-safe) and wait until it exits. */
async function stopChild(child, timeoutMs = 8000) {
  if (!child || child.exitCode !== null) return;

  const waitExit = new Promise((resolve) => {
    child.once('exit', () => resolve());
  });

  try {
    if (process.platform === 'win32' && child.pid) {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else if (child.pid) {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        child.kill('SIGTERM');
      }
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // ignore
  }

  const raced = await Promise.race([
    waitExit.then(() => 'exited'),
    delay(timeoutMs).then(() => 'timeout'),
  ]);

  if (raced === 'timeout' && child.exitCode === null) {
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
          stdio: 'ignore',
          windowsHide: true,
        });
      } else {
        child.kill('SIGKILL');
      }
    } catch {
      // ignore
    }
    await Promise.race([waitExit, delay(2000)]);
  }
}

async function main() {
  if (!existsSync(join(appDir, '.next'))) {
    fail('missing apps/site-publico/.next — run npm run build --workspace apps/site-publico first');
    process.exit(1);
  }
  if (!existsSync(assetFs)) {
    fail(`missing smoke asset ${assetFs}`);
    process.exit(1);
  }

  const require = createRequire(join(appDir, 'package.json'));
  let sharpVersion = 'unknown';
  try {
    const sharp = require('sharp');
    sharpVersion = sharp?.versions?.sharp || 'loaded';
  } catch (err) {
    fail(`cannot require sharp from site-publico: ${err?.message || err}`);
    process.exit(1);
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
      detached: process.platform !== 'win32',
    },
  );

  let stderr = '';
  child.stderr.on('data', (d) => {
    stderr += d.toString();
  });

  let exitCode = 0;
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
      exitCode = 1;
    } else if (!ct.startsWith('image/')) {
      fail(`expected image/* content-type, got ${ct}`);
      exitCode = 1;
    } else if (buf.length < 32) {
      fail(`image body too small: ${buf.length}`);
      exitCode = 1;
    } else {
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
    }
  } catch (err) {
    if (process.exitCode !== 1) {
      fail(err?.stack || String(err));
    }
    exitCode = 1;
  } finally {
    await stopChild(child);
    if (stderr && /error|ERR_/i.test(stderr)) {
      console.error('H22_SMOKE_SERVER_STDERR_TAIL', stderr.slice(-800));
    }
  }

  process.exit(exitCode || process.exitCode || 0);
}

main().catch(async (err) => {
  fail(err?.stack || String(err));
  process.exit(1);
});
