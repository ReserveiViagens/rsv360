import { and, eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { indicacoes } from '../../../backend/src/db/schema/indicacoes';

export type RegistrarIndicacaoInput = {
  indicadorId: number;
  tokenProposta: string;
  canal?: string;
  indicadoEmail?: string;
  indicadoTelefone?: string;
};

export function montarUrlIndicacao(
  siteUrl: string,
  tokenProposta: string,
  indicadorId: number,
  canal?: string,
): string {
  const params = new URLSearchParams({ ref: String(indicadorId) });
  if (canal) params.set('canal', canal);
  const base = siteUrl.replace(/\/$/, '');
  return `${base}/proposta/${encodeURIComponent(tokenProposta)}?${params.toString()}`;
}

export async function registrarIndicacao(input: RegistrarIndicacaoInput) {
  const [existing] = await db
    .select()
    .from(indicacoes)
    .where(
      and(
        eq(indicacoes.tokenProposta, input.tokenProposta),
        eq(indicacoes.indicadorId, input.indicadorId),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(indicacoes)
    .values({
      indicadorId: input.indicadorId,
      tokenProposta: input.tokenProposta,
      canal: input.canal ?? null,
      indicadoEmail: input.indicadoEmail ?? null,
      indicadoTelefone: input.indicadoTelefone ?? null,
      statusIndicacao: 'pendente',
    })
    .returning();

  return created;
}

export async function marcarConversaoIndicacao(tokenProposta: string, indicadorId: number) {
  const [updated] = await db
    .update(indicacoes)
    .set({ statusIndicacao: 'convertida', dataConversao: new Date() })
    .where(
      and(eq(indicacoes.tokenProposta, tokenProposta), eq(indicacoes.indicadorId, indicadorId)),
    )
    .returning();
  return updated ?? null;
}
