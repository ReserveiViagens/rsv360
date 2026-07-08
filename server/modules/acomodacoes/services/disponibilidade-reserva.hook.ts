/**
 * Fase 2 — verifica bloqueio de data em disponibilidade_acomodacao.
 * Integração completa no fluxo de reserva fica para sprint seguinte.
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { disponibilidadeAcomodacao } from '../../../../backend/src/db/schema/disponibilidade-acomodacao';

export async function isDataBloqueada(acomodacaoId: number, data: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(disponibilidadeAcomodacao)
    .where(
      and(
        eq(disponibilidadeAcomodacao.acomodacaoId, acomodacaoId),
        eq(disponibilidadeAcomodacao.data, data),
      ),
    )
    .limit(1);

  if (!row) return false;
  return row.disponivel === false;
}

module.exports = { isDataBloqueada };
