import { pgTable, serial, text, integer, decimal, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';
import { users } from './existing';

/**
 * Canonical bookings table.
 *
 * Polymorphic booking model:
 * - bookingType identifies the product family
 * - itemId points to the selected product record and is validated app-side
 *
 * We keep the DB flexible on purpose:
 * - text columns with defaults instead of enums/check constraints
 * - one FK to users for the customer owner
 * - denormalized customer snapshot for audit/history safety
 */
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),

  bookingCode: varchar('booking_code', { length: 50 }).notNull().unique(),
  bookingType: text('booking_type').notNull(),
  itemId: integer('item_id').notNull(),
  itemName: varchar('item_name', { length: 255 }).notNull(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),

  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }),
  customerDocument: varchar('customer_document', { length: 50 }),

  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),

  adultsCount: integer('adults_count').notNull().default(1),
  childrenCount: integer('children_count').notNull().default(0),
  infantsCount: integer('infants_count').notNull().default(0),
  guestsCount: integer('guests_count').notNull().default(1),

  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: decimal('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  taxes: decimal('taxes', { precision: 12, scale: 2 }).notNull().default('0'),
  serviceFee: decimal('service_fee', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('BRL'),

  paymentMethod: varchar('payment_method', { length: 20 }).notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'),
  paymentInfo: jsonb('payment_info'),

  status: text('status').notNull().default('pending'),

  specialRequests: text('special_requests'),
  notes: text('notes'),
  metadata: jsonb('metadata'),

  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  checkedOutAt: timestamp('checked_out_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
