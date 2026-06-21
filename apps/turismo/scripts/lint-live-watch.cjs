#!/usr/bin/env node
/**
 * Painel ao vivo Lint #237 — reescreve lint-live-dashboard.html a cada 3s
 * Uso: node scripts/lint-live-watch.cjs
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const turismo = path.join(__dirname, '..');
const repo = path.join(turismo, '..', '..');
const outDir = path.join(repo, 'docs', 'evidence', 'issue-237');
const htmlPath = path.join(outDir, 'lint-live-dashboard.html');
const logPath = path.join(outDir, 'lint-live.log');

function log(msg) {
  const line = `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}\n`;
  fs.appendFileSync(logPath, line);
  console.log(line.trim());
}

function sh(cmd, cwd = repo) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    return (e.stdout || e.stderr || '').trim();
  }
}

let cachedWarnTotal = 'calculando...';
let rankRunning = false;

function refreshWarnings() {
  if (rankRunning) return;
  rankRunning = true;
  try {
    const rankLine = sh('node scripts/eslint-warnings-rank.cjs', turismo).split('\n')[0] || '';
    const m = rankLine.match(/(\d+)/);
    if (m) cachedWarnTotal = m[1];
  } catch {
    cachedWarnTotal = 'n/a';
  } finally {
    rankRunning = false;
  }
}

function render() {
  const branch = sh('git branch --show-current');
  const lastCommit = sh('git log -1 --oneline');
  const recent = sh('git log --oneline -8');

  const clusters = JSON.parse(
    fs.readFileSync(path.join(turismo, 'scripts', 'lint-237-clusters.json'), 'utf8')
  ).clusters;
  const done = clusters.filter((c) => c.status === 'done').length;
  const pending = clusters.filter((c) => c.status === 'pending').length;
  const next = clusters.find((c) => c.status === 'pending');

  let warnTotal = cachedWarnTotal;

  let prsHtml = '';
  try {
    const prs = JSON.parse(
      sh('gh pr list --search "lint-turismo" --limit 8 --json number,title,url,headRefName,state')
    );
    prsHtml = prs
      .map(
        (p) =>
          `<li><a href="${p.url}" target="_blank">#${p.number}</a> [${p.state}] ${p.headRefName}</li>`
      )
      .join('');
  } catch {
    prsHtml = '<li>gh CLI indisponivel</li>';
  }

  const nextFiles = next
    ? next.files.map((f) => `<code>${f.path}</code> (${f.warnings}w)`).join(', ')
    : 'Nenhum — meta atingida!';

  const pct = Math.round((done / 120) * 1000) / 10;
  const now = new Date().toLocaleString('pt-BR');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="3">
  <title>Lint #237 — Ao vivo</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #38bdf8; font-size: 1.4rem; }
    .sub { color: #94a3b8; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .card { background: #1e293b; border-radius: 10px; padding: 14px; border: 1px solid #334155; }
    .card h2 { margin: 0 0 6px; font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; }
    .val { font-size: 1.6rem; font-weight: 700; }
    .val-sm { font-size: 0.95rem; word-break: break-all; }
    pre { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px; font-size: 0.78rem; overflow-x: auto; }
    a { color: #38bdf8; }
    .pulse { display: inline-block; width: 9px; height: 9px; background: #22c55e; border-radius: 50%; margin-right: 6px; animation: blink 1.2s infinite; }
    @keyframes blink { 50% { opacity: 0.3; } }
    .bar { height: 6px; background: #334155; border-radius: 3px; margin-top: 8px; overflow: hidden; }
    .bar > div { height: 100%; background: #22c55e; width: ${pct}%; }
  </style>
</head>
<body>
  <h1><span class="pulse"></span>Lint #237 turismo — monitor ao vivo</h1>
  <p class="sub">Atualiza a cada 3s · ${now}</p>
  <div class="grid">
    <div class="card"><h2>Warnings</h2><div class="val">${warnTotal}</div></div>
    <div class="card"><h2>Clusters</h2><div class="val">${done}/120</div><div class="bar"><div></div></div></div>
    <div class="card"><h2>Pendentes</h2><div class="val">${pending}</div></div>
    <div class="card"><h2>Branch</h2><div class="val val-sm">${branch || 'n/a'}</div></div>
  </div>
  <div class="card" style="margin-bottom:12px"><h2>Proximo #${next?.id ?? '—'} (delta ${next?.delta ?? 0})</h2><p>${nextFiles}</p></div>
  <div class="card" style="margin-bottom:12px"><h2>Ultimo commit</h2><pre>${lastCommit}</pre></div>
  <div class="card" style="margin-bottom:12px"><h2>Commits recentes</h2><pre>${recent}</pre></div>
  <div class="card"><h2>PRs lint-turismo</h2><ul>${prsHtml || '<li>nenhuma</li>'}</ul>
    <p><a href="https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pulls?q=is%3Apr+lint-turismo" target="_blank">Todas as PRs no GitHub</a></p>
  </div>
</body>
</html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(htmlPath, html);
}

log(`Watcher iniciado — HTML: ${htmlPath}`);
render();
setInterval(render, 3000);
setInterval(refreshWarnings, 60000);
refreshWarnings();
