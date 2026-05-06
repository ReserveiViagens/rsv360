import crypto from 'node:crypto';
import { isIP } from 'node:net';
import { portalRepository } from '../db/portal.repository';

export type PortalAuthAuditEvent =
  | 'token_valid'
  | 'token_invalid'
  | 'token_expired'
  | 'token_revoked'
  | 'token_missing';

export type PortalAuthAuditInput = {
  event: PortalAuthAuditEvent;
  token?: string | null;
  bookingRef?: string | number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestPath?: string | null;
  reason?: string | null;
  createdAt?: Date;
};

export type PortalAuthAuditRow = {
  event: PortalAuthAuditEvent;
  token_hash: string | null;
  token_last4: string | null;
  booking_ref: string | null;
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  reason: string | null;
  created_at: Date;
};

function normalizeString(value: string | number | null | undefined, maxLength = 1024) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
}

function normalizeIp(value: string | null | undefined) {
  const text = normalizeString(value, 128);
  if (!text) {
    return null;
  }

  const candidate = text.split(',')[0]?.trim() || text;
  return isIP(candidate) ? candidate : null;
}

function hashToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  return crypto.createHash('sha256').update(token).digest('hex');
}

export function buildPortalAuthAuditRow(input: PortalAuthAuditInput): PortalAuthAuditRow {
  const token = normalizeString(input.token, 4096);

  return {
    event: input.event,
    token_hash: hashToken(token || undefined),
    token_last4: token ? token.slice(-4) : null,
    booking_ref: normalizeString(input.bookingRef, 128),
    ip_address: normalizeIp(input.ipAddress),
    user_agent: normalizeString(input.userAgent, 512),
    request_path: normalizeString(input.requestPath, 2048),
    reason: normalizeString(input.reason, 1024),
    created_at: input.createdAt ?? new Date(),
  };
}

export class GuestPortalAuditService {
  constructor(private repository = portalRepository) {}

  async recordAuthEvent(input: PortalAuthAuditInput) {
    try {
      const row = buildPortalAuthAuditRow(input);
      return await this.repository.recordGuestPortalAudit(row);
    } catch (error) {
      console.warn('[guest-portal] audit write failed:', (error as Error).message);
      return null;
    }
  }
}

export const guestPortalAuditService = new GuestPortalAuditService();

module.exports = {
  GuestPortalAuditService,
  guestPortalAuditService,
  buildPortalAuthAuditRow,
};
