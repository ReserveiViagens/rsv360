import { pgTable, serial, varchar, text, numeric, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const attractions = pgTable('attractions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'monumento', 'museu', 'mirante', 'praia', 'cachoeira'
  category: varchar('category', { length: 50 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  address: text('address'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  imageUrl: text('image_url'),
  galleryUrls: text('gallery_urls'),
  priceFrom: numeric('price_from', { precision: 10, scale: 2 }),
  isFree: boolean('is_free').default(false),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  totalReviews: integer('total_reviews').default(0),
  parkId: integer('park_id'),
  enterpriseId: integer('enterprise_id'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});