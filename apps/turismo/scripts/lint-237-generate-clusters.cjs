const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dirs = ['pages', 'src/pages', 'src/components', 'src/hooks', 'src/services', 'src/context'];
const skip = /voucher-editor|validation\.tsx$/;
const byFile = {};

for (const dir of dirs) {
  const abs = path.join(root, dir);
  let json;
  try {
    json = execSync(`npx eslint "${abs.replace(/\\/g, '/')}" --format json`, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (e) {
    json = e.stdout || '[]';
  }
  let results;
  try {
    results = JSON.parse(json);
  } catch {
    continue;
  }
  for (const file of results) {
    const rel = path.relative(root, file.filePath).replace(/\\/g, '/');
    if (skip.test(rel)) continue;
    const w = file.messages.filter((m) => m.severity === 1).length;
    if (w) byFile[rel] = w;
  }
}

const sorted = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
const clusters = [];
let i = 0;
let clusterId = 1;

while (i < sorted.length) {
  const batch = [];
  let sum = 0;
  while (i < sorted.length && batch.length < 3) {
    const next = sorted[i];
    if (batch.length >= 2 && sum >= 75) break;
    batch.push({ path: next[0], warnings: next[1] });
    sum += next[1];
    i++;
  }
  clusters.push({ id: clusterId++, delta: sum, files: batch, status: 'pending' });
}

const total = sorted.reduce((a, [, w]) => a + w, 0);
const out = {
  generatedAt: new Date().toISOString(),
  totalWarnings: total,
  fileCount: sorted.length,
  clusterCount: clusters.length,
  baselineGlobal: total,
  clusters,
};

const outPath = path.join(root, 'scripts', 'lint-237-clusters.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Total: ${total} files: ${sorted.length} clusters: ${clusters.length}`);
clusters.forEach((c) => {
  console.log(
    `#${c.id} -${c.delta}`,
    c.files.map((f) => `${f.warnings} ${f.path}`).join(' | ')
  );
});
