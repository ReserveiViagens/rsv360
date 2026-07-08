import { integer, numeric, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { acomodacoes } from './acomodacoes';
import { propostas } from './propostas';
import { users } from './existing';

export const comissoesLancamento = pgTable(
  'comissoes_lancamento',
  {
    id: serial('id').primaryKey(),
    propostaId: integer('proposta_id')
      .notNull()
      .references(() => propostas.id, { onDelete: 'cascade' }),
    acomodacaoId: integer('acomodacao_id').references(() => acomodacoes.id, { onDelete: 'set null' }),
    beneficiarioUserId: integer('beneficiario_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    papel: text('papel').notNull(),
    baseValor: numeric('base_valor', { precision: 12, scale: 2 }).notNull(),
    percentual: numeric('percentual', { precision: 5, scale: 2 }).notNull(),
    valorComissao: numeric('valor_comissao', { precision: 12, scale: 2 }).notNull(),
    status: text('status').notNull().default('pendente'),
    eventoGerador: text('evento_gerador').notNull().default('pagamento_confirmado'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    propostaBeneficiarioPapelUnique: unique('comissoes_lancamento_proposta_beneficiario_papel_unique').on(
      t.propostaId,
      t.beneficiarioUserId,
      t.papel,
    ),
  }),
);

export type ComissaoLancamento = typeof comissoesLancamento.$inferSelect;
