const { execSync } = require('child_process');
const files = process.argv.slice(2);
for (const f of files) {
  let json;
  try {
    json = execSync(`npx eslint "${f}" --format json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    json = e.stdout;
  }
  const r = JSON.parse(json)[0];
  console.log(`\n${f} ${r.messages.length}`);
  r.messages.forEach((m) => console.log(`${m.line}\t${m.ruleId}\t${m.message.slice(0, 100)}`));
}
