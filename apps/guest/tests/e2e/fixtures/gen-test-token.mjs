#!/usr/bin/env node
// Phase 7-G.2 — gera token de portal para o booking de teste.
// Standalone fixture. Roda via: npx tsx <this file> SEED-ACC-001
// Lições aplicadas: 40, 41, 42, 43.

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..', '..')
const bookingCode = process.argv[2] ?? 'SEED-ACC-001'

function logErr(...args) {
  process.stderr.write('[gen-test-token] ' + args.join(' ') + '\n')
}

function resolveOrFail(relativePath, alternatives = []) {
  const primary = path.resolve(repoRoot, relativePath)
  if (fs.existsSync(primary)) return primary
  for (const alt of alternatives) {
    const candidate = path.resolve(repoRoot, alt)
    if (fs.existsSync(candidate)) return candidate
  }
  throw new Error(
    `arquivo não encontrado:\n  primary: ${primary}\n  alts: ${alternatives.map((a) => path.resolve(repoRoot, a)).join(', ')}`,
  )
}

function pickExport(mod, name) {
  const candidates = [mod?.[name], mod?.default?.[name], mod?.default]
  return candidates.find((candidate) => candidate != null)
}

async function main() {
  logErr(`repoRoot=${repoRoot}`)
  logErr(`cwd=${process.cwd()}`)
  logErr(`bookingCode=${bookingCode}`)

  const tokenServicePath = resolveOrFail(
    'server/modules/guest-portal/services/token.service.ts',
  )
  const portalRepoPath = resolveOrFail(
    'server/modules/guest-portal/db/portal.repository.ts',
  )

  logErr(`tokenService: ${tokenServicePath}`)
  logErr(`portalRepository: ${portalRepoPath}`)

  const tokenMod = await import(pathToFileURL(tokenServicePath).href)
  const repoMod = await import(pathToFileURL(portalRepoPath).href)

  logErr(`tokenMod keys: ${Object.keys(tokenMod).join(', ') || '<empty>'}`)
  if (tokenMod.default) {
    logErr(`tokenMod.default keys: ${Object.keys(tokenMod.default).join(', ') || '<value>'}`)
  }
  logErr(`repoMod keys: ${Object.keys(repoMod).join(', ') || '<empty>'}`)
  if (repoMod.default) {
    logErr(`repoMod.default keys: ${Object.keys(repoMod.default).join(', ') || '<value>'}`)
  }

  const tokenService = pickExport(tokenMod, 'tokenService')
  const portalRepository = pickExport(repoMod, 'portalRepository')

  if (!tokenService) {
    throw new Error(
      `tokenService undefined — keys: ${Object.keys(tokenMod).join(', ')}; default: ${
        tokenMod.default ? Object.keys(tokenMod.default).join(',') : 'absent'
      }`,
    )
  }
  if (!portalRepository) {
    throw new Error(
      `portalRepository undefined — keys: ${Object.keys(repoMod).join(', ')}; default: ${
        repoMod.default ? Object.keys(repoMod.default).join(',') : 'absent'
      }`,
    )
  }

  logErr(`tokenService methods: ${Object.keys(tokenService).join(', ') || '<class>'}`)
  logErr(`portalRepository methods: ${Object.keys(portalRepository).join(', ') || '<class>'}`)

  let bookingId
  if (typeof portalRepository.getBookingByCode === 'function') {
    const booking = await portalRepository.getBookingByCode(bookingCode)
    bookingId = booking?.id
  } else if (typeof portalRepository.findBookingByCode === 'function') {
    const booking = await portalRepository.findBookingByCode(bookingCode)
    bookingId = booking?.id
  } else {
    const bookingTable = await portalRepository.getBookingTable?.()
    if (!bookingTable) {
      throw new Error('Nenhuma tabela de bookings/reservations encontrada')
    }
    const columns = await portalRepository.getColumns(bookingTable)
    const codeColumn = columns.includes('booking_code')
      ? 'booking_code'
      : columns.includes('bookingCode')
        ? 'bookingCode'
        : columns.includes('code')
          ? 'code'
          : null
    if (!codeColumn) {
      throw new Error(`Tabela ${bookingTable} sem coluna de booking_code`)
    }
    const result = await portalRepository.query(
      `select * from "${bookingTable.replace(/"/g, '""')}" where "${codeColumn}" = $1 limit 1`,
      [bookingCode],
    )
    const booking = result.rows?.[0] ?? null
    if (!booking) {
      throw new Error(`booking não encontrado para bookingCode=${bookingCode}`)
    }
    bookingId = booking.id ?? booking.booking_id ?? booking.bookingId ?? booking.reservation_id ?? booking.reservationId
  }

  if (!bookingId) {
    throw new Error(`booking não encontrado para bookingCode=${bookingCode}`)
  }
  logErr(`bookingId resolved: ${bookingId}`)

  const result = await tokenService.generateToken(bookingId)
  const token = typeof result === 'string' ? result : result?.token
  if (!token) throw new Error('tokenService.generateToken retornou vazio')

  process.stdout.write(JSON.stringify({ token }) + '\n')
}

main().catch((err) => {
  logErr(`FALHA: ${err.stack ?? err.message}`)
  process.exit(1)
})
