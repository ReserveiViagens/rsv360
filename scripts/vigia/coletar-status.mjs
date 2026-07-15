#!/usr/bin/env node
/**
 * Vigia — snapshot diário GitHub → Notion (Node puro, fetch nativo).
 * Falha parcial de coleta → registra no snapshot.
 * process.exit(1) apenas se a escrita no Notion falhar.
 */

const OWNER = 'ReserveiViagens';
const REPO = 'rsv360';
const GH_API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const githubToken = process.env.GITHUB_TOKEN;
const notionToken = process.env.NOTION_TOKEN;

/**
 * Aceita UUID com/sem hífens, URL Notion, ou ID colado com aspas/espacos.
 */
function normalizeNotionId(raw) {
  let id = String(raw ?? '')
    .trim()
    .replace(/^["']+|["']+$/g, '');

  const uuidHyphen = id.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  if (uuidHyphen) return uuidHyphen[0].toLowerCase();

  const uuidCompact = id.match(/[0-9a-f]{32}/i);
  if (uuidCompact) {
    const h = uuidCompact[0].toLowerCase();
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  return id;
}

const notionPageIdRaw = process.env.NOTION_PAGE_ID;
const notionPageId = normalizeNotionId(notionPageIdRaw);

// Diagnóstico: page ID em claro (não é secret sem NOTION_TOKEN).
console.log(`diag NOTION_PAGE_ID raw=${JSON.stringify(String(notionPageIdRaw ?? ''))}`);
console.log(`diag NOTION_PAGE_ID normalized=${notionPageId}`);

if (!githubToken || !notionToken || !notionPageId) {
  console.error('Missing required env: GITHUB_TOKEN, NOTION_TOKEN, NOTION_PAGE_ID');
  process.exit(1);
}

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(notionPageId)) {
  console.error(
    `NOTION_PAGE_ID inválido após normalização (len=${notionPageId.length}). Use o UUID da página (32 hex ou UUID com hífens), não o título.`,
  );
  process.exit(1);
}

/** @type {string[]} */
const lines = [];
/** @type {string[]} */
const warnings = [];

function push(line = '') {
  lines.push(line);
}

function warn(msg) {
  warnings.push(msg);
  push(`⚠️ ${msg}`);
}

function saoPauloStamp(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function daysSince(iso) {
  if (!iso) return '?';
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

async function gh(path, { accept, token } = {}) {
  const url = path.startsWith('http') ? path : `${GH_API}${path}`;
  const bearer = token || githubToken;
  return fetch(url, {
    headers: {
      Accept: accept || 'application/vnd.github+json',
      Authorization: `Bearer ${bearer}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'rsv360-vigia-coleta',
    },
  });
}

async function ghJson(path, opts) {
  const res = await gh(path, opts);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  return { res, body };
}

async function ghPaginate(path, { maxPages = 5, perPage = 100, token } = {}) {
  const items = [];
  let url = path.includes('?')
    ? `${path}&per_page=${perPage}`
    : `${path}?per_page=${perPage}`;
  if (!url.startsWith('http')) url = `${GH_API}${url}`;

  for (let page = 0; page < maxPages; page++) {
    const { res, body } = await ghJson(url, { token });
    if (!res.ok) {
      return { ok: false, status: res.status, items, error: body?.message || res.statusText };
    }
    if (Array.isArray(body)) items.push(...body);
    else if (Array.isArray(body?.items)) items.push(...body.items);
    else if (Array.isArray(body?.workflows)) items.push(...body.workflows);
    else if (Array.isArray(body?.workflow_runs)) items.push(...body.workflow_runs);
    else break;

    const link = res.headers.get('link') || '';
    const next = link
      .split(',')
      .map((p) => p.trim())
      .find((p) => p.includes('rel="next"'));
    if (!next) break;
    const m = next.match(/<([^>]+)>/);
    if (!m) break;
    url = m[1];
  }
  return { ok: true, status: 200, items };
}

function rt(content) {
  const text = String(content ?? '').slice(0, 2000);
  return [{ type: 'text', text: { content: text } }];
}

function heading2(text) {
  return { object: 'block', type: 'heading_2', heading_2: { rich_text: rt(text) } };
}

function heading3(text) {
  return { object: 'block', type: 'heading_3', heading_3: { rich_text: rt(text) } };
}

function bullet(text) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: rt(text) },
  };
}

function paragraph(text) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: rt(text) } };
}

async function notionFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text.slice(0, 300) };
  }
  return { res, json };
}

async function listChildBlocks(blockId) {
  const all = [];
  let cursor;
  do {
    const q = cursor
      ? `/blocks/${blockId}/children?page_size=100&start_cursor=${cursor}`
      : `/blocks/${blockId}/children?page_size=100`;
    const { res, json } = await notionFetch(q);
    if (!res.ok) {
      throw new Error(`Notion list children failed (${res.status}): ${json?.message || 'unknown'}`);
    }
    all.push(...(json.results || []));
    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);
  return all;
}

async function archiveBlocks(blocks) {
  for (const block of blocks) {
    const { res, json } = await notionFetch(`/blocks/${block.id}`, {
      method: 'PATCH',
      body: { archived: true },
    });
    if (!res.ok) {
      throw new Error(`Notion archive failed (${res.status}): ${json?.message || block.id}`);
    }
  }
}

async function appendBlocks(pageId, blocks) {
  for (let i = 0; i < blocks.length; i += 100) {
    const chunk = blocks.slice(i, i + 100);
    const { res, json } = await notionFetch(`/blocks/${pageId}/children`, {
      method: 'PATCH',
      body: { children: chunk },
    });
    if (!res.ok) {
      throw new Error(`Notion append failed (${res.status}): ${json?.message || 'unknown'}`);
    }
  }
}

async function collectWorkflows() {
  push('## a) Última execução por workflow (main)');
  const listed = await ghPaginate('/actions/workflows');
  if (!listed.ok) {
    warn(`não consegui ler workflows (HTTP ${listed.status})`);
    return;
  }
  const workflows = (listed.items || []).filter((w) => w.state === 'active');
  if (workflows.length === 0) {
    push('• nenhum workflow ativo');
    return;
  }

  for (const wf of workflows) {
    try {
      const { res, body } = await ghJson(
        `/actions/workflows/${wf.id}/runs?branch=main&per_page=1`,
      );
      if (!res.ok) {
        push(`• ${wf.name}: não consegui ler runs (HTTP ${res.status})`);
        continue;
      }
      const run = body?.workflow_runs?.[0];
      if (!run) {
        push(`• ${wf.name}: sem execuções em main`);
        continue;
      }
      const conclusion = run.conclusion || run.status || 'unknown';
      push(`• ${wf.name}: ${conclusion} — ${run.html_url}`);
    } catch (err) {
      push(`• ${wf.name}: erro — ${err.message}`);
    }
  }
}

async function collectCiVermelhoIssues() {
  push('');
  push('## b) Issues abertas (label ci-vermelho-main)');
  const { res, body } = await ghJson(
    '/issues?state=open&labels=ci-vermelho-main&per_page=100',
  );
  if (!res.ok) {
    warn(`não consegui ler issues ci-vermelho-main (HTTP ${res.status})`);
    return;
  }
  const issues = (body || []).filter((i) => !i.pull_request);
  if (issues.length === 0) {
    push('• nenhuma');
    return;
  }
  for (const issue of issues) {
    push(`• #${issue.number} — ${issue.title}`);
  }
}

async function collectOpenPrs() {
  push('');
  push('## c) PRs abertos');
  const listed = await ghPaginate('/pulls?state=open&sort=updated&direction=desc');
  if (!listed.ok) {
    warn(`não consegui ler PRs abertos (HTTP ${listed.status})`);
    return;
  }
  const prs = listed.items || [];
  const bots = prs.filter((p) => (p.user?.login || '') === 'dependabot[bot]');
  const humans = prs.filter((p) => (p.user?.login || '') !== 'dependabot[bot]');
  push(`• Dependabot: ${bots.length} PR(s) aberto(s)`);
  if (humans.length === 0) {
    push('• Humanos: nenhum');
    return;
  }
  push('• Humanos:');
  for (const pr of humans) {
    const basis = pr.updated_at || pr.created_at;
    push(`  - #${pr.number} — ${pr.title} (${daysSince(basis)}d parado)`);
  }
}

async function collectMergedPrs24h() {
  push('');
  push('## d) PRs mergeados (últimas 24h)');
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const q = encodeURIComponent(
    `repo:${OWNER}/${REPO} is:pr is:merged merged:>${since}`,
  );
  const { res, body } = await ghJson(
    `https://api.github.com/search/issues?q=${q}&per_page=50&sort=updated&order=desc`,
  );
  if (!res.ok) {
    warn(`não consegui ler PRs mergeados 24h (HTTP ${res.status})`);
    return;
  }
  const items = body?.items || [];
  if (items.length === 0) {
    push('• nenhum');
    return;
  }
  for (const item of items) {
    push(`• #${item.number} — ${item.title}`);
  }
}

function countBySeverity(alerts) {
  const counts = {};
  for (const a of alerts) {
    const sev = (
      a.security_advisory?.severity ||
      a.rule?.security_severity_level ||
      a.security_severity_level ||
      a.severity ||
      'unknown'
    ).toLowerCase();
    counts[sev] = (counts[sev] || 0) + 1;
  }
  return counts;
}

function formatSeverityCounts(counts) {
  const order = ['critical', 'high', 'medium', 'moderate', 'low', 'warning', 'note', 'unknown'];
  const keys = [
    ...order.filter((k) => counts[k]),
    ...Object.keys(counts)
      .filter((k) => !order.includes(k))
      .sort(),
  ];
  if (keys.length === 0) return 'nenhum alerta aberto';
  return keys.map((k) => `${k}: ${counts[k]}`).join(', ');
}

async function collectCodeScanning() {
  push('');
  push('## e) Alertas CodeQL / code-scanning (abertos)');
  const listed = await ghPaginate('/code-scanning/alerts?state=open', { maxPages: 10 });
  if (!listed.ok) {
    if (listed.status === 403 || listed.status === 404) {
      push('• indisponível');
      return;
    }
    warn(`não consegui ler code-scanning (HTTP ${listed.status})`);
    return;
  }
  push(`• ${formatSeverityCounts(countBySeverity(listed.items || []))}`);
}

function formatDependabotSeverity(counts) {
  const medium = (counts.medium || 0) + (counts.moderate || 0);
  const critical = counts.critical || 0;
  const high = counts.high || 0;
  const low = counts.low || 0;
  const known = critical + high + medium + low;
  const other = Object.entries(counts)
    .filter(([k]) => !['critical', 'high', 'medium', 'moderate', 'low'].includes(k))
    .reduce((n, [, v]) => n + v, 0);
  if (known === 0 && other === 0) return 'nenhum alerta aberto';
  const parts = [
    `critical: ${critical}`,
    `high: ${high}`,
    `medium: ${medium}`,
    `low: ${low}`,
  ];
  if (other > 0) parts.push(`other: ${other}`);
  return parts.join(', ');
}

async function collectDependabot() {
  push('');
  push('## f) Alertas Dependabot (abertos)');
  // GITHUB_TOKEN da Actions não lê Dependabot alerts — PAT dedicado (fallback = indisponível).
  const dependabotToken = (process.env.GH_DEPENDABOT_TOKEN || '').trim();
  if (!dependabotToken) {
    push('• indisponível');
    return;
  }
  const listed = await ghPaginate('/dependabot/alerts?state=open', {
    maxPages: 10,
    token: dependabotToken,
  });
  if (!listed.ok) {
    push('• indisponível');
    return;
  }
  push(`• ${formatDependabotSeverity(countBySeverity(listed.items || []))}`);
}

function buildNotionBlocks(stamp) {
  const blocks = [
    heading2(`Vigia RSV360 — ${stamp}`),
    paragraph('Snapshot automático · página = apenas o estado mais recente.'),
  ];

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith('## ')) {
      blocks.push(heading3(line.slice(3)));
      continue;
    }
    if (line.startsWith('⚠️')) {
      blocks.push(bullet(line));
      continue;
    }
    if (line.startsWith('• ') || line.startsWith('  - ')) {
      blocks.push(bullet(line.replace(/^\s*[•\-]\s*/, '')));
      continue;
    }
    blocks.push(paragraph(line));
  }

  return blocks;
}

async function main() {
  const stamp = saoPauloStamp();
  push(`# Snapshot Vigia — ${stamp} (America/São_Paulo)`);
  push(`Repo: ${OWNER}/${REPO}`);
  push('');

  await collectWorkflows();
  await collectCiVermelhoIssues();
  await collectOpenPrs();
  await collectMergedPrs24h();
  await collectCodeScanning();
  await collectDependabot();

  const snapshotText = lines.join('\n');
  console.log('--- SNAPSHOT TEXT ---');
  console.log(snapshotText);
  console.log('--- END SNAPSHOT ---');

  try {
    const children = await listChildBlocks(notionPageId);
    await archiveBlocks(children);
    const blocks = buildNotionBlocks(stamp);
    await appendBlocks(notionPageId, blocks);
    console.log(`Notion OK: archived ${children.length} block(s), wrote ${blocks.length} block(s).`);
  } catch (err) {
    console.error(`Notion write failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
