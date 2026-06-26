import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

/** Integrações de preços externas (Hub) — distinto de `fornecedores` logística (fase1-ext). */
export const fornecedoresApi = pgTable('fornecedores_api', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  tipo: text('tipo').notNull(),
  endpoint: text('endpoint').notNull(),
  apiKey: text('api_key').notNull(),
  adapter: text('adapter').notNull(),
  prioridade: integer('prioridade').default(100),
  timeoutMs: integer('timeout_ms').default(3000),
  ativo: boolean('ativo').default(true),
  config: jsonb('config').$type<Record<string, unknown>>(),
  criadoEm: timestamp('criado_em').defaultNow(),
});

export type FornecedorApi = typeof fornecedoresApi.$inferSelect;
export type NewFornecedorApi = typeof fornecedoresApi.$inferInsert;
