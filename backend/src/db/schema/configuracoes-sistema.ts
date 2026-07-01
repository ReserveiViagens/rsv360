import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

export const configuracoesSistema = pgTable('configuracoes_sistema', {
  id: uuid('id').primaryKey().defaultRandom(),
  chave: text('chave').notNull().unique(),
  valores: jsonb('valores').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
