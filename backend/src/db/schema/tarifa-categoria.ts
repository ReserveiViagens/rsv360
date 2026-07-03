import { boolean, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './existing';

export const tarifaCategoria = pgTable('tarifa_categoria', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  descontoPercentual: numeric('desconto_percentual', { precision: 5, scale: 2 }),
  requerComprovacao: boolean('requer_comprovacao').notNull().default(false),
  ativo: boolean('ativo').notNull().default(true),
  criadoPor: integer('criado_por').references(() => users.id),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});
