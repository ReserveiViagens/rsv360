import { pgTable, serial, varchar, text, numeric, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'combo', 'personalizado', 'trending', 'seasonal'
  category: varchar('category', { length: 50 }),
  targetAudience: varchar('target_audience', { length: 50 }), // 'familia', 'casal', 'aventura', 'economico'
  productIds: text('product_ids'), // JSON array de IDs
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }),
  discountedPrice: numeric('discounted_price', { precision: 10, scale: 2 }),
  savingsPercent: numeric('savings_percent', { precision: 5, scale: 2 }),
  imageUrl: text('image_url'),
  priority: integer('priority').default(0),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});