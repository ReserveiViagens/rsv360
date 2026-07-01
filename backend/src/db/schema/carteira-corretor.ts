import { integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './existing';

export const carteiraCorretor = pgTable(
  'carteira_corretor',
  {
    corretorId: integer('corretor_id')
      .notNull()
      .references(() => users.id),
    proprietarioId: integer('proprietario_id')
      .notNull()
      .references(() => users.id),
    status: text('status').notNull().default('ativo'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.corretorId, t.proprietarioId] })],
);

export type CarteiraCorretor = typeof carteiraCorretor.$inferSelect;
