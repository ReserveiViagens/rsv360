import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const cloudCacheConfig = pgTable('cloud_cache_config', {
  id: text('id').primaryKey(),
  key: text('key'),
  pattern: text('pattern'),
  ttl: integer('ttl'),
  maxSize: integer('max_size'),
  strategy: text('strategy'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});