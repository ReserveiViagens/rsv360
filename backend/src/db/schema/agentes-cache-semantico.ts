import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  vector,
} from 'drizzle-orm/pg-core';

/** Carimbo duro — deve bater antes da similaridade. */
export type AgenteCarimboContexto = {
  agente: string;
  entidade: string;
  idioma: string;
  perfil: string;
  versao_base: string;
  /** Classificação de conteúdo; "preco"/"disponibilidade" são bloqueados no service. */
  tipo?: string;
};

export const agenteCacheSemantico = pgTable(
  'agente_cache_semantico',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agente: text('agente').notNull(),
    carimboContexto: jsonb('carimbo_contexto').$type<AgenteCarimboContexto>().notNull(),
    perguntaNormalizada: text('pergunta_normalizada').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    resposta: text('resposta').notNull(),
    versaoBase: text('versao_base').notNull(),
    hits: integer('hits').notNull().default(0),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
  },
  (t) => ({
    hnswIdx: index('idx_agente_cache_semantico_hnsw').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops'),
    ),
    agenteVersaoIdx: index('idx_agente_cache_semantico_agente_versao').on(
      t.agente,
      t.versaoBase,
    ),
    expiraIdx: index('idx_agente_cache_semantico_expira').on(t.expiraEm),
  }),
);
