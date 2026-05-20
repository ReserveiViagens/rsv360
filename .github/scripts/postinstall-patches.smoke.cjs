#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const script = path.join(__dirname, 'postinstall-patches.cjs');

function runOnce() {
  return spawnSync(process.execPath, [script], { encoding: 'utf8' });
}

const first = runOnce();
if (first.status !== 0) {
  process.stderr.write(first.stdout || '');
  process.stderr.write(first.stderr || '');
  process.stderr.write('[postinstall-patches.smoke] first run failed\n');
  process.exit(first.status || 1);
}

const second = runOnce();
if (second.status !== 0) {
  process.stderr.write(second.stdout || '');
  process.stderr.write(second.stderr || '');
  process.stderr.write('[postinstall-patches.smoke] second run failed\n');
  process.exit(second.status || 1);
}

const secondOutput = `${second.stdout || ''}${second.stderr || ''}`;
if (/\bupdated:\b|\bpatched\b/i.test(secondOutput)) {
  process.stderr.write(secondOutput);
  process.stderr.write('[postinstall-patches.smoke] second run was not no-op\n');
  process.exit(1);
}

console.log('[postinstall-patches.smoke] OK');
