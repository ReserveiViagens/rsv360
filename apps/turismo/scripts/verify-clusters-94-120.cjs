const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '../../..');
const turismo = path.join(root, 'apps/turismo');
const data = JSON.parse(fs.readFileSync(path.join(turismo, 'scripts/lint-237-clusters.json'), 'utf8'));
const failed = [];
for (const cl of data.clusters.filter(c => c.id >= 94 && c.id <= 120)) {
  const files = cl.files.map(f => f.path);
  try {
    execSync(`npx eslint ${files.map(f => JSON.stringify(f)).join(' ')}`, { cwd: turismo, stdio: 'pipe' });
    console.log(`#${cl.id} OK`);
  } catch (e) {
    const out = (e.stdout || '').toString();
    const count = (out.match(/\d+:\d+\s+warning|\d+:\d+\s+error/g) || []).length;
    console.log(`#${cl.id} FAIL (${count})`);
    console.log(out.split('\n').filter(l => /warning|error/.test(l)).slice(0, 6).join('\n'));
    failed.push(cl.id);
  }
}
console.log('Failed clusters:', failed.join(', ') || 'none');
process.exit(failed.length ? 1 : 0);
