import { boolean, date, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { tarifaTemporada } from './tarifa-temporada-meta';

export const tarifaTemporadaPeriodo = pgTable('tarifa_temporada_periodo', {
  id: serial('id').primaryKey(),
  temporadaId: integer('temporada_id')
    .notNull()
    .references(() => tarifaTemporada.id, { onDelete: 'cascade' }),
  dataInicio: date('data_inicio').notNull(),
  dataFim: date('data_fim').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
});

export { tarifaTemporada } from './tarifa-temporada-meta';
