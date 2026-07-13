import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export type AgenteTier = 't0' | 't1' | 't2' | 't3';
export type AgenteCacheHit = 'exact' | 'semantic' | 'none';

export const agenteExecucoes = pgTable(
  'agente_execucoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agente: text('agente').notNull(),
    canal: text('canal'),
    entradaHash: text('entrada_hash').notNull(),
    tier: text('tier').$type<AgenteTier>().notNull(),
    cacheHit: text('cache_hit').$type<AgenteCacheHit>().notNull(),
    modelo: text('modelo'),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    custoEstimado: numeric('custo_estimado', { precision: 12, scale: 6 }),
    duracaoMs: integer('duracao_ms'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    agenteCriadoIdx: index('idx_agente_execucoes_agente_criado').on(t.agente, t.criadoEm),
    entradaHashIdx: index('idx_agente_execucoes_entrada_hash').on(t.entradaHash),
  }),
);
