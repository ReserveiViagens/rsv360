import { pgTable, serial, varchar, text, numeric, boolean, timestamp, integer, date } from 'drizzle-orm/pg-core';

export const travel = pgTable('travel_packages', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'pacote', 'excursao', 'cruzeiro', 'rodoviario'
  origin: varchar('origin', { length: 100 }),
  destination: varchar('destination', { length: 100 }).notNull(),
  departureDate: date('departure_date'),
  returnDate: date('return_date'),
  durationDays: integer('duration_days'),
  durationNights: integer('duration_nights'),
  pricePerPerson: numeric('price_per_person', { precision: 10, scale: 2 }).notNull(),
  priceChild: numeric('price_child', { precision: 10, scale: 2 }),
  maxPassengers: integer('max_passengers'),
  currentPassengers: integer('current_passengers').default(0),
  includes: text('includes'), // JSON array
  notIncludes: text('not_includes'), // JSON array
  itinerary: text('itinerary'), // JSON array
  imageUrl: text('image_url'),
  galleryUrls: text('gallery_urls'),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  totalReviews: integer('total_reviews').default(0),
  enterpriseId: integer('enterprise_id'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
