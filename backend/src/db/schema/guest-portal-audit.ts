import { index, inet, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const guestPortalAuthEvent = pgEnum('guest_portal_auth_event', [
  'token_valid',
  'token_invalid',
  'token_expired',
  'token_revoked',
  'token_missing',
]);

export const guestPortalAudit = pgTable(
  'guest_portal_audit',
  {
    id: serial('id').primaryKey(),
    event: guestPortalAuthEvent('event').notNull(),
    tokenHash: text('token_hash'),
    tokenLast4: text('token_last4'),
    bookingRef: text('booking_ref'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    requestPath: text('request_path'),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    createdAtIdx: index('guest_portal_audit_created_at_idx').on(table.createdAt),
    eventCreatedAtIdx: index('guest_portal_audit_event_created_at_idx').on(table.event, table.createdAt),
    bookingRefIdx: index('guest_portal_audit_booking_ref_idx').on(table.bookingRef),
  }),
);

export type GuestPortalAudit = typeof guestPortalAudit.$inferSelect;
export type NewGuestPortalAudit = typeof guestPortalAudit.$inferInsert;
