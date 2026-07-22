/**
 * PR-06a — in-memory rate limit / lockout (pilot login + Next admin when DB store N/A).
 * Fail-closed: always counts; never skips.
 */
const buckets = new Map();

/**
 * @param {string} key
 * @param {{ maxAttempts: number, windowMs: number, blockDurationMs: number }} config
 * @returns {{ allowed: boolean, remainingAttempts: number, blockedUntil?: Date }}
 */
function enforceMemoryRateLimit(key, config) {
  const now = Date.now();
  let entry = buckets.get(key);

  if (!entry) {
    buckets.set(key, { count: 1, windowStart: now, blockedUntil: null });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(entry.blockedUntil),
    };
  }

  if (entry.blockedUntil && entry.blockedUntil <= now) {
    entry = { count: 1, windowStart: now, blockedUntil: null };
    buckets.set(key, entry);
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  if (now - entry.windowStart > config.windowMs) {
    entry = { count: 1, windowStart: now, blockedUntil: null };
    buckets.set(key, entry);
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  if (entry.count >= config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs;
    buckets.set(key, entry);
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(entry.blockedUntil),
    };
  }

  entry.count += 1;
  buckets.set(key, entry);
  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - entry.count,
  };
}

function resetMemoryRateLimit(key) {
  buckets.delete(key);
}

/** Test helper */
function clearMemoryRateLimitStore() {
  buckets.clear();
}

module.exports = {
  enforceMemoryRateLimit,
  resetMemoryRateLimit,
  clearMemoryRateLimitStore,
};
