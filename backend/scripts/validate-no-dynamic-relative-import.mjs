#!/usr/bin/env node
/**
 * Guard: dynamic import() with relative paths breaks in Docker prod (tsx + node server.js).
 * Incidents: objecao (a2536a42), proposta-publica-payload + aplicar-validade (#55).
 *
 * Run from backend/: npm run validate:no-dynamic-relative-import
 */
import fs from 'node:fs'
import path from 'node:path'

const REPO_ROOT = path.resolve(process.cwd(), '..')
const SCAN_ROOTS = ['server', path.join('backend', 'src')]

/** CLI smoke/seed scripts — 7 legitimate dynamic import() hits (not Docker runtime). */
const ALLOWLIST_FILES = new Set([
  'server/scripts/smoke-aprovacao.ts',
  'server/scripts/smoke-redis-cutover.ts',
  'server/scripts/smoke-e2e-cotacao.ts',
  'server/scripts/seed-demo-proposta-local.ts',
])

const SKIP_DIR_NAMES = new Set(['__tests__', 'test', 'node_modules', 'dist'])
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs'])

/** Dynamic import of a relative module (./ or ../). Excludes `typeof import` type queries. */
const DYNAMIC_RELATIVE_IMPORT = /\bimport\s*\(\s*['"](\.\.?\/)/

function posixRel(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/')
}

function shouldSkipDir(dirName) {
  return SKIP_DIR_NAMES.has(dirName)
}

function shouldSkipFile(relPosix) {
  if (ALLOWLIST_FILES.has(relPosix)) return true
  if (relPosix.includes('/__tests__/')) return true
  if (relPosix.endsWith('.test.ts') || relPosix.endsWith('.test.tsx')) return true
  if (relPosix.endsWith('.spec.ts') || relPosix.endsWith('.spec.tsx')) return true
  return false
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue
      walk(full, files)
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full)
    }
  }
  return files
}

function findViolations() {
  const violations = []
  for (const root of SCAN_ROOTS) {
    const absRoot = path.join(REPO_ROOT, root)
    for (const file of walk(absRoot)) {
      const rel = posixRel(file)
      if (shouldSkipFile(rel)) continue

      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
      lines.forEach((line, index) => {
        if (line.includes('typeof import')) return
        const match = line.match(DYNAMIC_RELATIVE_IMPORT)
        if (match) {
          violations.push({ file: rel, line: index + 1, snippet: line.trim() })
        }
      })
    }
  }
  return violations
}

const violations = findViolations()

if (violations.length) {
  console.error('❌ Dynamic relative import() in server runtime (use static import or require):')
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.snippet}`)
  }
  console.error(
    '\nDocker prod (tsx) cannot resolve import("./module") at runtime. See a2536a42 / PR #55.',
  )
  process.exit(1)
}

console.log(
  '✅ No dynamic relative import() in server runtime (allowlist: 4 CLI scripts, tests excluded)',
)
