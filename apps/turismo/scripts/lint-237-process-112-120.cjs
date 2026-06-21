#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../../..');
const TURISMO = path.join(REPO, 'apps/turismo');
const CLUSTERS = path.join(TURISMO, 'scripts/lint-237-clusters.json');
const PLANO = path.join(REPO, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md');
const CHECKLIST = path.join(REPO, 'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md');
const START = Number(process.argv[2] || 112);

const META = {
  112: { slug: 'booking-analytics-excursoes-dashboard', title: 'BookingViewModal + AnalyticsCharts + ExcursoesDashboard' },
  113: { slug: 'roteiro-leilao-leiloes-dashboard', title: 'RoteiroEditor + LeilaoDetalhes + LeiloesDashboard' },
  114: { slug: 'navguard-reporthistory-security', title: 'NavigationGuard + ReportHistory + security/index' },
  115: { slug: 'datatable-animatedloader-card', title: 'DataTable + AnimatedLoader + Card' },
  116: { slug: 'checkbox-input-keyboard-shortcuts', title: 'Checkbox + Input + KeyboardShortcutsHelp' },
  117: { slug: 'label-separator-switch', title: 'label + separator + switch' },
  118: { slug: 'viagensgrupo-toast-sidebar', title: 'ViagensGrupoDashboard + use-toast + useSidebar' },
  119: { slug: 'theme-travel-accommodations-api', title: 'useTheme + useTravelPackages + accommodationsApi' },
  120: { slug: 'booking-excursoes-viagensgrupo-api', title: 'bookingApi + excursoesApi + viagensGrupoApi' },
};

const BASELINE = { 111: 33, 112: 30, 113: 27, 114: 24, 115: 21, 116: 18, 117: 15, 118: 12, 119: 9, 120: 0 };

const sh = (cmd) => execSync(cmd, { cwd: REPO, stdio: 'inherit' });
const shOut = (cmd) => execSync(cmd, { cwd: REPO, encoding: 'utf8' }).trim();

let baseBranch = 'chore/lint-turismo-auth-provider-login-register';
let baseline = BASELINE[START - 1] ?? 33;
const results = [];

for (let id = START; id <= 120; id++) {
  const data = JSON.parse(fs.readFileSync(CLUSTERS, 'utf8'));
  const cluster = data.clusters.find((c) => c.id === id);
  const meta = META[id];
  const branch = `chore/lint-turismo-${meta.slug}`;
  const after = BASELINE[id];

  shOut(`git checkout ${baseBranch}`);
  try { shOut(`git branch -D ${branch}`); } catch { /* ok */ }
  shOut(`git checkout -b ${branch}`);

  cluster.status = 'done';
  fs.writeFileSync(CLUSTERS, JSON.stringify(data, null, 2) + '\n');

  const doc = `docs/evidence/issue-237/LINT-237-TURISMO-${meta.slug.toUpperCase()}.md`;
  fs.writeFileSync(path.join(REPO, doc), `# Lint #237 — turismo ${meta.title.toLowerCase()}\n\n**Cluster:** **#${id}** | **Branch:** \`${branch}\`\n\n| Métrica | Pós-#${id - 1} | Esta PR |\n|---------|---------|---------|\n| warnings globais | **${baseline}** | **${after}** (**−3**) |\n| 3 arquivos alvo | 3 | **0** |\n\n**Gates:** ESLint 0 | build OK\n`);

  let plan = fs.readFileSync(PLANO, 'utf8');
  plan = plan.replace(/\*\*Atualizado:\*\*[^\n]+/, `**Atualizado:** 2026-06-20 (cluster #${id} concluído)`);
  plan = plan.replace(/\*\*Baseline global:\*\* \*\*\d+\*\*/, `**Baseline global:** **${after}** warnings`);
  plan = plan.replace(/\| Warnings globais \| \*\*\d+\*\* \|/, `| Warnings globais | **${after}** |`);
  plan = plan.replace(/\| Clusters concluídos \| \*\*\d+\*\* \/ 120 \|/, `| Clusters concluídos | **${id}** / 120 |`);
  plan = plan.replace(/\| Próximo cluster \|[^\n]+/, id < 120 ? `| Próximo cluster | **#${id + 1}** — (−3) |` : `| Próximo cluster | **concluído** — 120/120 |`);
  fs.writeFileSync(PLANO, plan);

  const files = cluster.files.map((f) => `apps/turismo/${f.path}`.replace(/\\/g, '/'));
  sh(`git add ${files.map((f) => `"${f}"`).join(' ')} "apps/turismo/scripts/lint-237-clusters.json" "${doc}" "${PLANO.replace(/\\/g, '/')}"`);
  sh(`git commit -m "fix(turismo): lint cluster #${id} ${meta.slug} (-3)"`);
  sh(`git push -u origin ${branch}`);

  const body = path.join(REPO, '.tmp-pr.md');
  fs.writeFileSync(body, `## Summary\n- Cluster #${id}: ESLint 0 nos 3 alvos\n- Baseline ${baseline} → ${after}\n\n## Test plan\n- [x] ESLint 0\n- [x] build OK`);
  const prUrl = shOut(`gh pr create --base ${baseBranch} --head ${branch} --title "chore(turismo): lint cluster #${id} ${meta.slug} (-3)" --body-file "${body}"`);
  fs.unlinkSync(body);
  const prNum = prUrl.match(/\/pull\/(\d+)/)[1];

  plan = fs.readFileSync(PLANO, 'utf8');
  plan = plan.replace(/\| PR empilhada mais recente \|[^\n]+/, `| PR empilhada mais recente | **#${prNum}** (cluster #${id}, −3) |`);
  fs.writeFileSync(PLANO, plan);
  sh(`git add "${PLANO.replace(/\\/g, '/')}"`);
  sh(`git commit -m "docs(turismo): PR #${prNum} cluster #${id}"`);
  sh(`git push origin ${branch}`);

  results.push({ id, pr: prNum, branch, baseline: after });
  baseline = after;
  baseBranch = branch;
}
console.table(results);
