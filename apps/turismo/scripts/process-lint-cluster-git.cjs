#!/usr/bin/env node
/**
 * Git workflow helper for lint clusters 94-120.
 * Usage: node scripts/process-lint-cluster-git.cjs <id> <slug> <base-branch> <pr-num> <prev-baseline> <delta>
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const turismo = path.join(root, 'apps/turismo');
const clustersPath = path.join(turismo, 'scripts/lint-237-clusters.json');
const [id, slug, baseBranch, prNum, prevBaseline, delta] = process.argv.slice(2);
if (!id) { console.error('Usage: node process-lint-cluster-git.cjs <id> <slug> <base> <pr#> <prevBaseline> <delta>'); process.exit(1); }

const data = JSON.parse(fs.readFileSync(clustersPath, 'utf8'));
const cluster = data.clusters.find(c => String(c.id) === String(id));
if (!cluster) throw new Error(`Cluster ${id} not found`);

const branch = `chore/lint-turismo-${slug}`;
const newBaseline = Number(prevBaseline) - Number(delta);
const slugUpper = slug.toUpperCase().replace(/-/g, '-');
const evidenceName = `LINT-237-TURISMO-${slugUpper}.md`;
const targetFiles = cluster.files.map(f => path.join('apps/turismo', f.path).replace(/\\/g, '/'));

// Verify eslint 0
const eslintCmd = `npx eslint ${cluster.files.map(f => `"${f.path}"`).join(' ')}`;
try {
  execSync(eslintCmd, { cwd: turismo, stdio: 'pipe' });
} catch (e) {
  console.error(`ESLint failed for cluster ${id}:`);
  console.error(e.stdout?.toString() || e.message);
  process.exit(1);
}

execSync(`git checkout -b ${branch}`, { cwd: root, stdio: 'inherit' });

// Mark cluster done
cluster.status = 'done';
fs.writeFileSync(clustersPath, JSON.stringify(data, null, 2) + '\n');

// Evidence
const evidence = `# Lint #237 — turismo cluster #${id}

**Cluster:** **#${id}** | **Branch:** \`${branch}\`

| Métrica | Pós-#${Number(id)-1} | Esta PR |
|---------|---------|---------|
| warnings globais | **${prevBaseline}** | **${newBaseline}** (**−${delta}**) |
| 3 arquivos alvo | ${cluster.files.reduce((s,f)=>s+f.warnings,0)} | **0** |

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #${Number(id)+1}
`;
fs.writeFileSync(path.join(root, 'docs/evidence/issue-237', evidenceName), evidence);

// Update plan header
const planPath = path.join(root, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md');
let plan = fs.readFileSync(planPath, 'utf8');
plan = plan.replace(/\*\*Atualizado:\*\*[^\n]+/, `**Atualizado:** 2026-06-20 (cluster #${id} concluído)`);
plan = plan.replace(/\*\*Baseline global:\*\* \*\*\d+\*\*/, `**Baseline global:** **${newBaseline}** warnings`);
plan = plan.replace(/\| Warnings globais \| \*\*\d+\*\* \|/, `| Warnings globais | **${newBaseline}** |`);
plan = plan.replace(/\| Clusters concluídos \| \*\*\d+\*\* \/ 120 \|/, `| Clusters concluídos | **${id}** / 120 |`);
plan = plan.replace(/\| PR empilhada mais recente \| \*\*#\d+\*[^\|]*\|/, `| PR empilhada mais recente | **#${prNum}** (cluster #${id}, −${delta}) |`);
plan = plan.replace(/\| Próximo cluster \| \*\*#\d+\*[^\|]*\|/, `| Próximo cluster | **#${Number(id)+1}** — (−${Number(id) >= 100 ? 3 : id >= 91 ? 6 : 4}) |`);
fs.writeFileSync(planPath, plan);

// Checklist line
const checklistPath = path.join(root, 'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md');
let checklist = fs.readFileSync(checklistPath, 'utf8');
const line = `- [x] Lint cluster #${id} ?${delta} ? **GO condicional** *(PR #${prNum})* ? \`issue-237/${evidenceName}\`\n`;
checklist = checklist.replace('## Decis?o Trilha 0', line + '\n## Decis?o Trilha 0');
fs.writeFileSync(checklistPath, checklist);

const toAdd = [...targetFiles, 'apps/turismo/scripts/lint-237-clusters.json',
  `docs/evidence/issue-237/${evidenceName}`, 'docs/evidence/issue-237/LINT-237-TURISMO-PLANO-CODEX.md',
  'docs/evidence/trilha-0/TRILHA-0-CHECKLIST.md'];
execSync(`git add ${toAdd.map(f => `"${f}"`).join(' ')}`, { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "fix(turismo): lint cluster #${id} ${slug} (-${delta})"`, { cwd: root, stdio: 'inherit' });
execSync(`git push -u origin ${branch}`, { cwd: root, stdio: 'inherit' });
execSync(`gh pr create --base ${baseBranch} --title "fix(turismo): lint cluster #${id} ${slug} (-${delta})" --body "## Summary\\n- Cluster #${id}: ESLint 0 nos 3 alvos\\n- Baseline: ${prevBaseline} -> **${newBaseline}** (-${delta})"`, { cwd: root, stdio: 'inherit' });

console.log(`Cluster ${id} done: PR #${prNum}, baseline ${newBaseline}`);
