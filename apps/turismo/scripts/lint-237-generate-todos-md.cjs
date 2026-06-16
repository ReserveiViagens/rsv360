const fs = require('fs');
const path = require('path');

const j = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'lint-237-clusters.json'), 'utf8')
);

let md = `# Lint #237 — Todo list completo (${j.clusterCount} clusters)

Baseline: **${j.baselineGlobal}** warnings | Meta: **0** | Gerado: ${new Date().toISOString().slice(0, 10)}

`;

for (const c of j.clusters) {
  const files = c.files.map((f) => `\`${f.path}\` (${f.warnings})`).join(', ');
  const status = c.status === 'done' ? 'x' : ' ';
  md += `- [${status}] **Cluster ${c.id}** (−${c.delta}): ${files}\n`;
}

const out = path.join(__dirname, '../../../docs/evidence/issue-237/LINT-237-TURISMO-TODOS.md');
fs.writeFileSync(out, md);
console.log('written', j.clusterCount, 'clusters ->', out);
