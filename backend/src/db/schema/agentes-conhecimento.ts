import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  unique,
  vector,
} from 'drizzle-orm/pg-core';

export const agenteConhecimento = pgTable(
  'agente_conhecimento',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agente: text('agente').notNull(),
    docSlug: text('doc_slug').notNull(),
    chunkOrdem: integer('chunk_ordem').notNull(),
    papel: text('papel').notNull(),
    rotas: jsonb('rotas').$type<string[]>().notNull().default([]),
    conteudo: text('conteudo').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    versaoBase: text('versao_base').notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    chunkUq: unique('uq_agente_conhecimento_chunk').on(
      t.agente,
      t.docSlug,
      t.chunkOrdem,
      t.versaoBase,
    ),
    hnswIdx: index('idx_agente_conhecimento_hnsw').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops'),
    ),
    agentePapelIdx: index('idx_agente_conhecimento_agente_papel').on(t.agente, t.papel),
    versaoIdx: index('idx_agente_conhecimento_versao').on(t.agente, t.versaoBase),
  }),
);
