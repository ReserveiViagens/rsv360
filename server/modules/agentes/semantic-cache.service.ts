import { and, eq, gt, sql, type SQL } from 'drizzle-orm';
import { cosineDistance } from 'drizzle-orm';
import { db } from '../../lib/db';
import {
  agenteCacheSemantico,
  type AgenteCarimboContexto,
} from '../../../backend/src/db/schema/agentes-cache-semantico';
import { AgentesConfigService } from './config.service';

/** Tipos cujo valor muda rápido demais — nunca cachear. */
export const TIPOS_CACHE_SEMANTICO_BLOQUEADOS = ['preco', 'disponibilidade'] as const;

export type TipoCacheSemanticoBloqueado = (typeof TIPOS_CACHE_SEMANTICO_BLOQUEADOS)[number];

export type SemanticCacheHit = {
  id: string;
  resposta: string;
  similaridade: number;
  tier: 'hit' | 'verificar';
};

export function isTipoCacheavel(tipo: string | null | undefined): boolean {
  if (!tipo) return true;
  const t = tipo.trim().toLowerCase();
  return !(TIPOS_CACHE_SEMANTICO_BLOQUEADOS as readonly string[]).includes(t);
}

/** Comparação estrita dos campos do carimbo (antes de similaridade). */
export function carimboMatches(
  stored: AgenteCarimboContexto,
  query: AgenteCarimboContexto,
): boolean {
  return (
    stored.agente === query.agente &&
    stored.entidade === query.entidade &&
    stored.idioma === query.idioma &&
    stored.perfil === query.perfil &&
    stored.versao_base === query.versao_base
  );
}

function carimboSqlFilter(carimbo: AgenteCarimboContexto): SQL {
  // Filtro duro via JSONB igualdade parcial dos campos críticos
  return and(
    sql`${agenteCacheSemantico.carimboContexto}->>'agente' = ${carimbo.agente}`,
    sql`${agenteCacheSemantico.carimboContexto}->>'entidade' = ${carimbo.entidade}`,
    sql`${agenteCacheSemantico.carimboContexto}->>'idioma' = ${carimbo.idioma}`,
    sql`${agenteCacheSemantico.carimboContexto}->>'perfil' = ${carimbo.perfil}`,
    sql`${agenteCacheSemantico.carimboContexto}->>'versao_base' = ${carimbo.versao_base}`,
  ) as SQL;
}

export class SemanticCacheService {
  /**
   * Busca: carimbo duro FIRST, depois similaridade coseno.
   * Embeddings reais ficam fora deste PR — caller passa vetor mockável.
   */
  static async buscar(
    embedding: number[],
    carimbo: AgenteCarimboContexto,
    opts?: { tipo?: string },
  ): Promise<SemanticCacheHit | null> {
    const tipo = opts?.tipo ?? carimbo.tipo;
    if (!isTipoCacheavel(tipo)) return null;

    if (!Array.isArray(embedding) || embedding.length !== 1536) {
      throw new Error('embedding deve ter dimensão 1536');
    }

    const cfg = await AgentesConfigService.obterConfig();
    const limiarHit = cfg.limiarSemanticoHit;
    const limiarVerificar = cfg.limiarSemanticoVerificar;

    const distance = cosineDistance(agenteCacheSemantico.embedding, embedding);
    const similarity = sql<number>`1 - (${distance})`;

    const rows = await db
      .select({
        id: agenteCacheSemantico.id,
        resposta: agenteCacheSemantico.resposta,
        carimbo: agenteCacheSemantico.carimboContexto,
        similaridade: similarity,
      })
      .from(agenteCacheSemantico)
      .where(
        and(
          eq(agenteCacheSemantico.agente, carimbo.agente),
          gt(agenteCacheSemantico.expiraEm, sql`now()`),
          carimboSqlFilter(carimbo),
          gt(similarity, limiarVerificar),
        ),
      )
      .orderBy(distance)
      .limit(5);

    for (const row of rows) {
      if (!carimboMatches(row.carimbo, carimbo)) continue;
      const sim = Number(row.similaridade);
      if (!Number.isFinite(sim)) continue;

      if (sim >= limiarHit) {
        await db
          .update(agenteCacheSemantico)
          .set({ hits: sql`${agenteCacheSemantico.hits} + 1` })
          .where(eq(agenteCacheSemantico.id, row.id));
        return { id: row.id, resposta: row.resposta, similaridade: sim, tier: 'hit' };
      }
      if (sim >= limiarVerificar) {
        return {
          id: row.id,
          resposta: row.resposta,
          similaridade: sim,
          tier: 'verificar',
        };
      }
    }

    return null;
  }

  static async gravar(input: {
    agente: string;
    carimbo: AgenteCarimboContexto;
    perguntaNormalizada: string;
    embedding: number[];
    resposta: string;
    versaoBase: string;
    expiraEm: Date;
    tipo?: string;
  }): Promise<{ id: string } | null> {
    const tipo = input.tipo ?? input.carimbo.tipo;
    if (!isTipoCacheavel(tipo)) return null;
    if (input.embedding.length !== 1536) {
      throw new Error('embedding deve ter dimensão 1536');
    }

    const [row] = await db
      .insert(agenteCacheSemantico)
      .values({
        agente: input.agente,
        carimboContexto: { ...input.carimbo, tipo },
        perguntaNormalizada: input.perguntaNormalizada,
        embedding: input.embedding,
        resposta: input.resposta,
        versaoBase: input.versaoBase,
        expiraEm: input.expiraEm,
      })
      .returning({ id: agenteCacheSemantico.id });

    return row ?? null;
  }

  static async invalidar(versaoBase: string): Promise<number> {
    const deleted = await db
      .delete(agenteCacheSemantico)
      .where(eq(agenteCacheSemantico.versaoBase, versaoBase))
      .returning({ id: agenteCacheSemantico.id });
    return deleted.length;
  }
}
