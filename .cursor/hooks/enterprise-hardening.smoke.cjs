#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const policy = require('./lib/enterprise-policy.cjs');
const { checkCommand } = require('./enterprise-guardrails.cjs');

const root = path.join(__dirname, '..', '..');

function runProtect(payload) {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'protect-enterprise-files.cjs')], {
    cwd: root,
    input: JSON.stringify(payload),
    encoding: 'utf8',
  });
  try {
    return JSON.parse(result.stdout || '{}');
  } catch {
    throw new Error(`protect hook invalid JSON: ${result.stdout} ${result.stderr}`);
  }
}

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
    return;
  }
  console.log(`OK: ${name}`);
}

const emptyPayload = {};

// Path normalization
assert(
  'absolute Windows path -> .cursor/rules/foo.mdc',
  policy.normalizePathToRepoRelative('C:/Users/RSV 360/Documents/s2-fase-e-clean/.cursor/rules/foo.mdc') ===
    '.cursor/rules/foo.mdc'
);
assert(
  'absolute workspace path -> .cursor/rules/foo.mdc',
  policy.normalizePathToRepoRelative('/workspace/repo/.cursor/rules/foo.mdc') === '.cursor/rules/foo.mdc'
);

// Shell guardrails
const shellCases = [
  ['git push --force', 'deny'],
  ['git push --force-with-lease', 'deny'],
  ['Remove-Item -Recurse -Force node_modules', 'deny'],
  ['Set-Content .env "SECRET=abc"', 'deny'],
  ['cat AGENTS.md', 'allow'],
  ['Get-Content AGENTS.md', 'allow'],
  ['git diff -- .cursor/rules/enterprise-security.mdc', 'allow'],
  ['DELETE FROM users; DELETE FROM users WHERE id=1', 'deny'],
  ['git add AGENTS.md', 'deny'],
  ['node -e "require(\"fs\").writeFileSync(\"AGENTS.md\",\"x\")"', 'deny'],
];

for (const [cmd, expected] of shellCases) {
  const result = checkCommand(cmd, emptyPayload);
  assert(`shell ${expected}: ${cmd}`, result.action === expected);
}

// Protected path shell write vs read
assert(
  'Set-Content absolute AGENTS.md blocked',
  checkCommand('Set-Content "C:/repo/AGENTS.md" "x"', emptyPayload).action === 'deny'
);

// preToolUse protect hook
assert(
  'edit rule without token -> deny',
  runProtect({
    tool_name: 'StrReplace',
    tool_input: {
      path: '.cursor/rules/enterprise-security.mdc',
      old_string: 'a',
      new_string: 'b',
    },
  }).permission === 'deny'
);

assert(
  'edit rule with token -> allow',
  runProtect({
    user_message: 'ALTERAR_ENTERPRISE_RULES_V2 please update',
    tool_name: 'StrReplace',
    tool_input: {
      path: '.cursor/rules/enterprise-security.mdc',
      old_string: 'a',
      new_string: 'b',
    },
  }).permission === 'allow'
);

assert(
  'memories findings update -> allow',
  runProtect({
    automation: true,
    tool_name: 'StrReplace',
    tool_input: {
      path: 'MEMORIES.md',
      old_string: '_Nenhum achado ativo._',
      new_string: '- [ ] Example finding — severity: low',
    },
  }).permission === 'allow'
);

assert(
  'memories sensitive content -> deny',
  runProtect({
    automation: true,
    tool_name: 'StrReplace',
    tool_input: {
      path: 'MEMORIES.md',
      old_string: '_Nenhum achado ativo._',
      new_string: 'password: supersecret',
    },
  }).permission === 'deny'
);

assert(
  'memories findings without automation -> deny',
  runProtect({
    tool_name: 'StrReplace',
    tool_input: {
      path: 'MEMORIES.md',
      old_string: '_Nenhum achado ativo._',
      new_string: '- [ ] Example finding — severity: low',
    },
  }).permission === 'deny'
);

assert(
  'token embedded in longer identifier -> deny',
  runProtect({
    user_message: 'prefix_ALTERAR_ENTERPRISE_RULES_V2_suffix',
    tool_name: 'StrReplace',
    tool_input: {
      path: '.cursor/rules/enterprise-security.mdc',
      old_string: 'a',
      new_string: 'b',
    },
  }).permission === 'deny'
);

if (process.exitCode) {
  console.error('\nSmoke tests failed.');
  process.exit(process.exitCode);
}

console.log('\nAll enterprise hardening smoke tests passed.');
