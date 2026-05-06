import { buildPortalAuthAuditRow } from '../../../../server/modules/guest-portal/services/audit.service';

describe('buildPortalAuthAuditRow', () => {
  it('hashes token, keeps only last4 and truncates user agent', () => {
    const row = buildPortalAuthAuditRow({
      event: 'token_invalid',
      token: 'portal_token_example_123456',
      bookingRef: 42,
      ipAddress: '203.0.113.10',
      userAgent: 'a'.repeat(600),
      requestPath: '/reservations',
      reason: 'invalid_token',
      createdAt: new Date('2026-05-06T00:00:00.000Z'),
    });

    expect(row.event).toBe('token_invalid');
    expect(row.token_hash).toHaveLength(64);
    expect(row.token_hash).not.toContain('portal_token_example_123456');
    expect(row.token_last4).toBe('3456');
    expect(row.booking_ref).toBe('42');
    expect(row.ip_address).toBe('203.0.113.10');
    expect(row.user_agent).toHaveLength(512);
    expect(row.request_path).toBe('/reservations');
    expect(row.reason).toBe('invalid_token');
    expect(row.created_at.toISOString()).toBe('2026-05-06T00:00:00.000Z');
  });

  it('keeps token fields null for missing token events', () => {
    const row = buildPortalAuthAuditRow({
      event: 'token_missing',
      requestPath: '/checkin',
      reason: 'missing_cookie',
    });

    expect(row.token_hash).toBeNull();
    expect(row.token_last4).toBeNull();
    expect(row.booking_ref).toBeNull();
    expect(row.request_path).toBe('/checkin');
    expect(row.reason).toBe('missing_cookie');
  });
});
