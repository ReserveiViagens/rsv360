#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

function writeTextIfChanged(file, before, after) {
  if (before === after) return false;
  fs.writeFileSync(file, after);
  return true;
}

function patchCoverageReporter(rootDir) {
  const file = path.join(
    rootDir,
    'node_modules',
    '@jest',
    'reporters',
    'build',
    'CoverageReporter.js',
  );
  const source = readText(file);
  if (source == null) return false;

  let next = source;
  next = next.replace(/_glob\(\)\s*\.default\.sync\(/g, '_glob().glob.sync(');
  next = next.replace(/_glob\.default\.sync\(/g, '_glob.glob.sync(');

  return writeTextIfChanged(file, source, next);
}

function patchSharpOptional(rootDir) {
  const file = path.join(rootDir, 'package-lock.json');
  const raw = readText(file);
  if (raw == null) return false;

  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lock = JSON.parse(raw);
  const packages = lock.packages || {};
  const targets = [
    'node_modules/@img/sharp-linux-x64',
    'node_modules/@img/sharp-linuxmusl-x64',
  ];

  let changed = false;
  for (const target of targets) {
    const entry = packages[target];
    if (!entry) continue;
    if (entry.optional === true) continue;
    entry.optional = true;
    changed = true;
  }

  if (!changed) return false;

  const next = JSON.stringify(lock, null, 2).replace(/\n/g, eol) + eol;
  return writeTextIfChanged(file, raw, next);
}

function main() {
  const rootDir = process.cwd();
  const changes = [];

  if (patchCoverageReporter(rootDir)) changes.push('CoverageReporter');
  if (patchSharpOptional(rootDir)) changes.push('sharp-optional');

  if (changes.length === 0) {
    console.log('[postinstall-patches] no-op');
  } else {
    console.log(`[postinstall-patches] updated: ${changes.join(', ')}`);
  }
}

main();
