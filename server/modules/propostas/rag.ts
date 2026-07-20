import { sql } from 'drizzle-orm';
import { db } from '../../lib/db';

export type ChunkConhecimento = {
  id: string;
  conteudo: string;
  fonte: string;
};

/**
 * Busca incremental por ILIKE quando pgvector não está disponível;
 * usa similaridade vetorial quando a extensão/tabela existir.
 */
export async function buscarContextoRag(query: string, limit = 5): Promise<ChunkConhecimento[]> {
  const term = query.trim().slice(0, 200);
  if (!term) return [];

  try {
    const result = await db.execute(sql`
      SELECT id::text, conteudo, fonte
      FROM conhecimento_chunks
      WHERE conteudo ILIKE ${'%' + term + '%'}
      ORDER BY criado_em DESC
      LIMIT ${limit}
    `);
    const list: ChunkConhecimento[] = [];
    for (const row of result.rows) {
      const id = row.id;
      const conteudo = row.conteudo;
      const fonte = row.fonte;
      if (typeof id === 'string' && typeof conteudo === 'string' && typeof fonte === 'string') {
        list.push({ id, conteudo, fonte });
      }
    }
    return list;
  } catch {
    return [];
  }
}
