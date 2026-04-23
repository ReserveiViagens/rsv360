/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Route Smoke (Playwright)
 *
 * - Enumera rotas do Next (pages router + app router do site-publico) via filesystem
 * - Visita cada rota e captura:
 *   - console.error (com allowlist configurável)
 *   - pageerror (exceções de runtime)
 *   - falhas de navegação/timeout
 * - Rotas autenticadas podem redirecionar para /login (conta como OK)
 * - Rotas dinâmicas sem seed/env → SKIP explícito (não falha o job)
 */
const fs = require('fs');
const path = require('path');

function toBool(value, defaultValue) {
  if (value == null) return defaultValue;
  return ['1', 'true', 'yes', 'y', 'on'].includes(String(value).toLowerCase());
}

function normalizeSlashes(input) {
  return input.replace(/\\/g, '/');
}

function ensureLeadingSlash(route) {
  if (!route.startsWith('/')) return `/${route}`;
  return route;
}

function withoutExtension(filePath) {
  return filePath.replace(/\.(tsx|ts|jsx|js)$/i, '');
}

function isIgnoredPageFile(relPath) {
  const normalized = normalizeSlashes(relPath);
  const baseName = path.posix.basename(normalized);
  if (baseName.startsWith('_')) return true;
  if (normalized.startsWith('pages/api/')) return true;
  return false;
}

function toRouteFromPagesFile(relativePath) {
  // relativePath example: pages/crm/campaigns/[id].tsx
  const normalized = normalizeSlashes(relativePath);
  const withoutExt = withoutExtension(normalized);
  let route = withoutExt.replace(/^pages/, '');
  route = route.replace(/\/index$/i, '/');
  route = ensureLeadingSlash(route);
  route = route.replace(/\/+/g, '/');
  return route;
}

function toRouteFromAppPageFile(relativePath) {
  // relativePath example: app/dashboard/page.tsx
  const normalized = normalizeSlashes(relativePath);
  const route = normalized.replace(/^app/, '').replace(/\/page\.tsx$/i, '');
  return ensureLeadingSlash(route || '/');
}

function routeIsWorthVisiting(route) {
  if (route.startsWith('/api/')) return false;
  return !['/_app', '/_document', '/_error'].includes(route);
}

function walkFiles(rootDir, { includeName, excludeDirNames }) {
  const results = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludeDirNames.has(entry.name)) continue;
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, { includeName, excludeDirNames }));
      continue;
    }
    if (!includeName(entry.name)) continue;
    results.push(fullPath);
  }
  return results;
}

function uniqueSorted(list) {
  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function findDynamicSegments(route) {
  const segments = [];
  const re = /\[(\.\.\.)?([^\]]+)\]/g;
  let match;
  while ((match = re.exec(route)) !== null) {
    segments.push({ isCatchAll: Boolean(match[1]), name: match[2] });
  }
  return segments;
}

function requiredEnvForDynamic(route) {
  const segments = findDynamicSegments(route);
  if (!segments.length) return null;

  for (const segment of segments) {
    if (segment.isCatchAll && segment.name === 'slug') return 'RSV_SMOKE_CATCHALL';
    if (!segment.isCatchAll && segment.name === 'id') return 'RSV_SMOKE_ID';
    if (!segment.isCatchAll && segment.name === 'slug') return 'RSV_SMOKE_SLUG';
  }

  // Unknown dynamic segment name → no deterministic mapping in this PR (skip)
  return 'dynamic-unknown';
}

function replaceDynamicSegments(route, replacements) {
  let output = route;
  output = output.replace(/\[\.\.\.slug\]/g, encodeURIComponent(String(replacements.catchall)));
  output = output.replace(/\[id\]/g, encodeURIComponent(String(replacements.id)));
  output = output.replace(/\[slug\]/g, encodeURIComponent(String(replacements.slug)));
  return output;
}

function compileConsoleIgnore() {
  const raw = process.env.RSV_SMOKE_CONSOLE_IGNORE || 'chrome-extension://|ERR_BLOCKED_BY_CLIENT';
  const parts = raw.split('|').map((p) => p.trim()).filter(Boolean);
  const regexes = [];
  for (const part of parts) {
    try {
      regexes.push(new RegExp(part));
    } catch (error) {
      console.error('[route-smoke] Invalid RSV_SMOKE_CONSOLE_IGNORE regex:', part);
      console.error(String(error));
      process.exit(2);
    }
  }
  return { raw, regexes };
}

function consoleErrorIsIgnored(text, ignoreRegexes) {
  return ignoreRegexes.some((re) => re.test(text));
}

async function main() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    console.error('[route-smoke] Playwright não encontrado.');
    console.error('Instale no root do monorepo:');
    console.error('  npm i -D playwright');
    console.error('  npx playwright install --with-deps chromium');
    process.exit(2);
  }

  const repoRoot = process.cwd();

  const baseUrls = {
    'site-publico': process.env.RSV_SMOKE_SITE_PUBLICO_URL || 'http://localhost:3000',
    admin: process.env.RSV_SMOKE_ADMIN_URL || 'http://localhost:3004',
    turismo: process.env.RSV_SMOKE_TURISMO_URL || 'http://localhost:3005',
    guest: process.env.RSV_SMOKE_GUEST_URL || 'http://localhost:3006',
  };

  const apps = (process.env.RSV_SMOKE_APPS || 'site-publico,admin,turismo,guest')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const dynamicReplacements = {
    id: process.env.RSV_SMOKE_ID,
    slug: process.env.RSV_SMOKE_SLUG,
    catchall: process.env.RSV_SMOKE_CATCHALL,
  };

  const headless = toBool(process.env.RSV_SMOKE_HEADLESS, true);
  const timeoutMs = Number(process.env.RSV_SMOKE_TIMEOUT_MS || 60_000);
  const maxFailures = Number(process.env.RSV_SMOKE_MAX_FAILURES || 50);
  const concurrency = Number(process.env.RSV_SMOKE_CONCURRENCY || 4);

  const { raw: consoleIgnoreRaw, regexes: consoleIgnoreRegexes } = compileConsoleIgnore();

  const excludeDirNames = new Set(['node_modules', '.next', 'dist', 'build', 'out', '.git']);
  const routesByApp = {};

  for (const app of apps) {
    const appDir = path.join(repoRoot, 'apps', app);
    const routes = [];

    const pagesDir = path.join(appDir, 'pages');
    if (fs.existsSync(pagesDir)) {
      const pageFiles = walkFiles(pagesDir, {
        includeName: (name) => /\.(tsx|ts|jsx|js)$/i.test(name),
        excludeDirNames,
      });
      for (const file of pageFiles) {
        const relative = normalizeSlashes(path.relative(appDir, file));
        if (isIgnoredPageFile(relative)) continue;
        const route = toRouteFromPagesFile(relative);
        if (routeIsWorthVisiting(route)) routes.push(route);
      }
    }

    if (app === 'site-publico') {
      const appRouterDir = path.join(appDir, 'app');
      if (fs.existsSync(appRouterDir)) {
        const pageFiles = walkFiles(appRouterDir, {
          includeName: (name) => /^page\.tsx$/i.test(name),
          excludeDirNames,
        });
        for (const file of pageFiles) {
          const relative = normalizeSlashes(path.relative(appDir, file));
          const route = toRouteFromAppPageFile(relative);
          if (routeIsWorthVisiting(route)) routes.push(route);
        }
      }
    }

    routesByApp[app] = uniqueSorted(routes);
  }

  const runId = nowStamp();
  const artifactsDir = path.join(repoRoot, 'tests', 'e2e', 'artifacts', `route-smoke_${runId}`);
  fs.mkdirSync(artifactsDir, { recursive: true });

  const browser = await playwright.chromium.launch({ headless });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });

  const results = [];
  const failures = [];
  const skipped = [];

  async function visit(app, route) {
    const baseUrl = baseUrls[app];
    const requiredEnv = requiredEnvForDynamic(route);

    if (requiredEnv) {
      if (requiredEnv === 'RSV_SMOKE_ID' && !dynamicReplacements.id) {
        const item = { app, route, status: 'skipped', reason: 'dynamic-segment-no-seed' };
        results.push(item);
        skipped.push(item);
        return;
      }
      if (requiredEnv === 'RSV_SMOKE_SLUG' && !dynamicReplacements.slug) {
        const item = { app, route, status: 'skipped', reason: 'dynamic-segment-no-seed' };
        results.push(item);
        skipped.push(item);
        return;
      }
      if (requiredEnv === 'RSV_SMOKE_CATCHALL' && !dynamicReplacements.catchall) {
        const item = { app, route, status: 'skipped', reason: 'dynamic-segment-no-seed' };
        results.push(item);
        skipped.push(item);
        return;
      }
      if (requiredEnv === 'dynamic-unknown') {
        const item = { app, route, status: 'skipped', reason: 'dynamic-segment-no-seed' };
        results.push(item);
        skipped.push(item);
        return;
      }
    }

    const routeExpanded = replaceDynamicSegments(route, dynamicReplacements);
    const url = `${baseUrl}${routeExpanded}`;

    const page = await context.newPage();
    const consoleErrors = [];
    const consoleErrorsIgnored = [];
    const pageErrors = [];
    let mainStatus = null;
    let finalUrl = null;

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (consoleErrorIsIgnored(text, consoleIgnoreRegexes)) {
        consoleErrorsIgnored.push(text);
      } else {
        consoleErrors.push(text);
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(String(err));
    });

    page.on('response', (resp) => {
      try {
        const respUrl = resp.url();
        if (respUrl === url) mainStatus = resp.status();
      } catch {
        // ignore
      }
    });

    const startedAt = Date.now();
    let attempt = 0;

    while (attempt < 2) {
      attempt += 1;
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
        mainStatus = mainStatus ?? (response ? response.status() : null);
        await page.waitForTimeout(1000);
        finalUrl = page.url();

        const redirectedToLogin = /\/login(\b|\/|\?)/i.test(finalUrl);
        const ok =
          (mainStatus == null || (mainStatus >= 200 && mainStatus < 400) || redirectedToLogin) &&
          pageErrors.length === 0 &&
          consoleErrors.length === 0;

        const durationMs = Date.now() - startedAt;
        const item = {
          app,
          route,
          routeExpanded,
          url,
          finalUrl,
          mainStatus,
          durationMs,
          redirectedToLogin,
          consoleErrors,
          consoleErrorsIgnored,
          pageErrors,
          status: ok ? 'ok' : 'failed',
        };

        results.push(item);

        if (!ok) {
          const safeName = `${app}${routeExpanded}`.replace(/[^\w.-]+/g, '_').slice(0, 180);
          const screenshotPath = path.join(artifactsDir, `${safeName}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
          failures.push({ ...item, screenshotPath });
        }

        return;
      } catch (error) {
        const isTimeout = playwright.errors && error instanceof playwright.errors.TimeoutError;
        if (isTimeout && attempt < 2) {
          continue;
        }

        const durationMs = Date.now() - startedAt;
        const item = {
          app,
          route,
          routeExpanded,
          url,
          finalUrl: finalUrl ?? null,
          mainStatus,
          durationMs,
          redirectedToLogin: false,
          consoleErrors,
          consoleErrorsIgnored,
          pageErrors: [...pageErrors, String(error)],
          status: 'failed',
        };

        results.push(item);

        const safeName = `${app}${routeExpanded}`.replace(/[^\w.-]+/g, '_').slice(0, 180);
        const screenshotPath = path.join(artifactsDir, `${safeName}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
        failures.push({ ...item, screenshotPath });
        return;
      }
    }
  }

  const queue = [];
  for (const app of apps) {
    for (const route of routesByApp[app] || []) {
      queue.push({ app, route });
    }
  }

  let index = 0;
  async function worker() {
    while (true) {
      if (failures.length >= maxFailures) return;
      const current = index++;
      if (current >= queue.length) return;
      const item = queue[current];
      await visit(item.app, item.route);
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
  await Promise.all(workers);

  await context.close();
  await browser.close();

  const okCount = results.filter((r) => r.status === 'ok').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;
  const redirectedToLoginCount = results.filter((r) => r.redirectedToLogin).length;

  const summary = {
    runId,
    apps,
    baseUrls,
    consoleIgnore: consoleIgnoreRaw,
    counts: {
      total: queue.length,
      ok: okCount,
      failed: failedCount,
      skipped: skippedCount,
      redirectedToLogin: redirectedToLoginCount,
    },
    artifactsDir,
  };

  fs.writeFileSync(
    path.join(artifactsDir, 'report.json'),
    JSON.stringify({ summary, results, failures, skipped }, null, 2),
  );

  const md = [];
  md.push(`# Route smoke report (${runId})`);
  md.push('');
  md.push(`- Total: ${summary.counts.total}`);
  md.push(`- OK: ${summary.counts.ok}`);
  md.push(`- Failed: ${summary.counts.failed}`);
  md.push(`- Skipped: ${summary.counts.skipped}`);
  md.push(`- Redirected to login: ${summary.counts.redirectedToLogin}`);
  md.push('');

  if (skipped.length) {
    md.push('## Skipped');
    md.push('');
    for (const s of skipped.slice(0, 200)) {
      md.push(`- [${s.app}] \`${s.route}\` → reason=${s.reason}`);
    }
    md.push('');
  }

  if (failures.length) {
    md.push('## Failures');
    md.push('');
    for (const f of failures.slice(0, 200)) {
      md.push(`- [${f.app}] \`${f.routeExpanded}\` → status=${f.mainStatus ?? 'n/a'} url=${f.url}`);
      if (f.consoleErrors?.length) md.push(`  - console: ${f.consoleErrors[0]}`);
      if (f.pageErrors?.length) md.push(`  - error: ${String(f.pageErrors[0]).slice(0, 200)}`);
      if (f.screenshotPath) md.push(`  - screenshot: \`${normalizeSlashes(f.screenshotPath)}\``);
    }
    md.push('');
  }

  fs.writeFileSync(path.join(artifactsDir, 'report.md'), md.join('\n'));

  console.log(JSON.stringify(summary, null, 2));
  if (failedCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error('[route-smoke] failed:', error);
  process.exit(1);
});

