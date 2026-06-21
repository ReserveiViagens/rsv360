const { execSync } = require('child_process');

const order = [
  506, 507, 508, 509, 510, 511, 512, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 531, 533, 535, 537, 539, 540, 541, 542,
];

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function getPr(n) {
  const out = sh(`gh pr view ${n} --json state,mergeable,mergeStateStatus,title`);
  return JSON.parse(out);
}

const failed = [];
for (const n of order) {
  try {
    const pr = getPr(n);
    if (pr.state === 'MERGED') {
      console.log(`SKIP ${n} already merged`);
      continue;
    }
    if (pr.state === 'CLOSED') {
      console.log(`FAIL ${n} closed`);
      failed.push(n);
      break;
    }
    console.log(`MERGE ${n} ${pr.mergeStateStatus} ${pr.mergeable} ${pr.title.slice(0, 60)}`);
    sh(`gh pr merge ${n} --merge`);
    console.log(`OK ${n}`);
  } catch (e) {
    const msg = e.stderr || e.stdout || e.message;
    console.error(`ERR ${n}:`, msg.slice(0, 500));
    failed.push(n);
    break;
  }
}

if (failed.length) {
  console.log('Stopped at:', failed.join(','));
  process.exit(1);
}
console.log('All merges complete');
