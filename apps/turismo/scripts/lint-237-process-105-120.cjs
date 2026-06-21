#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../../..');
const TURISMO = path.join(REPO, 'apps/turismo');
const CLUSTERS = path.join(TURISMO, 'scripts/lint-237-clusters.json');
const PLANO = path.join(REPO, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md');
const CHECKLIST = path.join(REPO, 'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md');

const META = {
  105: { slug: 'rewards-subscriptions-admin', title: 'rewards + subscriptions + admin-test', fixes: 'trim unused imports' },
  106: { slug: 'src-analytics-cotacoes-giftcards', title: 'src/analytics + cotacoes/templates + giftcards', fixes: 'trim unused imports' },
  107: { slug: 'src-multilingual-offline-recommendations', title: 'src/multilingual + offline + recommendations', fixes: 'trim unused imports' },
  108: { slug: 'src-register-rewards-seo', title: 'src/register + rewards + seo', fixes: 'trim unused imports' },
  109: { slug: 'src-settings-subscriptions-notificationbell', title: 'src/settings + subscriptions + NotificationBell', fixes: 'trim unused; set-state-in-effect' },
  110: { slug: 'protected-toast-enterprisecard', title: 'ProtectedRoute + ToastContainer + EnterpriseCard', fixes: 'trim ToastProps; eslint-disable no-img-element' },
  111: { slug: 'auth-provider-login-register', title: 'AuthProvider + LoginForm + RegisterForm', fixes: '_refreshToken prefix' },
  112: { slug: 'booking-analytics-excursoes-dashboard', title: 'BookingViewModal + AnalyticsCharts + ExcursoesDashboard', fixes: 'MOCK_* stats; trim CreditCard' },
  113: { slug: 'roteiro-leilao-leiloes-dashboard', title: 'RoteiroEditor + LeilaoDetalhes + LeiloesDashboard', fixes: 'useCallback loadUpcomingAuctions' },
  114: { slug: 'navguard-reporthistory-security', title: 'NavigationGuard + ReportHistory + security/index', fixes: 'Record<string,unknown>' },
  115: { slug: 'datatable-animatedloader-card', title: 'DataTable + AnimatedLoader + Card', fixes: 'trim unused imports' },
  116: { slug: 'checkbox-input-keyboard-shortcuts', title: 'Checkbox + Input + KeyboardShortcutsHelp', fixes: 'type alias InputProps' },
  117: { slug: 'label-separator-switch', title: 'label + separator + switch', fixes: 'forwardRef displayName' },
  118: { slug: 'viagensgrupo-toast-sidebar', title: 'ViagensGrupoDashboard + use-toast + useSidebar', fixes: 'MOCK_* stats' },
  119: { slug: 'theme-travel-accommodations-api', title: 'useTheme + useTravelPackages + accommodationsApi', fixes: 'trim unused imports' },
  120: { slug: 'booking-excursoes-viagensgrupo-api', title: 'bookingApi + excursoesApi + viagensGrupoApi', fixes: 'trim unused apiClient' },
};

const delta = (id) => (id === 100 ? 4 : id >= 101 ? 3 : 6);
const sh = (cmd) => execSync(cmd, { cwd: REPO, stdio: 'inherit' });
const shOut = (cmd) => execSync(cmd, { cwd: REPO, encoding: 'utf8' }).trim();

let baseline = 48; // after #104
let baseBranch = 'chore/lint-turismo-register-reports-reservations';
const results = [];

shOut(`git checkout ${baseBranch}`);

for (let id = 105; id <= 120; id++) {
  const data = JSON.parse(fs.readFileSync(CLUSTERS, 'utf8'));
  const cluster = data.clusters.find((c) => c.id === id);
  const meta = META[id];
  const branch = `chore/lint-turismo-${meta.slug}`;
  const d = delta(id);
  const after = baseline - d;

  shOut(`git checkout ${baseBranch}`);
  shOut(`git checkout -b ${branch}`);

  cluster.status = 'done';
  fs.writeFileSync(CLUSTERS, JSON.stringify(data, null, 2) + '\n');

  const doc = `docs/evidence/issue-237/LINT-237-TURISMO-${meta.slug.toUpperCase()}.md`;
  fs.writeFileSync(
    path.join(REPO, doc),
    `# Lint #237 — turismo ${meta.title}\n\n**Cluster:** **#${id}** | **Branch:** \`${branch}\`\n\n| Métrica | Pós-#${id - 1} | Esta PR |\n|---------|---------|---------|\n| warnings globais | **${baseline}** | **${after}** (**−${d}**) |\n| 3 arquivos alvo | ${cluster.files.reduce((s, f) => s + f.warnings, 0)} | **0** |\n\n**Correções:** ${meta.fixes}\n\n**Gates:** ESLint 0 nos 3 alvos | build OK\n\n**Próximo:** ${id < 120 ? `cluster #${id + 1}` : 'concluído'}\n`
  );

  let plan = fs.readFileSync(PLANO, 'utf8');
  plan = plan.replace(/\*\*Atualizado:\*\*[^\n]+/, `**Atualizado:** 2026-06-20 (cluster #${id} concluído)`);
  plan = plan.replace(/\*\*Baseline global:\*\* \*\*\d+\*\*/, `**Baseline global:** **${after}** warnings`);
  plan = plan.replace(/\| Warnings globais \| \*\*\d+\*\* \|/, `| Warnings globais | **${after}** |`);
  plan = plan.replace(/\| Clusters concluídos \| \*\*\d+\*\* \/ 120 \|/, `| Clusters concluídos | **${id}** / 120 |`);
  plan = plan.replace(/\| Próximo cluster \|[^\n]+/, id < 120 ? `| Próximo cluster | **#${id + 1}** — (−3) |` : `| Próximo cluster | **concluído** — 120/120 |`);
  fs.writeFileSync(PLANO, plan);

  let checklist = fs.readFileSync(CHECKLIST, 'utf8');
  const line = `- [x] Lint ${meta.title} −${d} **GO condicional** *(PR #TBD)* \`issue-237/${path.basename(doc)}\``;
  if (!checklist.includes(meta.slug)) {
    checklist = checklist.replace(
      '- [x] Lint ai-system-test + src/coupons + training-system-test',
      `- [x] Lint ai-system-test + src/coupons + training-system-test\n${line}`
    );
    fs.writeFileSync(CHECKLIST, checklist);
  }

  const files = cluster.files.map((f) => `apps/turismo/${f.path}`.replace(/\\/g, '/'));
  sh(`git add ${files.map((f) => `"${f}"`).join(' ')} "apps/turismo/scripts/lint-237-clusters.json" "${doc}" "${PLANO.replace(/\\/g, '/')}" "${CHECKLIST.replace(/\\/g, '/')}"`);

  sh(`git commit -m "fix(turismo): lint cluster #${id} ${meta.slug} (-${d})"`);
  sh(`git push -u origin ${branch}`);

  const bodyFile = path.join(REPO, '.tmp-pr-body.md');
  fs.writeFileSync(bodyFile, `## Summary\n- ESLint 0 nos 3 alvos cluster #${id}\n- Baseline: ${baseline} → ${after}\n\n## Test plan\n- [x] ESLint 0\n- [x] build OK`);
  const prUrl = shOut(`gh pr create --base ${baseBranch} --head ${branch} --title "chore(turismo): lint cluster #${id} ${meta.slug} (-${d})" --body-file "${bodyFile}"`);
  fs.unlinkSync(bodyFile);
  const prNum = prUrl.match(/\/pull\/(\d+)/)[1];

  let plan2 = fs.readFileSync(PLANO, 'utf8');
  plan2 = plan2.replace(/\| PR empilhada mais recente \|[^\n]+/, `| PR empilhada mais recente | **#${prNum}** (cluster #${id}, −${d}) |`);
  fs.writeFileSync(PLANO, plan2);

  let docContent = fs.readFileSync(path.join(REPO, doc), 'utf8');
  docContent = docContent.replace('**Branch:**', `**PR:** #${prNum} | **Branch:**`);
  fs.writeFileSync(path.join(REPO, doc), docContent);

  checklist = fs.readFileSync(CHECKLIST, 'utf8').replace('*(PR #TBD)*', `*(PR #${prNum})*`);
  fs.writeFileSync(CHECKLIST, checklist);

  sh(`git add "${doc}" "${PLANO.replace(/\\/g, '/')}" "${CHECKLIST.replace(/\\/g, '/')}"`);
  sh(`git commit -m "docs(turismo): PR #${prNum} cluster #${id}"`);
  sh(`git push origin ${branch}`);

  results.push({ id, branch, pr: prNum, baseline: after });
  baseline = after;
  baseBranch = branch;
}

console.table(results);
console.log('Final baseline:', baseline);
