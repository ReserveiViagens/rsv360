import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { bookings } from './bookings';

export const guestPortalTokens = pgTable(
  'guest_portal_tokens',
  {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
    accessCount: integer('access_count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenUnique: uniqueIndex('idx_guest_portal_tokens_token_unique').on(table.token),
    bookingIdx: index('idx_guest_portal_tokens_booking_id').on(table.bookingId),
    activeExpiresIdx: index('idx_guest_portal_tokens_active_expires').on(
      table.isActive,
      table.expiresAt,
    ),
  }),
);

export type GuestPortalToken = typeof guestPortalTokens.$inferSelect;
export type GuestPortalTokenInsert = typeof guestPortalTokens.$inferInsert;
