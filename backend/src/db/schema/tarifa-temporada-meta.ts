import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const tarifaTemporada = pgTable('tarifa_temporada', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  cor: text('cor'),
  prioridade: integer('prioridade').notNull().default(0),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});
