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

export const orcamentos = pgTable('orcamentos', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  codigo: varchar('codigo', { length: 50 }),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  clienteNome: varchar('cliente_nome', { length: 255 }).notNull(),
  clienteEmail: varchar('cliente_email', { length: 255 }),
  clienteTelefone: varchar('cliente_telefone', { length: 50 }),
  clienteDocumento: varchar('cliente_documento', { length: 50 }),
  tipo: varchar('tipo', { length: 50 }).notNull().default('personalizado'),
  categoria: varchar('categoria', { length: 100 }),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  desconto: numeric('desconto', { precision: 12, scale: 2 }).notNull().default('0'),
  descontoTipo: varchar('desconto_tipo', { length: 20 }).default('percentage'),
  impostos: numeric('impostos', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  moeda: varchar('moeda', { length: 3 }).notNull().default('BRL'),
  validoAte: timestamp('valido_ate'),
  notas: text('notas'),
  metadata: jsonb('metadata'),
  criadoPor: integer('criado_por'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orcamentoItens = pgTable('orcamento_itens', {
  id: serial('id').primaryKey(),
  orcamentoId: integer('orcamento_id')
    .notNull()
    .references(() => orcamentos.id, { onDelete: 'cascade' }),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  categoria: varchar('categoria', { length: 100 }),
  quantidade: integer('quantidade').notNull().default(1),
  precoUnitario: numeric('preco_unitario', { precision: 12, scale: 2 }).notNull().default('0'),
  precoTotal: numeric('preco_total', { precision: 12, scale: 2 }).notNull().default('0'),
  detalhes: jsonb('detalhes'),
  ordem: integer('ordem').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type NewOrcamento = typeof orcamentos.$inferInsert;
export type OrcamentoItem = typeof orcamentoItens.$inferSelect;
export type NewOrcamentoItem = typeof orcamentoItens.$inferInsert;
