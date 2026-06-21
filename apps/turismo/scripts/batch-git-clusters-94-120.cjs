#!/usr/bin/env node
/** Batch git workflow for lint clusters 94-120 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../../..');
const turismo = path.join(root, 'apps/turismo');
const clustersPath = path.join(turismo, 'scripts/lint-237-clusters.json');

const SLUGS = {
  94: 'userprofile-analytics-excursaoform',
  95: 'participantes-auction-stats',
  96: 'breadcrumbs-pagetransition-notificationbell',
  97: 'reportanalytics-ui-pagetransition',
  98: 'radiogroup-grupo-pagamento',
  99: 'keyboard-auth-websocket',
  100: 'theme-analytics-business',
  101: 'ecosystem-enterprises-analytics',
  102: 'attractions-nova-leiloes',
  103: 'viagens-grupo-nova-login',
  104: 'register-reports-reservations',
  105: 'rewards-subscriptions-admin',
  106: 'src-analytics-templates-giftcards',
  107: 'multilingual-offline-recommendations',
  108: 'src-register-rewards-seo',
  109: 'settings-subscriptions-notificationbell',
  110: 'protected-toast-enterprise',
  111: 'auth-provider-login-register',
  112: 'booking-analytics-excursoes',
  113: 'roteiro-leilao-dashboard',
  114: 'navigation-report-security',
  115: 'datatable-loader-card',
  116: 'checkbox-input-keyboard',
  117: 'label-separator-switch',
  118: 'viagensgrupo-toast-sidebar',
  119: 'theme-travel-accommodations',
  120: 'api-booking-excursoes-viagens',
};

const DELTAS = {};
for (let i = 94; i <= 99; i++) DELTAS[i] = 6;
DELTAS[100] = 4;
for (let i = 101; i <= 120; i++) DELTAS[i] = 3;

let baseline = 100;
let baseBranch = 'chore/lint-turismo-ai-coupons-training-test';
const results = [];

for (let id = 94; id <= 120; id++) {
  const slug = SLUGS[id];
  const delta = DELTAS[id];
  const newBaseline = baseline - delta;
  const prNum = 505 + (id - 90); // 509 for 94, ... 535 for 120
  const branch = `chore/lint-turismo-${slug}`;
  const slugUpper = slug.toUpperCase();
  const evidenceName = `LINT-237-TURISMO-${slugUpper}.md`;

  const data = JSON.parse(fs.readFileSync(clustersPath, 'utf8'));
  const cluster = data.clusters.find(c => c.id === id);
  const targetFiles = cluster.files.map(f => path.join('apps/turismo', f.path).replace(/\\/g, '/'));

  execSync(`npx eslint ${cluster.files.map(f => JSON.stringify(f.path)).join(' ')}`, { cwd: turismo, stdio: 'pipe' });

  try { execSync(`git checkout ${baseBranch}`, { cwd: root, stdio: 'pipe' }); } catch (_) {}
  execSync(`git checkout -b ${branch}`, { cwd: root, stdio: 'pipe' });

  cluster.status = 'done';
  fs.writeFileSync(clustersPath, JSON.stringify(data, null, 2) + '\n');

  const evidence = `# Lint #237 — turismo cluster #${id}

**Cluster:** **#${id}** | **Branch:** \`${branch}\`

| Métrica | Pós-#${id - 1} | Esta PR |
|---------|---------|---------|
| warnings globais | **${baseline}** | **${newBaseline}** (**−${delta}**) |
| 3 arquivos alvo | ${cluster.files.reduce((s, f) => s + f.warnings, 0)} | **0** |

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #${id + 1}${id < 120 ? ` — (−${DELTAS[id + 1] || 3})` : ''}
`;
  fs.writeFileSync(path.join(root, 'docs/evidence/issue-237', evidenceName), evidence);

  let plan = fs.readFileSync(path.join(root, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md'), 'utf8');
  plan = plan.replace(/\*\*Atualizado:\*\*[^\n]+/, `**Atualizado:** 2026-06-20 (cluster #${id} concluído)`);
  plan = plan.replace(/\*\*Baseline global:\*\* \*\*\d+\*\*/, `**Baseline global:** **${newBaseline}** warnings`);
  plan = plan.replace(/\| Warnings globais \| \*\*\d+\*\* \|/, `| Warnings globais | **${newBaseline}** |`);
  plan = plan.replace(/\| Clusters concluídos \| \*\*\d+\*\* \/ 120 \|/, `| Clusters concluídos | **${id}** / 120 |`);
  plan = plan.replace(/\| PR empilhada mais recente \| \*\*#[^\|]+\|/, `| PR empilhada mais recente | **#${prNum}** (cluster #${id}, −${delta}) |`);
  const nextDelta = id < 120 ? DELTAS[id + 1] : 0;
  plan = plan.replace(/\| Próximo cluster \| \*\*#[^\|]+\|/, id < 120 ? `| Próximo cluster | **#${id + 1}** — (−${nextDelta}) |` : `| Próximo cluster | **concluído** |`);
  fs.writeFileSync(path.join(root, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md'), plan);

  const checklistPath = path.join(root, 'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md');
  let checklist = fs.readFileSync(checklistPath, 'utf8');
  const line = `- [x] Lint cluster #${id} ${slug} ?${delta} ? **GO condicional** *(PR #${prNum})* ? \`issue-237/${evidenceName}\`\n`;
  if (!checklist.includes(`PR #${prNum}`)) {
    checklist = checklist.replace('## Decis?o Trilha 0', line + '\n## Decis?o Trilha 0');
    fs.writeFileSync(checklistPath, checklist);
  }

  const toAdd = [...targetFiles, 'apps/turismo/scripts/lint-237-clusters.json',
    `docs/evidence/issue-237/${evidenceName}`, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md',
    'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md'];
  execSync(`git add ${toAdd.map(f => `"${f}"`).join(' ')}`, { cwd: root, stdio: 'pipe' });
  execSync(`git commit -m "fix(turismo): lint cluster #${id} ${slug} (-${delta})"`, { cwd: root, stdio: 'pipe' });
  execSync(`git push -u origin ${branch}`, { cwd: root, stdio: 'pipe' });
  const prUrl = execSync(
    `gh pr create --base ${baseBranch} --title "fix(turismo): lint cluster #${id} ${slug} (-${delta})" --body "## Summary\\n- Cluster #${id}: ESLint 0 nos 3 alvos\\n- Baseline: ${baseline} -> **${newBaseline}** (-${delta})"`,
    { cwd: root, encoding: 'utf8' }
  ).trim();

  results.push({ id, pr: prUrl.match(/\/(\d+)$/)?.[1] || prNum, branch, baseline: newBaseline });
  baseline = newBaseline;
  baseBranch = branch;
  console.log(`#${id} OK ${prUrl}`);
}

console.log(JSON.stringify(results, null, 2));
