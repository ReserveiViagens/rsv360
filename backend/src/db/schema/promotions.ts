import { pgTable, serial, varchar, text, numeric, boolean, timestamp, integer, date } from 'drizzle-orm/pg-core';

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'desconto', 'combo', 'flash', 'temporada', 'cupom'
  discountType: varchar('discount_type', { length: 20 }), // 'percentage', 'fixed'
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }),
  couponCode: varchar('coupon_code', { length: 50 }),
  imageUrl: text('image_url'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  minPurchase: numeric('min_purchase', { precision: 10, scale: 2 }),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  productId: integer('product_id'),
  enterpriseId: integer('enterprise_id'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});