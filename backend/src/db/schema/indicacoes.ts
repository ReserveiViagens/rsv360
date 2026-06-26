import { pgTable, uuid, text, numeric, timestamp, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const indicacoes = pgTable(
  'indicacoes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    indicadorId: integer('indicador_id').notNull(),
    indicadoEmail: text('indicado_email'),
    indicadoTelefone: text('indicado_telefone'),
    tokenProposta: text('token_proposta').notNull(),
    canal: text('canal'),
    statusIndicacao: text('status_indicacao').default('pendente'),
    dataConversao: timestamp('data_conversao'),
    valorBonus: numeric('valor_bonus', { precision: 10, scale: 2 }),
    criadoEm: timestamp('criado_em').defaultNow(),
  },
  (t) => ({
    idxIndicador: index('idx_indicacoes_indicador').on(t.indicadorId),
    idxToken: index('idx_indicacoes_token').on(t.tokenProposta),
    uniqTokenIndicador: uniqueIndex('idx_indicacoes_token_indicador_unique').on(
      t.tokenProposta,
      t.indicadorId,
    ),
  }),
);

export type Indicacao = typeof indicacoes.$inferSelect;
export type NewIndicacao = typeof indicacoes.$inferInsert;
