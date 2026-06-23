import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const transacoes = pgTable('transacoes', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  tipo: varchar('tipo', { length: 20 }).notNull(),
  categoria: varchar('categoria', { length: 100 }),
  descricao: text('descricao').notNull(),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  moeda: varchar('moeda', { length: 3 }).notNull().default('BRL'),
  status: varchar('status', { length: 30 }).notNull().default('pendente'),
  metodoPagamento: varchar('metodo_pagamento', { length: 50 }),
  referenciaTipo: varchar('referencia_tipo', { length: 50 }),
  referenciaId: integer('referencia_id'),
  dataTransacao: timestamp('data_transacao').notNull().defaultNow(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contasReceber = pgTable('contas_receber', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  clienteNome: varchar('cliente_nome', { length: 255 }).notNull(),
  clienteEmail: varchar('cliente_email', { length: 255 }),
  descricao: text('descricao').notNull(),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  valorRecebido: numeric('valor_recebido', { precision: 12, scale: 2 }).notNull().default('0'),
  status: varchar('status', { length: 30 }).notNull().default('aberto'),
  vencimento: timestamp('vencimento'),
  recebidoEm: timestamp('recebido_em'),
  bookingId: integer('booking_id'),
  propostaId: integer('proposta_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Transacao = typeof transacoes.$inferSelect;
export type NewTransacao = typeof transacoes.$inferInsert;
export type ContaReceber = typeof contasReceber.$inferSelect;
export type NewContaReceber = typeof contasReceber.$inferInsert;
