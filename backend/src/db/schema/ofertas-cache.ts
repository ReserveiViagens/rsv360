import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import type { OfertaNormalizada } from '@rsv360/shared';

/** Cache persistente de ofertas normalizadas (camada Postgres — TTL lógico 24h no resolver). */
export const ofertasCache = pgTable(
  'ofertas_cache',
  {
    chave: text('chave').primaryKey(),
    ofertas: jsonb('ofertas').$type<OfertaNormalizada[]>().notNull(),
    origem: text('origem').notNull(),
    capturadoEm: timestamp('capturado_em', { mode: 'date' }).notNull(),
    atualizadoEm: timestamp('atualizado_em', { mode: 'date' }).defaultNow(),
  },
  (table) => [index('idx_ofertas_cache_capturado').on(table.capturadoEm)],
);

export type OfertasCacheRow = typeof ofertasCache.$inferSelect;
export type NewOfertasCacheRow = typeof ofertasCache.$inferInsert;
