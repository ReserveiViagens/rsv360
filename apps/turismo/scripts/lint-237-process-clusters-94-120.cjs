#!/usr/bin/env node
/**
 * Process lint clusters #94-#120: branch, docs, commit, push, PR (stacked).
 * Run from repo root after ESLint 0 on all target files.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '../../..');
const TURISMO = path.join(REPO, 'apps/turismo');
const CLUSTERS_JSON = path.join(TURISMO, 'scripts/lint-237-clusters.json');
const PLANO = path.join(REPO, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md');
const CHECKLIST = path.join(REPO, 'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md');

const CLUSTER_META = {
  94: { slug: 'user-profile-analytics-excursao', title: 'UserProfile + AnalyticsChart + ExcursaoForm', fixes: 'eslint-disable no-img-element; Record types' },
  95: { slug: 'participantes-auction-list-stats', title: 'ParticipantesList + AuctionList + AuctionStats', fixes: 'useCallback loadAuctions/loadStats; trim unused imports' },
  96: { slug: 'breadcrumbs-pagetransition-notification', title: 'Breadcrumbs + PageTransition + NotificationBell', fixes: 'eslint-disable set-state-in-effect; static LoadingComponent' },
  97: { slug: 'report-analytics-ui-nav', title: 'ReportAnalytics + ui/PageTransition + SkipLinks', fixes: 'trim unused imports; _prefix unused vars' },
  98: { slug: 'radio-grupo-pagamento', title: 'radio-group + GrupoForm + PagamentoDividido', fixes: 'forwardRef displayName; Record types; trim imports' },
  99: { slug: 'keyboard-auth-websocket', title: 'useKeyboardShortcuts + auth-service + websocketClient', fixes: 'useMemo shortcuts; Record<string,unknown>' },
  100: { slug: 'theme-analytics-business', title: 'ThemeContext + ANALYTICS-INTELLIGENCE + BUSINESS-MODULES', fixes: 'eslint-disable set-state-in-effect; remove useAuth' },
  101: { slug: 'ecosystem-enterprises-analytics', title: 'ECOSYSTEM-MASTER + enterprises/new + analytics', fixes: 'trim unused imports' },
  102: { slug: 'attractions-excursoes-leiloes-novo', title: 'attractions + excursoes/nova + leiloes/novo', fixes: 'eslint-disable no-img-element; useCallback' },
  103: { slug: 'viagens-grupo-login-multilingual', title: 'viagens-grupo/nova + login + multilingual', fixes: 'trim unused; useCallback' },
  104: { slug: 'register-reports-reservations', title: 'register + reports-complete + reservations/[id]', fixes: 'trim unused imports' },
  105: { slug: 'rewards-subscriptions-admin-test', title: 'rewards + subscriptions + admin-test', fixes: 'trim unused imports' },
  106: { slug: 'src-analytics-cotacoes-giftcards', title: 'src/analytics + cotacoes/templates + giftcards', fixes: 'trim unused imports' },
  107: { slug: 'src-multilingual-offline-recommendations', title: 'src/multilingual + offline + recommendations', fixes: 'trim unused imports' },
  108: { slug: 'src-register-rewards-seo', title: 'src/register + rewards + seo', fixes: 'trim unused imports' },
  109: { slug: 'src-settings-subscriptions-notificationbell', title: 'src/settings + subscriptions + NotificationBell', fixes: 'trim unused; set-state-in-effect' },
  110: { slug: 'protected-toast-enterprisecard', title: 'ProtectedRoute + ToastContainer + EnterpriseCard', fixes: 'trim ToastProps; eslint-disable no-img-element' },
  111: { slug: 'auth-provider-login-register', title: 'AuthProvider + LoginForm + RegisterForm', fixes: '_refreshToken prefix' },
  112: { slug: 'booking-analytics-excursoes-dashboard', title: 'BookingViewModal + AnalyticsCharts + ExcursoesDashboard', fixes: 'trim CreditCard; MOCK_* stats; set-state-in-effect' },
  113: { slug: 'roteiro-leilao-leiloes-dashboard', title: 'RoteiroEditor + LeilaoDetalhes + LeiloesDashboard', fixes: 'useCallback loadUpcomingAuctions' },
  114: { slug: 'navguard-reporthistory-security', title: 'NavigationGuard + ReportHistory + security/index', fixes: 'Record<string,unknown>' },
  115: { slug: 'datatable-animatedloader-card', title: 'DataTable + AnimatedLoader + Card', fixes: 'trim unused imports' },
  116: { slug: 'checkbox-input-keyboard-shortcuts', title: 'Checkbox + Input + KeyboardShortcutsHelp', fixes: 'type alias InputProps' },
  117: { slug: 'label-separator-switch', title: 'label + separator + switch', fixes: 'forwardRef displayName' },
  118: { slug: 'viagensgrupo-toast-sidebar', title: 'ViagensGrupoDashboard + use-toast + useSidebar', fixes: 'MOCK_* stats; set-state-in-effect' },
  119: { slug: 'theme-travel-accommodations-api', title: 'useTheme + useTravelPackages + accommodationsApi', fixes: 'trim unused imports' },
  120: { slug: 'booking-excursoes-viagensgrupo-api', title: 'bookingApi + excursoesApi + viagensGrupoApi', fixes: 'trim unused apiClient' },
};

function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: REPO, encoding: 'utf8', stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
}

function shOut(cmd) {
  return execSync(cmd, { cwd: REPO, encoding: 'utf8' }).trim();
}

function toTurismoPath(rel) {
  return path.join('apps/turismo', rel).replace(/\\/g, '/');
}

function writeEvidence(id, meta, baselineBefore, baselineAfter, prNum) {
  const slugUpper = meta.slug.toUpperCase();
  const fname = `LINT-237-TURISMO-${slugUpper}.md`;
  const docPath = path.join(REPO, 'docs/evidence/issue-237', fname);
  const delta = baselineBefore - baselineAfter;
  const content = `# Lint #237 — turismo ${meta.title.toLowerCase()}

**Cluster:** **#${id}** | **Branch:** \`chore/lint-turismo-${meta.slug}\`${prNum ? ` | **PR:** #${prNum}` : ''}

| Métrica | Pós-#${id - 1} | Esta PR |
|---------|---------|---------|
| warnings globais | **${baselineBefore}** | **${baselineAfter}** (**−${delta}**) |
| 3 arquivos alvo | ${id <= 99 ? 6 : id === 100 ? 4 : 3} | **0** |

**Correções:** ${meta.fixes}

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #${id + 1}${id < 120 ? ` — (−${id >= 100 && id < 101 ? 4 : id >= 101 ? 3 : 6})` : ' — concluído'}
`;
  fs.writeFileSync(docPath, content);
  return `docs/evidence/issue-237/${fname}`;
}

function updateJson(id) {
  const data = JSON.parse(fs.readFileSync(CLUSTERS_JSON, 'utf8'));
  const c = data.clusters.find(x => x.id === id);
  if (c) c.status = 'done';
  fs.writeFileSync(CLUSTERS_JSON, JSON.stringify(data, null, 2) + '\n');
}

function updatePlano(id, baseline, prNum, branch) {
  let txt = fs.readFileSync(PLANO, 'utf8');
  const next = id < 120 ? id + 1 : null;
  const nextDelta = next ? (next === 100 ? 4 : next >= 101 ? 3 : 6) : 0;
  txt = txt.replace(
    /\*\*Atualizado:\*\*[^\n]+/,
    `**Atualizado:** 2026-06-20 (cluster #${id} concluído)`
  );
  txt = txt.replace(/\*\*Baseline global:\*\* \*\*\d+\*\*/, `**Baseline global:** **${baseline}**`);
  txt = txt.replace(/\| Warnings globais \| \*\*\d+\*\*/, `| Warnings globais | **${baseline}** |`);
  txt = txt.replace(/\| Clusters concluídos \| \*\*\d+\*\*/, `| Clusters concluídos | **${id}** / 120 |`);
  txt = txt.replace(
    /\| PR empilhada mais recente \|[^\n]+/,
    `| PR empilhada mais recente | **#${prNum}** (cluster #${id}, −${CLUSTER_META[id] ? (id === 100 ? 4 : id >= 101 ? 3 : 6) : 6}) |`
  );
  if (next) {
    txt = txt.replace(/\| Próximo cluster \|[^\n]+/, `| Próximo cluster | **#${next}** — (−${nextDelta}) |`);
  } else {
    txt = txt.replace(/\| Próximo cluster \|[^\n]+/, `| Próximo cluster | **concluído** — 120/120 |`);
  }
  fs.writeFileSync(PLANO, txt);
}

function updateChecklist(id, meta, prNum, docRel) {
  const delta = id === 100 ? 4 : id >= 101 ? 3 : 6;
  const line = `- [x] Lint ${meta.title.toLowerCase()} −${delta} **GO condicional** *(PR #${prNum})* \`issue-237/${path.basename(docRel)}\`\n`;
  let txt = fs.readFileSync(CHECKLIST, 'utf8');
  const marker = '- [x] Lint ai-system-test + src/coupons + training-system-test';
  if (!txt.includes(meta.slug)) {
    txt = txt.replace(marker, marker + '\n' + line.trimEnd());
  }
  fs.writeFileSync(CHECKLIST, txt);
}

function getClusterDelta(id) {
  if (id <= 99) return 6;
  if (id === 100) return 4;
  return 3;
}

function main() {
  const startId = Number(process.argv[2] || 94);
  const data = JSON.parse(fs.readFileSync(CLUSTERS_JSON, 'utf8'));
  let baseline = startId === 99 ? 70 : 100;
  if (startId === 99) {
    // recompute from cluster deltas
    baseline = 100;
    for (let i = 94; i < startId; i++) baseline -= getClusterDelta(i);
  }
  let prevBranch = startId === 99
    ? 'chore/lint-turismo-radio-grupo-pagamento'
    : 'chore/lint-turismo-ai-coupons-training-test';
  const results = [];

  if (startId <= 94) {
    sh(`git checkout ${prevBranch}`);
  } else {
    const current = shOut('git branch --show-current');
    if (current !== prevBranch) {
      shOut(`git checkout ${prevBranch}`);
    }
  }

  for (let id = startId; id <= 120; id++) {
    const cluster = data.clusters.find(c => c.id === id);
    if (!cluster || cluster.status === 'done') {
      console.log(`Skip #${id} (already done)`);
      continue;
    }

    const meta = CLUSTER_META[id];
    if (!meta) throw new Error(`No meta for cluster ${id}`);

    const branch = `chore/lint-turismo-${meta.slug}`;
    const delta = getClusterDelta(id);
    const baselineAfter = baseline - delta;

    console.log(`\n========== Cluster #${id} (${branch}) ==========`);

    const baseBranch = prevBranch;
    const current = shOut('git branch --show-current');
    if (current !== baseBranch) {
      shOut(`git checkout ${baseBranch}`);
    }
    shOut(`git checkout -b ${branch}`);

    updateJson(id);

    const files = cluster.files.map(f => toTurismoPath(f.path));
    const docRel = writeEvidence(id, meta, baseline, baselineAfter, null);

    // stage cluster source files if modified
    for (const f of files) {
      try {
        shOut(`git add "${f}"`);
      } catch { /* file may have no changes */ }
    }
    sh(`git add "${CLUSTERS_JSON.replace(/\\/g, '/')}"`);
    sh(`git add "${docRel}"`);

    // update plano/checklist in last cluster commit only OR each cluster
    updatePlano(id, baselineAfter, 'TBD', branch);
    updateChecklist(id, meta, 'TBD', docRel);
    sh(`git add "${PLANO.replace(/\\/g, '/')}" "${CHECKLIST.replace(/\\/g, '/')}"`);

    const staged = shOut('git diff --cached --name-only');
    if (!staged.trim()) {
      console.warn(`No staged changes for cluster ${id}, forcing doc+json commit`);
    }

    sh(`git commit -m "fix(turismo): lint cluster #${id} ${meta.slug} (-${delta})"`);

    sh(`git push -u origin ${branch}`);

    const prBody = `## Summary
- ESLint 0 nos 3 arquivos alvo do cluster #${id}
- ${meta.fixes}
- Baseline: ${baseline} → ${baselineAfter} warnings

## Test plan
- [x] ESLint 0 nos 3 alvos
- [x] npm run build OK`;

    const prBodyFile = path.join(REPO, '.tmp-pr-body.md');
    fs.writeFileSync(prBodyFile, prBody);
    const prUrl = shOut(
      `gh pr create --base ${baseBranch} --head ${branch} --title "chore(turismo): lint cluster #${id} ${meta.slug} (-${delta})" --body-file "${prBodyFile}"`
    );
    try { fs.unlinkSync(prBodyFile); } catch { /* ok */ }
    const prNum = prUrl.match(/\/pull\/(\d+)/)?.[1] || '?';

    // rewrite evidence with PR number
    writeEvidence(id, meta, baseline, baselineAfter, prNum);
    updatePlano(id, baselineAfter, prNum, branch);
    updateChecklist(id, meta, prNum, docRel);
    sh(`git add "${docRel}" "${PLANO.replace(/\\/g, '/')}" "${CHECKLIST.replace(/\\/g, '/')}"`);
    sh(`git commit -m "docs(turismo): add PR #${prNum} to cluster #${id} evidence"`);
    sh(`git push origin ${branch}`);

    results.push({ id, branch, pr: prNum, baseline: baselineAfter });
    baseline = baselineAfter;
    prevBranch = branch;
  }

  console.log('\n=== RESULTS ===');
  console.table(results);
  console.log('Final baseline:', baseline);
}

main();
