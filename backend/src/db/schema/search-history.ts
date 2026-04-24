import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const searchHistory = pgTable('search_history', {
  id: serial('id').primaryKey(),
  query: varchar('query', { length: 500 }).notNull(),
  category: varchar('category', { length: 50 }),
  destination: varchar('destination', { length: 100 }),
  resultsCount: integer('results_count').default(0),
  userId: integer('user_id'),
  sessionId: varchar('session_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const popularSearches = pgTable('popular_searches', {
  id: serial('id').primaryKey(),
  term: varchar('term', { length: 255 }).notNull().unique(),
  searchCount: integer('search_count').default(0),
  category: varchar('category', { length: 50 }),
  lastSearchedAt: timestamp('last_searched_at').defaultNow(),
});
