import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const reservasCotacao = pgTable('reservas_cotacao', {
  id: uuid('id').primaryKey(),
  parceiroId: uuid('parceiro_id').notNull(),
  chaveVaga: text('chave_vaga').notNull(),
  propostaId: integer('proposta_id'),
  status: text('status').notNull().default('pendente'),
  confirmadaEm: timestamp('confirmada_em', { withTimezone: true }),
  canceladaEm: timestamp('cancelada_em', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
});

export type ReservaCotacao = typeof reservasCotacao.$inferSelect;
export type NovaReservaCotacao = typeof reservasCotacao.$inferInsert;
