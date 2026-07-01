import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { tiposAcomodacao } from './tipos-acomodacao';
import { users } from './existing';

export const acomodacoes = pgTable('acomodacoes', {
  id: serial('id').primaryKey(),
  hotelId: text('hotel_id').notNull(),
  proprietarioId: integer('proprietario_id').references(() => users.id),
  tipoId: integer('tipo_id').references(() => tiposAcomodacao.id),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  quartos: integer('quartos').notNull().default(1),
  configSala: text('config_sala').notNull().default('nenhum'),
  configBanheiro: text('config_banheiro').notNull().default('so_wc_social'),
  capacidadeMax: integer('capacidade_max').notNull(),
  capacidadeBase: integer('capacidade_base'),
  precoDiaria: numeric('preco_diaria', { precision: 12, scale: 2 }),
  utensilios: jsonb('utensilios'),
  eletrodomesticos: jsonb('eletrodomesticos'),
  amenidades: jsonb('amenidades'),
  midia: jsonb('midia'),
  dadosCompletos: boolean('dados_completos').notNull().default(false),
  statusPublicacao: text('status_publicacao').notNull().default('rascunho'),
  metadata: jsonb('metadata'),
  ativo: boolean('ativo').notNull().default(true),
  codigoExterno: varchar('codigo_externo', { length: 128 }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});

export type Acomodacao = typeof acomodacoes.$inferSelect;
export type NovaAcomodacao = typeof acomodacoes.$inferInsert;
