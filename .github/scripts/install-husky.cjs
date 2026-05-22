#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function main() {
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.log('[husky-install] skipped: no .git directory');
    return;
  }

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCmd, ['exec', '--', 'husky'], {
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const code = typeof result.status === 'number' ? result.status : 1;
    process.exit(code);
  }
}

main();
