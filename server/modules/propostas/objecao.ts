import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import { propostas } from '../../../backend/src/db/schema/propostas';
import { propostaRoomBroadcast } from './websocket/proposta-broadcast';

export type OrigemObjecao = 'auto' | 'ia' | 'manual';

const PADROES_OBJECAO = [
  /muito caro/i,
  /preço alto/i,
  /ach(ei|ou) caro/i,
  /não vale/i,
  /fora do orçamento/i,
];

export function detectarObjecaoPreco(mensagem: string): boolean {
  const text = mensagem.trim();
  if (!text) return false;
  return PADROES_OBJECAO.some((re) => re.test(text));
}

/**
 * Revela comparativo somente se ainda oculto e há âncoras no cache (idempotente).
 */
export async function revelarComparativo(
  propostaId: number,
  origem: OrigemObjecao,
): Promise<{ propostaId: number; origem: OrigemObjecao } | null> {
  const [updated] = await db
    .update(propostas)
    .set({ exibirComparativo: true, updatedAt: new Date() })
    .where(
      and(
        eq(propostas.id, propostaId),
        eq(propostas.exibirComparativo, false),
        sql`jsonb_array_length(${propostas.comparativoCache}) > 0`,
      ),
    )
    .returning();

  if (!updated) return null;

  propostaRoomBroadcast(propostaId, 'comparativo:revelado', {
    propostaId,
    origem,
    exibirComparativo: true,
  });

  return { propostaId, origem };
}

export async function contarVisualizacoesSemAceite(propostaId: number): Promise<number> {
  const { propostaEventos } = await import('../../../backend/src/db/schema/propostas');
  const { ne } = await import('drizzle-orm');
  const rows = await db
    .select()
    .from(propostaEventos)
    .where(
      and(eq(propostaEventos.propostaId, propostaId), eq(propostaEventos.tipo, 'visualizacao')),
    );
  const [proposta] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!proposta || ['accepted', 'rejected'].includes(proposta.status)) {
    return 0;
  }
  return rows.length;
}
