#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const COVERAGE_REPORTER = path.join(
  'node_modules',
  '@jest',
  'reporters',
  'build',
  'CoverageReporter.js'
);
const SHARP_TARGETS = [
  'node_modules/@img/sharp-linux-x64',
  'node_modules/@img/sharp-linuxmusl-x64',
];

function patchCoverageReporter() {
  if (!fs.existsSync(COVERAGE_REPORTER)) {
    console.warn(`[postinstall] skip missing ${COVERAGE_REPORTER}`);
    return;
  }

  const oldSnippet = '_glob()\n                  .default.sync(absoluteThresholdGroup)';
  const newSnippet = '_glob().glob.sync(absoluteThresholdGroup)';
  const raw = fs.readFileSync(COVERAGE_REPORTER, 'utf8');

  if (raw.includes(newSnippet)) {
    console.log('[postinstall] CoverageReporter already patched');
    return;
  }

  if (!raw.includes(oldSnippet)) {
    console.warn('[postinstall] CoverageReporter patch target not found');
    return;
  }

  fs.writeFileSync(COVERAGE_REPORTER, raw.replace(oldSnippet, newSnippet));
  console.log('[postinstall] Patched CoverageReporter glob interop');
}

function patchSharpLock() {
  const lockPath = path.join(process.cwd(), 'package-lock.json');
  if (!fs.existsSync(lockPath)) {
    console.warn('[postinstall] skip missing package-lock.json');
    return;
  }

  const raw = fs.readFileSync(lockPath);
  const eol = raw.includes(Buffer.from('\r\n')) ? '\r\n' : '\n';
  const data = JSON.parse(raw.toString('utf8'));
  const packages = data.packages || {};

  let changed = false;
  for (const key of SHARP_TARGETS) {
    const pkg = packages[key];
    if (!pkg) {
      continue;
    }
    if (pkg.optional === true) {
      continue;
    }
    pkg.optional = true;
    changed = true;
  }

  if (!changed) {
    console.log('[postinstall] sharp optional flags already present');
    return;
  }

  let out = JSON.stringify(data, null, 2) + '\n';
  if (eol === '\r\n') {
    out = out.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(lockPath, out, 'utf8');
  console.log('[postinstall] Re-applied sharp optional flags');
}

patchCoverageReporter();
patchSharpLock();
