import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { acomodacoes } from './acomodacoes';
import { empreendimentos } from './empreendimentos';

export const ROTEIRO_PONTO_TIPOS = [
  'hospedagem',
  'parque',
  'restaurante',
  'atracao',
  'ponto_dia',
] as const;

export type RoteiroPontoTipo = (typeof ROTEIRO_PONTO_TIPOS)[number];

export const roteiroPontos = pgTable(
  'roteiro_pontos',
  {
    id: serial('id').primaryKey(),
    hotelId: integer('hotel_id')
      .notNull()
      .references(() => empreendimentos.id),
    acomodacaoId: integer('acomodacao_id').references(() => acomodacoes.id),
    tipo: text('tipo').notNull(),
    titulo: text('titulo').notNull(),
    descricao: text('descricao'),
    lat: numeric('lat', { precision: 9, scale: 6 }).notNull(),
    lng: numeric('lng', { precision: 9, scale: 6 }).notNull(),
    dia: integer('dia'),
    ordem: integer('ordem').default(0),
    ativo: boolean('ativo').default(true),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    hotelAtivoIdx: index('idx_roteiro_pontos_hotel_ativo').on(t.hotelId, t.ativo),
  }),
);

export type RoteiroPonto = typeof roteiroPontos.$inferSelect;
export type NovoRoteiroPonto = typeof roteiroPontos.$inferInsert;
