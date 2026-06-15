const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const dirs = ['pages', 'src/pages', 'src/components', 'src/hooks', 'src/services', 'src/context'];

const skip = /voucher-editor|validation\.tsx$/;
const byFile = {};
const byDir = {};

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
    const warnings = file.messages.filter((m) => m.severity === 1);
    if (!warnings.length) continue;
    byFile[rel] = (byFile[rel] || 0) + warnings.length;
    byDir[dir] = (byDir[dir] || 0) + warnings.length;
  }
}

const total = Object.values(byFile).reduce((a, b) => a + b, 0);
console.log('Total warnings (excl voucher-editor + validation):', total);
console.log('\nBy directory:');
Object.entries(byDir)
  .sort((a, b) => b[1] - a[1])
  .forEach(([d, n]) => console.log(String(n).padStart(5), d));

console.log('\nTop 30 files:');
Object.entries(byFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([f, n]) => console.log(String(n).padStart(5), f));
