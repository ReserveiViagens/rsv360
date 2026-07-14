import { and, cosineDistance, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { agenteConhecimento } from '../../../../backend/src/db/schema/agentes-conhecimento';
import type { InstrutorPapel } from './tipos';
import { AGENTE_INSTRUTOR } from './tipos';

export type ChunkRag = {
  docSlug: string;
  chunkOrdem: number;
  papel: string;
  rotas: string[];
  conteudo: string;
  versaoBase: string;
  similaridade: number;
};

export async function buscarChunksRag(
  embedding: number[],
  papel: Exclude<InstrutorPapel, 'ambos'>,
  topK: number,
): Promise<ChunkRag[]> {
  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error('embedding deve ter dimensão 1536');
  }

  const distance = cosineDistance(agenteConhecimento.embedding, embedding);
  const similarity = sql<number>`1 - (${distance})`;

  const papelFilter =
    papel === 'staff'
      ? undefined
      : inArray(agenteConhecimento.papel, ['anfitriao', 'ambos']);

  const where = papelFilter
    ? and(eq(agenteConhecimento.agente, AGENTE_INSTRUTOR), papelFilter)
    : eq(agenteConhecimento.agente, AGENTE_INSTRUTOR);

  const rows = await db
    .select({
      docSlug: agenteConhecimento.docSlug,
      chunkOrdem: agenteConhecimento.chunkOrdem,
      papel: agenteConhecimento.papel,
      rotas: agenteConhecimento.rotas,
      conteudo: agenteConhecimento.conteudo,
      versaoBase: agenteConhecimento.versaoBase,
      similaridade: similarity,
    })
    .from(agenteConhecimento)
    .where(where)
    .orderBy(distance)
    .limit(topK);

  return rows.map((r) => ({
    docSlug: r.docSlug,
    chunkOrdem: r.chunkOrdem,
    papel: r.papel,
    rotas: Array.isArray(r.rotas) ? r.rotas : [],
    conteudo: r.conteudo,
    versaoBase: r.versaoBase,
    similaridade: Number(r.similaridade) || 0,
  }));
}
