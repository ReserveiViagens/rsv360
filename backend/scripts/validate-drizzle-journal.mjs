#!/usr/bin/env node
// Phase 7-I.3 — valida consistência entre drizzle/*.sql, _journal.json e meta/*_snapshot.json
// Roda a partir do diretório `backend/` (npm script faz cd).
import fs from 'node:fs'
import path from 'node:path'

const DRIZZLE_DIR = path.join(process.cwd(), 'drizzle')
const META_DIR = path.join(DRIZZLE_DIR, 'meta')
const JOURNAL_PATH = path.join(META_DIR, '_journal.json')

if (!fs.existsSync(JOURNAL_PATH)) {
  console.error('❌ _journal.json missing at', JOURNAL_PATH)
  process.exit(1)
}

const journal = JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf-8'))
const entries = journal.entries || []
const journalTags = new Set(entries.map(e => e.tag))

const sqlFiles = fs.readdirSync(DRIZZLE_DIR)
  .filter(f => f.endsWith('.sql'))
  .map(f => f.replace(/\.sql$/, ''))

const snapshotFiles = fs.readdirSync(META_DIR)
  .filter(f => f.endsWith('.json') && f !== '_journal.json')
  .map(f => f.replace(/\.json$/, ''))

const orphanSql = sqlFiles.filter(f => !journalTags.has(f))
const missingSql = [...journalTags].filter(t => !sqlFiles.includes(t))

// Snapshots seguem padrão "<idx zero-padded 4>_snapshot"
const expectedSnapshots = entries.map(e => `${String(e.idx).padStart(4, '0')}_snapshot`)
const orphanSnapshots = snapshotFiles.filter(s => !expectedSnapshots.includes(s))
const missingSnapshots = expectedSnapshots.filter(s => !snapshotFiles.includes(s))

const errors = []
if (orphanSql.length) errors.push(`Orphan SQL (no journal entry): ${orphanSql.join(', ')}`)
if (missingSql.length) errors.push(`Missing SQL (in journal but not on disk): ${missingSql.join(', ')}`)
if (orphanSnapshots.length) errors.push(`Orphan snapshots: ${orphanSnapshots.join(', ')}`)
if (missingSnapshots.length) errors.push(`Missing snapshots: ${missingSnapshots.join(', ')}`)

if (errors.length) {
  console.error('❌ Drizzle journal inconsistency detected:')
  for (const e of errors) console.error('  • ' + e)
  process.exit(1)
}
console.log(`✅ Drizzle journal consistent: ${entries.length} migrations, ${snapshotFiles.length} snapshots`)
