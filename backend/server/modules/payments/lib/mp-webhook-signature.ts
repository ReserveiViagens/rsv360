/**
 * Re-export shared MP webhook HMAC (single source of truth with site-publico).
 * Kept at this path so existing backend imports continue to resolve.
 */
export {
  MP_WEBHOOK_TS_TOLERANCE_MS,
  MpWebhookAuthError,
  normalizeMpDataId,
  parseMpXSignature,
  buildMpWebhookManifest,
  timingSafeEqualHex,
  isMpTimestampWithinWindow,
  verifyMercadoPagoWebhookSignature,
} from '@rsv360/shared';
export type { MpWebhookVerifyInput } from '@rsv360/shared';
