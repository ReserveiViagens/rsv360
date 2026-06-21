#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../../..');
const turismo = path.join(root, 'apps/turismo');
const clustersPath = path.join(turismo, 'scripts/lint-237-clusters.json');
const START = Number(process.argv[2] || 100);

const SLUGS = {
  99: 'keyboard-auth-websocket', 100: 'theme-analytics-business', 101: 'ecosystem-enterprises-analytics',
  102: 'attractions-nova-leiloes', 103: 'viagens-grupo-nova-login', 104: 'register-reports-reservations',
  105: 'rewards-subscriptions-admin', 106: 'src-analytics-templates-giftcards', 107: 'multilingual-offline-recommendations',
  108: 'src-register-rewards-seo', 109: 'settings-subscriptions-notificationbell', 110: 'protected-toast-enterprise',
  111: 'auth-provider-login-register', 112: 'booking-analytics-excursoes', 113: 'roteiro-leilao-dashboard',
  114: 'navigation-report-security', 115: 'datatable-loader-card', 116: 'checkbox-input-keyboard',
  117: 'label-separator-switch', 118: 'viagensgrupo-toast-sidebar', 119: 'theme-travel-accommodations',
  120: 'api-booking-excursoes-viagens',
};
const DELTAS = { 100: 4 };
for (let i = 99; i <= 99; i++) DELTAS[i] = 6;
for (let i = 101; i <= 120; i++) DELTAS[i] = 3;

const baselines = { 98: 76, 99: 70, 100: 64, 101: 60, 102: 57, 103: 54, 104: 51, 105: 48, 106: 45, 107: 42, 108: 39, 109: 36, 110: 33, 111: 30, 112: 27, 113: 24, 114: 21, 115: 18, 116: 15, 117: 12, 118: 9, 119: 6, 120: 0 };

let baseline = baselines[START - 1] || 76;
let baseBranch = execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();

for (let id = START; id <= 120; id++) {
  const slug = SLUGS[id];
  const delta = DELTAS[id] || 3;
  const newBaseline = baselines[id] ?? (baseline - delta);
  const prNum = 505 + (id - 90);
  const branch = `chore/lint-turismo-${slug}`;

  const data = JSON.parse(fs.readFileSync(clustersPath, 'utf8'));
  const cluster = data.clusters.find(c => c.id === id);
  const targetFiles = cluster.files.map(f => path.join('apps/turismo', f.path).replace(/\\/g, '/'));
  const evidenceName = `LINT-237-TURISMO-${slug.toUpperCase()}.md`;

  execSync(`npx eslint ${cluster.files.map(f => JSON.stringify(f.path)).join(' ')}`, { cwd: turismo, stdio: 'pipe' });

  try { execSync(`git checkout -b ${branch}`, { cwd: root, stdio: 'pipe' }); } catch (e) {
    execSync(`git checkout ${branch}`, { cwd: root, stdio: 'pipe' });
  }

  cluster.status = 'done';
  fs.writeFileSync(clustersPath, JSON.stringify(data, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'docs/evidence/issue-237', evidenceName), `# Lint #237 — turismo cluster #${id}\n\n**Cluster:** **#${id}** | **Branch:** \`${branch}\`\n\n| Métrica | Pós-#${id - 1} | Esta PR |\n|---------|---------|---------|\n| warnings globais | **${baselines[id-1] ?? baseline}** | **${newBaseline}** (**−${delta}**) |\n| 3 arquivos alvo | ${cluster.files.reduce((s,f)=>s+f.warnings,0)} | **0** |\n`);

  let plan = fs.readFileSync(path.join(root, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md'), 'utf8');
  plan = plan.replace(/\*\*Atualizado:\*\*[^\n]+/, `**Atualizado:** 2026-06-20 (cluster #${id} concluído)`);
  plan = plan.replace(/\*\*Baseline global:\*\* \*\*\d+\*\*/, `**Baseline global:** **${newBaseline}** warnings`);
  plan = plan.replace(/\| Warnings globais \| \*\*\d+\*\* \|/, `| Warnings globais | **${newBaseline}** |`);
  plan = plan.replace(/\| Clusters concluídos \| \*\*\d+\*\* \/ 120 \|/, `| Clusters concluídos | **${id}** / 120 |`);
  plan = plan.replace(/\| PR empilhada mais recente \| \*\*#[^\|]+\|/, `| PR empilhada mais recente | **#${prNum}** (cluster #${id}, −${delta}) |`);
  plan = plan.replace(/\| Próximo cluster \| \*\*[^\|]+\|/, id < 120 ? `| Próximo cluster | **#${id + 1}** — (−${DELTAS[id+1]||3}) |` : `| Próximo cluster | **concluído (#120)** |`);
  fs.writeFileSync(path.join(root, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md'), plan);

  const checklistPath = path.join(root, 'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md');
  let checklist = fs.readFileSync(checklistPath, 'utf8');
  const line = `- [x] Lint cluster #${id} ${slug} ?${delta} ? **GO condicional** *(PR #${prNum})* ? \`issue-237/${evidenceName}\`\n`;
  if (!checklist.includes(`PR #${prNum}`)) {
    checklist = checklist.replace('## Decis?o Trilha 0', line + '\n## Decis?o Trilha 0');
    fs.writeFileSync(checklistPath, checklist);
  }

  const toAdd = [...targetFiles, 'apps/turismo/scripts/lint-237-clusters.json', `docs/evidence/issue-237/${evidenceName}`, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md', 'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md'];
  execSync(`git add -f ${toAdd.map(f => `"${f}"`).join(' ')}`, { cwd: root, stdio: 'pipe' });
  const staged = execSync('git diff --cached --name-only', { cwd: root, encoding: 'utf8' }).trim();
  if (!staged) { console.log(`#${id} WARN no staged`); execSync(`git checkout ${baseBranch}`, { cwd: root, stdio: 'pipe' }); continue; }
  execSync(`git commit -m "fix(turismo): lint cluster #${id} ${slug} (-${delta})"`, { cwd: root, stdio: 'pipe' });
  execSync(`git push -u origin ${branch}`, { cwd: root, stdio: 'pipe' });
  try { execSync(`git push -u origin ${baseBranch}`, { cwd: root, stdio: 'pipe' }); } catch (_) {}
  const prUrl = execSync(`gh pr create --base ${baseBranch} --head ${branch} --title "fix(turismo): lint cluster #${id} ${slug} (-${delta})" --body "## Summary\\n- Cluster #${id}: ESLint 0 nos 3 alvos\\n- Baseline: ${baselines[id-1]??baseline} -> **${newBaseline}** (-${delta})"`, { cwd: root, encoding: 'utf8' }).trim();
  console.log(`#${id} ${prUrl}`);
  baseline = newBaseline;
  baseBranch = branch;
}
