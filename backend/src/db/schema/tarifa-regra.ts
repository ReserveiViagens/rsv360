import { boolean, date, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { acomodacoes } from './acomodacoes';
import { users } from './existing';
import { tarifaCategoria } from './tarifa-categoria';
import { tarifaTemporada } from './tarifa-temporada-meta';

export const tarifaRegra = pgTable('tarifa_regra', {
  id: serial('id').primaryKey(),
  nivel: text('nivel').notNull(),
  acomodacaoId: integer('acomodacao_id').references(() => acomodacoes.id, { onDelete: 'cascade' }),
  hotelId: text('hotel_id'),
  temporadaId: integer('temporada_id').references(() => tarifaTemporada.id, { onDelete: 'set null' }),
  categoriaId: integer('categoria_id').references(() => tarifaCategoria.id, { onDelete: 'set null' }),
  tipoValor: text('tipo_valor').notNull().default('absoluto'),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  prioridade: integer('prioridade').notNull().default(0),
  vigenciaInicio: date('vigencia_inicio'),
  vigenciaFim: date('vigencia_fim'),
  ativo: boolean('ativo').notNull().default(true),
  criadoPor: integer('criado_por').references(() => users.id),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});
