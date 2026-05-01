import { execFileSync } from 'node:child_process'
import path from 'node:path'

/**
 * Phase 7-G.2 — popula PORTAL_TEST_TOKEN antes do spec.
 * Usa fixture standalone para evitar fragilidade de script inline.
 */
async function globalSetup() {
  const repoRoot = path.resolve(__dirname, '../../../..')
  const bookingCode = process.env.PORTAL_TEST_BOOKING_CODE ?? 'SEED-ACC-001'
  const fixturePath = path.join(repoRoot, 'apps/guest/tests/e2e/fixtures/gen-test-token.mjs')

  try {
    const out = execFileSync('npx', ['tsx', fixturePath, bookingCode], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    })
    const line = out.trim().split('\n').filter(Boolean).pop() ?? ''
    const parsed = JSON.parse(line) as { token?: string }
    const token = parsed.token
    if (!token) throw new Error('fixture não retornou token')
    process.env.PORTAL_TEST_TOKEN = token
    console.log('[7-G.2 global-setup] token gerado para', bookingCode)
  } catch (err: any) {
    console.error('[7-G.2 global-setup] FALHA na geração de token:')
    console.error(err.stdout?.toString?.() ?? '')
    console.error(err.stderr?.toString?.() ?? err.message)
    throw err
  }
}

export default globalSetup
