import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const relatoriosViews = pgTable('relatorios_views', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  userId: integer('user_id'),
  nome: varchar('nome', { length: 255 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  filtros: jsonb('filtros'),
  colunas: jsonb('colunas'),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const relatoriosSnapshots = pgTable('relatorios_snapshots', {
  id: serial('id').primaryKey(),
  viewId: integer('view_id').references(() => relatoriosViews.id, { onDelete: 'set null' }),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  periodoInicio: timestamp('periodo_inicio'),
  periodoFim: timestamp('periodo_fim'),
  dados: jsonb('dados').notNull().default({}),
  geradoPor: integer('gerado_por'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type RelatorioView = typeof relatoriosViews.$inferSelect;
export type NewRelatorioView = typeof relatoriosViews.$inferInsert;
export type RelatorioSnapshot = typeof relatoriosSnapshots.$inferSelect;
export type NewRelatorioSnapshot = typeof relatoriosSnapshots.$inferInsert;
