const { queryDatabase, isDbRefreshEnabled } = require('./refresh-token.service');

const isDev = process.env.NODE_ENV !== 'production';

const RATE_LIMIT_CONFIGS = {
  login: isDev
    ? { maxAttempts: 50, windowMs: 15 * 60 * 1000, blockDurationMs: 60 * 1000 }
    : { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
  refresh: { maxAttempts: 10, windowMs: 60 * 1000, blockDurationMs: 5 * 60 * 1000 },
};

function isRateLimitEnabled() {
  return isDbRefreshEnabled();
}

async function checkRateLimit(identifier, identifierType, action) {
  if (!isRateLimitEnabled()) {
    return { allowed: true, remainingAttempts: 999 };
  }

  const config = RATE_LIMIT_CONFIGS[action] || {
    maxAttempts: 10,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000,
  };

  const rateLimits = await queryDatabase(
    `SELECT * FROM auth_rate_limits
     WHERE identifier = $1 AND identifier_type = $2 AND action = $3`,
    [identifier, identifierType, action]
  );

  const now = new Date();

  if (!rateLimits || rateLimits.length === 0) {
    await queryDatabase(
      `INSERT INTO auth_rate_limits (identifier, identifier_type, action, attempt_count, last_attempt_at)
       VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)`,
      [identifier, identifierType, action]
    );
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  const rateLimit = rateLimits[0];
  const lastAttempt = new Date(rateLimit.last_attempt_at);
  const windowStart = new Date(now.getTime() - config.windowMs);

  if (rateLimit.blocked_until) {
    const blockedUntil = new Date(rateLimit.blocked_until);
    if (blockedUntil > now) {
      return { allowed: false, remainingAttempts: 0, blockedUntil };
    }
    await queryDatabase(
      `UPDATE auth_rate_limits
       SET attempt_count = 1, last_attempt_at = CURRENT_TIMESTAMP, blocked_until = NULL
       WHERE id = $1`,
      [rateLimit.id]
    );
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  if (lastAttempt < windowStart) {
    await queryDatabase(
      `UPDATE auth_rate_limits
       SET attempt_count = 1, last_attempt_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [rateLimit.id]
    );
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  if (rateLimit.attempt_count >= config.maxAttempts) {
    const blockedUntil = new Date(now.getTime() + config.blockDurationMs);
    await queryDatabase(
      `UPDATE auth_rate_limits SET blocked_until = $1 WHERE id = $2`,
      [blockedUntil.toISOString(), rateLimit.id]
    );
    return { allowed: false, remainingAttempts: 0, blockedUntil };
  }

  await queryDatabase(
    `UPDATE auth_rate_limits
     SET attempt_count = attempt_count + 1, last_attempt_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [rateLimit.id]
  );

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - rateLimit.attempt_count - 1,
  };
}

async function resetRateLimit(identifier, identifierType, action) {
  if (!isRateLimitEnabled()) return;
  await queryDatabase(
    `DELETE FROM auth_rate_limits
     WHERE identifier = $1 AND identifier_type = $2 AND action = $3`,
    [identifier, identifierType, action]
  );
}

async function recordLoginAttempt(email, ipAddress, userAgent, success, failureReason) {
  if (!isRateLimitEnabled()) return;
  await queryDatabase(
    `INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason)
     VALUES ($1, $2, $3, $4, $5)`,
    [email, ipAddress, userAgent || null, success, failureReason || null]
  );
}

async function enforceLoginRateLimit(email, ipAddress) {
  const ipCheck = await checkRateLimit(ipAddress || 'unknown', 'ip', 'login');
  if (!ipCheck.allowed) return ipCheck;
  return checkRateLimit(email.toLowerCase(), 'email', 'login');
}

async function resetLoginRateLimit(email, ipAddress) {
  await resetRateLimit(ipAddress || 'unknown', 'ip', 'login');
  await resetRateLimit(email.toLowerCase(), 'email', 'login');
}

function getClientIp(req) {
  return (req.header('x-forwarded-for') || '').split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

module.exports = {
  isRateLimitEnabled,
  checkRateLimit,
  enforceLoginRateLimit,
  resetLoginRateLimit,
  recordLoginAttempt,
  getClientIp,
};
