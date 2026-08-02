/**
 * PR-10b — step-up on new IP/UA (1B + 2B-lite).
 * Flag AUTH_STEP_UP_ENABLED default OFF — off = zero behavior change.
 */
const { queryDatabase, isDbRefreshEnabled } = require('./refresh-token.service');

function isStepUpEnabled() {
  return String(process.env.AUTH_STEP_UP_ENABLED || '').toLowerCase() === 'true';
}

/**
 * Active (non-revoked, non-expired) fingerprints for user.
 * @returns {Promise<Array<{ ip_address: string|null, user_agent: string|null }>>}
 */
async function loadActiveFingerprints(userId) {
  if (!isDbRefreshEnabled() || userId == null) return [];
  const rows = await queryDatabase(
    `SELECT ip_address, user_agent FROM refresh_tokens
     WHERE user_id = $1
       AND revoked_at IS NULL
       AND expires_at > CURRENT_TIMESTAMP`,
    [userId]
  );
  return Array.isArray(rows) ? rows : [];
}

function normalizeIp(ip) {
  const s = String(ip || '').trim();
  return s || null;
}

function normalizeUa(ua) {
  const s = String(ua || '').trim();
  return s || null;
}

function ipKnown(ip, fingerprints) {
  if (!ip) return false;
  return fingerprints.some((row) => normalizeIp(row.ip_address) === ip);
}

function uaKnown(ua, fingerprints) {
  if (!ua) return false;
  return fingerprints.some((row) => normalizeUa(row.user_agent) === ua);
}

/**
 * 1B — known if any active session shares IP OR UA.
 * No active sessions → known (first session / no ping-pong).
 */
function isKnownClient(ipAddress, userAgent, fingerprints) {
  if (!fingerprints || fingerprints.length === 0) return true;
  const ip = normalizeIp(ipAddress);
  const ua = normalizeUa(userAgent);
  return ipKnown(ip, fingerprints) || uaKnown(ua, fingerprints);
}

/**
 * 2B-lite refresh — alien only when BOTH IP and UA are unknown.
 */
function isAlienClient(ipAddress, userAgent, fingerprints) {
  if (!fingerprints || fingerprints.length === 0) return false;
  const ip = normalizeIp(ipAddress);
  const ua = normalizeUa(userAgent);
  return !ipKnown(ip, fingerprints) && !uaKnown(ua, fingerprints);
}

function stepUpReasons(ipAddress, userAgent, fingerprints) {
  const ip = normalizeIp(ipAddress);
  const ua = normalizeUa(userAgent);
  const parts = [];
  if (ip && !ipKnown(ip, fingerprints)) parts.push('new_ip');
  if (ua && !uaKnown(ua, fingerprints)) parts.push('new_ua');
  if (parts.length === 0) parts.push('new_device');
  return parts.join('|');
}

function logStepUp(userId, reason) {
  console.log(`[AUTH][STEP_UP] userId=${userId} reason=${reason}`);
}

function logStepUpSkip(userId, reason) {
  console.log(`[AUTH][STEP_UP_SKIP] userId=${userId} reason=${reason}`);
}

module.exports = {
  isStepUpEnabled,
  loadActiveFingerprints,
  isKnownClient,
  isAlienClient,
  stepUpReasons,
  logStepUp,
  logStepUpSkip,
  normalizeIp,
  normalizeUa,
};
