#!/usr/bin/env node
/**
 * Strip Cursor auto-appended PR body blocks that fail the human gate:
 * HTML comment summary wrappers, "Reviewed by … Bugbot" footnotes
 * (often present even when that review did not run), and the
 * "Made with [Cursor](…)" attribution footer.
 *
 * Usage:
 *   node scripts/gh-pr-body-sanitize.cjs 132
 *   node scripts/gh-pr-body-sanitize.cjs 132 --dry-run
 *
 * Call after every `gh pr create` / before gate. Source of injection is Cursor's
 * PR summary appender, not .github/pull_request_template.md.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const pr = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!pr || !/^\d+$/.test(pr)) {
  console.error('Usage: node scripts/gh-pr-body-sanitize.cjs <pr-number> [--dry-run]');
  process.exit(2);
}

const bodyRaw = execFileSync(
  'gh',
  ['api', `repos/{owner}/{repo}/pulls/${pr}`, '--jq', '.body'],
  { encoding: 'utf8' },
);

let cleaned = bodyRaw.replace(
  /\r?\n?<!--\s*CURSOR_SUMMARY\s*-->[\s\S]*?<!--\s*\/CURSOR_SUMMARY\s*-->\r?\n?/gi,
  '\n',
);
cleaned = cleaned.replace(
  /\r?\n?>\s*<sup>Reviewed by \[Cursor Bugbot\][\s\S]*?<\/sup>\s*\r?\n?/gi,
  '\n',
);
// Attribution footer (gate #190 / 07c1): "Made with [Cursor](https://cursor.com)"
cleaned = cleaned.replace(
  /\r?\n+Made with \[Cursor\]\([^)]*\)\s*$/gim,
  '\n',
);
cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim() + '\n';

const report = {
  pr: Number(pr),
  had_cursor_summary: /CURSOR_SUMMARY/i.test(bodyRaw),
  had_bugbot_footnote: /Reviewed by \[Cursor Bugbot\]/i.test(bodyRaw),
  had_made_with_cursor: /Made with \[Cursor\]/i.test(bodyRaw),
  before_len: bodyRaw.length,
  after_len: cleaned.length,
  dry_run: dryRun,
  changed: cleaned !== bodyRaw,
};
console.log(JSON.stringify(report, null, 2));

if (dryRun) {
  process.stdout.write(cleaned);
  process.exit(0);
}

if (!report.changed) {
  console.log('No changes needed.');
  process.exit(0);
}

const tmp = path.join(os.tmpdir(), `pr-${pr}-body-clean.md`);
fs.writeFileSync(tmp, cleaned, { encoding: 'utf8' });
execFileSync('gh', ['pr', 'edit', pr, '--body-file', tmp], { stdio: 'inherit' });
fs.unlinkSync(tmp);
console.log(`PR #${pr} body sanitized.`);
