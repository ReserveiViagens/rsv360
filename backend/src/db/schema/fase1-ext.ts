import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';
import { passageiros } from './passageiros';

/** Fase 4 — extensões de schema (migration 0009). */

export const contasPagar = pgTable('contas_pagar', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  fornecedorNome: varchar('fornecedor_nome', { length: 255 }).notNull(),
  descricao: text('descricao').notNull(),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  valorPago: numeric('valor_pago', { precision: 12, scale: 2 }).notNull().default('0'),
  status: varchar('status', { length: 30 }).notNull().default('aberto'),
  vencimento: timestamp('vencimento'),
  pagoEm: timestamp('pago_em'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const fornecedores = pgTable('fornecedores', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  nome: varchar('nome', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 20 }),
  email: varchar('email', { length: 255 }),
  telefone: varchar('telefone', { length: 50 }),
  categoria: varchar('categoria', { length: 100 }),
  status: varchar('status', { length: 30 }).notNull().default('ativo'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reservasLogistica = pgTable('reservas_logistica', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  fornecedorId: integer('fornecedor_id'),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull().default('servico'),
  status: varchar('status', { length: 30 }).notNull().default('pendente'),
  dataInicio: timestamp('data_inicio'),
  dataFim: timestamp('data_fim'),
  valor: numeric('valor', { precision: 12, scale: 2 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vouchers = pgTable('vouchers', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  codigo: varchar('codigo', { length: 50 }).notNull(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  passageiroNome: varchar('passageiro_nome', { length: 255 }),
  reservaId: integer('reserva_id'),
  status: varchar('status', { length: 30 }).notNull().default('ativo'),
  validoAte: timestamp('valido_ate'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const fnrhRegistros = pgTable('fnrh_registros', {
  id: serial('id').primaryKey(),
  passageiroId: integer('passageiro_id')
    .notNull()
    .references(() => passageiros.id, { onDelete: 'cascade' }),
  hotelNome: varchar('hotel_nome', { length: 255 }),
  dataEntrada: date('data_entrada'),
  dataSaida: date('data_saida'),
  motivoViagem: varchar('motivo_viagem', { length: 100 }),
  meioTransporte: varchar('meio_transporte', { length: 100 }),
  status: varchar('status', { length: 30 }).notNull().default('rascunho'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ContaPagar = typeof contasPagar.$inferSelect;
export type Fornecedor = typeof fornecedores.$inferSelect;
export type ReservaLogistica = typeof reservasLogistica.$inferSelect;
export type Voucher = typeof vouchers.$inferSelect;
export type FnrhRegistro = typeof fnrhRegistros.$inferSelect;
