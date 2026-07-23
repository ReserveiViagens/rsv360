/**
 * PR-06c — per-account consecutive failures, Turnstile gate, progressive lockout.
 *
 * Rules (when AUTH_LOGIN_PROTECTION_ENABLED=true):
 * - Count failures PER ACCOUNT (email/account_key), TTL window, reset on success.
 * - 3rd consecutive failure → Turnstile required.
 * - 5th → progressive lockout 15 → 30 → 60 min (cap); escalation resets after
 *   successful login OR 24h without failures.
 * - During active lockout, even correct password is denied.
 */

const { queryDatabase, isDbRefreshEnabled } = require('./refresh-token.service');
const { isLoginProtectionEnabled, isLoginTurnstileFailClosed } = require('./mfa-policy');

const FAILURE_TTL_MS = Number(process.env.AUTH_LOGIN_FAILURE_TTL_MS) || 24 * 60 * 60 * 1000;
const LOCKOUT_DURATIONS_MS = [15 * 60 * 1000, 30 * 60 * 1000, 60 * 60 * 1000];
const TURNSTILE_AFTER = 3;
const LOCKOUT_AFTER = 5;

/** @type {Map<string, { consecutiveFailures: number, lockoutLevel: number, blockedUntil: number|null, lastFailureAt: number|null }>} */
const memoryStore = new Map();

function normalizeAccountKey(accountKey) {
  return String(accountKey || '').trim().toLowerCase() || 'unknown';
}

function emptyState() {
  return {
    consecutiveFailures: 0,
    lockoutLevel: 0,
    blockedUntil: null,
    lastFailureAt: null,
  };
}

function clearMemoryLoginProtectionStore() {
  memoryStore.clear();
}

/** Test helper — expire active lockout without resetting escalation level. */
function forceExpireLockoutForTests(accountKey) {
  const key = normalizeAccountKey(accountKey);
  const state = memoryStore.get(key);
  if (!state) return;
  memoryStore.set(key, {
    consecutiveFailures: 0,
    lockoutLevel: state.lockoutLevel,
    blockedUntil: null,
    lastFailureAt: state.lastFailureAt,
  });
}

function readMemory(key) {
  return memoryStore.get(key) || emptyState();
}

function writeMemory(key, state) {
  memoryStore.set(key, { ...state });
}

async function readDb(key) {
  const rows = await queryDatabase(
    `SELECT consecutive_failures, lockout_level, blocked_until, last_failure_at
     FROM auth_login_protection WHERE account_key = $1 LIMIT 1`,
    [key]
  );
  if (rows == null) return { storeUnavailable: true };
  if (!rows.length) return emptyState();
  const row = rows[0];
  return {
    consecutiveFailures: Number(row.consecutive_failures) || 0,
    lockoutLevel: Number(row.lockout_level) || 0,
    blockedUntil: row.blocked_until ? new Date(row.blocked_until).getTime() : null,
    lastFailureAt: row.last_failure_at ? new Date(row.last_failure_at).getTime() : null,
  };
}

async function writeDb(key, state) {
  await queryDatabase(
    `INSERT INTO auth_login_protection
       (account_key, consecutive_failures, lockout_level, blocked_until, last_failure_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     ON CONFLICT (account_key) DO UPDATE SET
       consecutive_failures = EXCLUDED.consecutive_failures,
       lockout_level = EXCLUDED.lockout_level,
       blocked_until = EXCLUDED.blocked_until,
       last_failure_at = EXCLUDED.last_failure_at,
       updated_at = CURRENT_TIMESTAMP`,
    [
      key,
      state.consecutiveFailures,
      state.lockoutLevel,
      state.blockedUntil ? new Date(state.blockedUntil).toISOString() : null,
      state.lastFailureAt ? new Date(state.lastFailureAt).toISOString() : null,
    ]
  );
}

async function loadState(key) {
  if (isDbRefreshEnabled()) {
    try {
      const state = await readDb(key);
      if (state.storeUnavailable) {
        return { ...readMemory(key), storeUnavailable: true };
      }
      return state;
    } catch (error) {
      console.error('[AUTH] login-protection read error:', error.message);
      return { ...readMemory(key), storeUnavailable: true };
    }
  }
  return readMemory(key);
}

async function saveState(key, state) {
  writeMemory(key, state);
  if (!isDbRefreshEnabled()) return;
  try {
    await writeDb(key, state);
  } catch (error) {
    console.error('[AUTH] login-protection write error:', error.message);
  }
}

function applyTtl(state, now) {
  if (!state.lastFailureAt) return state;
  if (now - state.lastFailureAt > FAILURE_TTL_MS) {
    return emptyState();
  }
  return state;
}

/**
 * Pre-auth gate: lockout + whether Turnstile is required.
 * @returns {Promise<{
 *   allowed: boolean,
 *   turnstileRequired: boolean,
 *   blockedUntil?: Date,
 *   consecutiveFailures: number,
 *   storeUnavailable?: boolean,
 * }>}
 */
async function evaluateLoginProtection(accountKey) {
  if (!isLoginProtectionEnabled()) {
    return { allowed: true, turnstileRequired: false, consecutiveFailures: 0 };
  }

  const key = normalizeAccountKey(accountKey);
  const now = Date.now();
  let state = applyTtl(await loadState(key), now);

  if (state.blockedUntil && state.blockedUntil > now) {
    return {
      allowed: false,
      turnstileRequired: state.consecutiveFailures >= TURNSTILE_AFTER,
      blockedUntil: new Date(state.blockedUntil),
      consecutiveFailures: state.consecutiveFailures,
      storeUnavailable: state.storeUnavailable,
    };
  }

  if (state.blockedUntil && state.blockedUntil <= now) {
    // Lockout elapsed: keep escalation level, require a fresh streak of failures.
    state = {
      consecutiveFailures: 0,
      lockoutLevel: state.lockoutLevel,
      blockedUntil: null,
      lastFailureAt: state.lastFailureAt,
    };
    await saveState(key, state);
  }

  return {
    allowed: true,
    turnstileRequired: state.consecutiveFailures >= TURNSTILE_AFTER,
    consecutiveFailures: state.consecutiveFailures,
    storeUnavailable: state.storeUnavailable,
  };
}

/**
 * Record a failed auth attempt for the account (password / turnstile / etc.).
 */
async function recordAccountFailure(accountKey) {
  if (!isLoginProtectionEnabled()) {
    return { consecutiveFailures: 0, turnstileRequired: false, locked: false };
  }

  const key = normalizeAccountKey(accountKey);
  const now = Date.now();
  let state = applyTtl(await loadState(key), now);

  const consecutiveFailures = state.consecutiveFailures + 1;
  let lockoutLevel = state.lockoutLevel;
  let blockedUntil = state.blockedUntil && state.blockedUntil > now ? state.blockedUntil : null;

  if (consecutiveFailures >= LOCKOUT_AFTER) {
    const alreadyBlocked = blockedUntil && blockedUntil > now;
    if (!alreadyBlocked) {
      const levelIndex = Math.min(lockoutLevel, LOCKOUT_DURATIONS_MS.length - 1);
      blockedUntil = now + LOCKOUT_DURATIONS_MS[levelIndex];
      lockoutLevel = Math.min(lockoutLevel + 1, LOCKOUT_DURATIONS_MS.length);
    }
  }

  state = {
    consecutiveFailures,
    lockoutLevel,
    blockedUntil,
    lastFailureAt: now,
  };
  await saveState(key, state);

  return {
    consecutiveFailures,
    turnstileRequired: consecutiveFailures >= TURNSTILE_AFTER,
    locked: Boolean(blockedUntil && blockedUntil > now),
    blockedUntil: blockedUntil ? new Date(blockedUntil) : undefined,
  };
}

async function resetAccountProtection(accountKey) {
  if (!isLoginProtectionEnabled()) return;
  const key = normalizeAccountKey(accountKey);
  const cleared = emptyState();
  await saveState(key, cleared);
  memoryStore.delete(key);
  if (isDbRefreshEnabled()) {
    try {
      await queryDatabase(`DELETE FROM auth_login_protection WHERE account_key = $1`, [key]);
    } catch (error) {
      console.error('[AUTH] login-protection reset error:', error.message);
    }
  }
}

/**
 * Administrative unlock (never public UI). Audited by caller.
 */
async function adminUnlockAccount(accountKey) {
  await resetAccountProtection(accountKey);
  return { unlocked: true, accountKey: normalizeAccountKey(accountKey) };
}

async function verifyLoginTurnstile(token, remoteIp) {
  const { verificarTurnstile } = require('../../../../../server/lib/turnstile');
  return verificarTurnstile(token, remoteIp, {
    failClosed: isLoginTurnstileFailClosed(),
  });
}

module.exports = {
  FAILURE_TTL_MS,
  LOCKOUT_DURATIONS_MS,
  TURNSTILE_AFTER,
  LOCKOUT_AFTER,
  evaluateLoginProtection,
  recordAccountFailure,
  resetAccountProtection,
  adminUnlockAccount,
  verifyLoginTurnstile,
  clearMemoryLoginProtectionStore,
  forceExpireLockoutForTests,
  normalizeAccountKey,
  isLoginProtectionEnabled,
};
