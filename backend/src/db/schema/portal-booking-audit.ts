import { pgTable, serial, integer, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { bookings } from './bookings';

export const portalBookingAudit = pgTable(
  'portal_booking_audit',
  {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    tokenId: text('token_id').notNull(),
    action: text('action').notNull(),
    fieldsChanged: jsonb('fields_changed').notNull().$type<string[]>(),
    beforePayload: jsonb('before_payload'),
    afterPayload: jsonb('after_payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    bookingIdx: index('portal_booking_audit_booking_idx').on(table.bookingId),
    createdAtIdx: index('portal_booking_audit_created_at_idx').on(table.createdAt),
  }),
);

export type PortalBookingAudit = typeof portalBookingAudit.$inferSelect;
export type NewPortalBookingAudit = typeof portalBookingAudit.$inferInsert;
