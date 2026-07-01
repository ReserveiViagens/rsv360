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
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { OfertaNormalizada } from '@rsv360/shared';
import { orcamentos } from './orcamentos';

export const propostas = pgTable(
  'propostas',
  {
    id: serial('id').primaryKey(),
    enterpriseId: integer('enterprise_id'),
    orcamentoId: integer('orcamento_id').references(() => orcamentos.id, { onDelete: 'set null' }),
    codigo: varchar('codigo', { length: 50 }),
    titulo: varchar('titulo', { length: 255 }).notNull(),
    clienteNome: varchar('cliente_nome', { length: 255 }).notNull(),
    clienteEmail: varchar('cliente_email', { length: 255 }),
    clienteTelefone: varchar('cliente_telefone', { length: 50 }),
    status: varchar('status', { length: 30 }).notNull().default('draft'),
    valorTotal: numeric('valor_total', { precision: 12, scale: 2 }).notNull().default('0'),
    moeda: varchar('moeda', { length: 3 }).notNull().default('BRL'),
    validoAte: timestamp('valido_ate'),
    avisoExpiracaoEnviado: boolean('aviso_expiracao_enviado').default(false),
    roteiroEntregue: boolean('roteiro_entregue').notNull().default(false),
    versao: integer('versao').notNull().default(1),
    isPublica: boolean('is_publica').default(false),
    tokenPublico: varchar('token_publico', { length: 64 }),
    exibirComparativo: boolean('exibir_comparativo').default(false),
    comparativoCache: jsonb('comparativo_cache').$type<OfertaNormalizada[]>(),
    statusAprovacao: varchar('status_aprovacao', { length: 40 }).default('nao_requer'),
    solicitadoPor: integer('solicitado_por'),
    aprovadoPor: integer('aprovado_por'),
    voucherTipo: varchar('voucher_tipo', { length: 20 }),
    conteudo: jsonb('conteudo'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => ({
    tokenPublicoUnique: uniqueIndex('propostas_token_publico_unique').on(t.tokenPublico),
  }),
);

export const propostaEventos = pgTable('proposta_eventos', {
  id: serial('id').primaryKey(),
  propostaId: integer('proposta_id')
    .notNull()
    .references(() => propostas.id, { onDelete: 'cascade' }),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  descricao: text('descricao'),
  payload: jsonb('payload'),
  actorId: integer('actor_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const propostaChat = pgTable('proposta_chat', {
  id: serial('id').primaryKey(),
  propostaId: integer('proposta_id')
    .notNull()
    .references(() => propostas.id, { onDelete: 'cascade' }),
  senderType: varchar('sender_type', { length: 30 }).notNull(),
  senderName: varchar('sender_name', { length: 255 }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pacotesTemplate = pgTable('pacotes_template', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  nome: varchar('nome', { length: 255 }).notNull(),
  categoria: varchar('categoria', { length: 100 }),
  descricao: text('descricao'),
  conteudo: jsonb('conteudo').notNull().default({}),
  isActive: boolean('is_active').default(true),
  usoCount: integer('uso_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Proposta = typeof propostas.$inferSelect;
export type NewProposta = typeof propostas.$inferInsert;
export type PropostaEvento = typeof propostaEventos.$inferSelect;
export type PropostaChat = typeof propostaChat.$inferSelect;
export type PacoteTemplate = typeof pacotesTemplate.$inferSelect;
