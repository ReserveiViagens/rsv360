/**
 * PR-06c — per-account login protection (Next admin surface).
 * Mirrors backend/src/api/v1/auth/login-protection.service.js constants/behavior.
 */

export const FAILURE_TTL_MS = Number(process.env.AUTH_LOGIN_FAILURE_TTL_MS) || 24 * 60 * 60 * 1000
export const LOCKOUT_DURATIONS_MS = [15 * 60 * 1000, 30 * 60 * 1000, 60 * 60 * 1000] as const
export const TURNSTILE_AFTER = 3
export const LOCKOUT_AFTER = 5

type ProtectionState = {
  consecutiveFailures: number
  lockoutLevel: number
  blockedUntil: number | null
  lastFailureAt: number | null
}

const memoryStore = new Map<string, ProtectionState>()

function envFlagTrue(name: string): boolean {
  return String(process.env[name] || '').toLowerCase() === 'true'
}

export function isLoginProtectionEnabled(): boolean {
  return envFlagTrue('AUTH_LOGIN_PROTECTION_ENABLED')
}

export function isMfaEnforceEnabled(): boolean {
  return envFlagTrue('AUTH_MFA_ENFORCE')
}

export function normalizeAccountKey(accountKey: string): string {
  return String(accountKey || '').trim().toLowerCase() || 'unknown'
}

function emptyState(): ProtectionState {
  return {
    consecutiveFailures: 0,
    lockoutLevel: 0,
    blockedUntil: null,
    lastFailureAt: null,
  }
}

export function clearAdminLoginProtectionStoreForTests(): void {
  memoryStore.clear()
}

function applyTtl(state: ProtectionState, now: number): ProtectionState {
  if (!state.lastFailureAt) return state
  if (now - state.lastFailureAt > FAILURE_TTL_MS) return emptyState()
  return state
}

export function evaluateAdminLoginProtection(accountKey: string): {
  allowed: boolean
  turnstileRequired: boolean
  blockedUntil?: Date
  consecutiveFailures: number
} {
  if (!isLoginProtectionEnabled()) {
    return { allowed: true, turnstileRequired: false, consecutiveFailures: 0 }
  }

  const key = normalizeAccountKey(accountKey)
  const now = Date.now()
  let state = applyTtl(memoryStore.get(key) || emptyState(), now)

  if (state.blockedUntil && state.blockedUntil > now) {
    return {
      allowed: false,
      turnstileRequired: state.consecutiveFailures >= TURNSTILE_AFTER,
      blockedUntil: new Date(state.blockedUntil),
      consecutiveFailures: state.consecutiveFailures,
    }
  }

  if (state.blockedUntil && state.blockedUntil <= now) {
    state = {
      consecutiveFailures: 0,
      lockoutLevel: state.lockoutLevel,
      blockedUntil: null,
      lastFailureAt: state.lastFailureAt,
    }
    memoryStore.set(key, state)
  }

  return {
    allowed: true,
    turnstileRequired: state.consecutiveFailures >= TURNSTILE_AFTER,
    consecutiveFailures: state.consecutiveFailures,
  }
}

export function recordAdminAccountFailure(accountKey: string): {
  consecutiveFailures: number
  turnstileRequired: boolean
  locked: boolean
  blockedUntil?: Date
} {
  if (!isLoginProtectionEnabled()) {
    return { consecutiveFailures: 0, turnstileRequired: false, locked: false }
  }

  const key = normalizeAccountKey(accountKey)
  const now = Date.now()
  let state = applyTtl(memoryStore.get(key) || emptyState(), now)

  if (state.blockedUntil && state.blockedUntil <= now) {
    state = {
      consecutiveFailures: 0,
      lockoutLevel: state.lockoutLevel,
      blockedUntil: null,
      lastFailureAt: state.lastFailureAt,
    }
  }

  const consecutiveFailures = state.consecutiveFailures + 1
  let lockoutLevel = state.lockoutLevel
  let blockedUntil = state.blockedUntil && state.blockedUntil > now ? state.blockedUntil : null

  if (consecutiveFailures >= LOCKOUT_AFTER) {
    const alreadyBlocked = Boolean(blockedUntil && blockedUntil > now)
    if (!alreadyBlocked) {
      const levelIndex = Math.min(lockoutLevel, LOCKOUT_DURATIONS_MS.length - 1)
      blockedUntil = now + LOCKOUT_DURATIONS_MS[levelIndex]
      lockoutLevel = Math.min(lockoutLevel + 1, LOCKOUT_DURATIONS_MS.length)
    }
  }

  state = {
    consecutiveFailures,
    lockoutLevel,
    blockedUntil,
    lastFailureAt: now,
  }
  memoryStore.set(key, state)

  return {
    consecutiveFailures,
    turnstileRequired: consecutiveFailures >= TURNSTILE_AFTER,
    locked: Boolean(blockedUntil && blockedUntil > now),
    blockedUntil: blockedUntil ? new Date(blockedUntil) : undefined,
  }
}

export function resetAdminAccountProtection(accountKey: string): void {
  memoryStore.delete(normalizeAccountKey(accountKey))
}

export async function verifyAdminLoginTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const failClosed =
    envFlagTrue('AUTH_LOGIN_TURNSTILE_FAIL_CLOSED') || isLoginProtectionEnabled()

  if (!secret) {
    if (failClosed || process.env.NODE_ENV === 'production') {
      return { ok: false, error: 'Turnstile não configurado no servidor' }
    }
    return { ok: true }
  }

  if (!token || token.trim().length < 10) {
    return { ok: false, error: 'Token Turnstile ausente ou inválido' }
  }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const json = (await res.json().catch(() => ({}))) as { success?: boolean }
  if (!json.success) return { ok: false, error: 'verificação falhou' }
  return { ok: true }
}
