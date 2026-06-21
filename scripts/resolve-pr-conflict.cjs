const { execSync } = require('child_process');

const pr = process.argv[2];
if (!pr) {
  console.error('Usage: node resolve-pr-conflict.cjs <PR_NUMBER>');
  process.exit(1);
}

function sh(cmd, ignoreError = false) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    if (ignoreError) return e.stdout || e.stderr || '';
    throw e;
  }
}

const info = JSON.parse(sh(`gh pr view ${pr} --json headRefName,baseRefName`));
const head = info.headRefName;
const base = info.baseRefName;

console.log(`Resolving PR #${pr}: ${head} <- ${base}`);
sh(`gh pr checkout ${pr}`, true);
sh('git fetch origin', true);

try {
  sh(`git merge origin/${base}`);
} catch (e) {
  const out = (e.stdout || '') + (e.stderr || '');
  if (!out.includes('CONFLICT')) throw e;
}

const status = sh('git status --porcelain', true);
if (!status.includes('UU') && !status.includes('AA')) {
  console.log('No conflicts after merge');
} else {
  const conflicted = status
    .split('\n')
    .filter((l) => l.startsWith('UU ') || l.startsWith('AA '))
    .map((l) => l.slice(3));

  for (const file of conflicted) {
    if (file.includes('docs/') || file.endsWith('.md') || file.includes('lint-237-clusters.json')) {
      sh(`git checkout --ours "${file}"`, true);
      console.log('ours:', file);
    } else {
      console.log('MANUAL:', file);
    }
  }
}

sh('git add -A', true);
try {
  sh(`git commit -m "merge: sync ${base} into PR #${pr}"`);
} catch (e) {
  if (!(e.stdout || '').includes('nothing to commit')) throw e;
}
sh(`git push origin ${head}`, true);
sh(`gh pr merge ${pr} --merge`, true);
console.log(`OK #${pr}`);
