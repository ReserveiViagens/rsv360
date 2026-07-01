import { boolean, date, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { acomodacoes } from './acomodacoes';

export const disponibilidadeAcomodacao = pgTable('disponibilidade_acomodacao', {
  id: serial('id').primaryKey(),
  acomodacaoId: integer('acomodacao_id')
    .notNull()
    .references(() => acomodacoes.id, { onDelete: 'cascade' }),
  data: date('data').notNull(),
  disponivel: boolean('disponivel').notNull().default(true),
  precoOverride: numeric('preco_override', { precision: 12, scale: 2 }),
  observacao: text('observacao'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});

export type DisponibilidadeAcomodacao = typeof disponibilidadeAcomodacao.$inferSelect;
