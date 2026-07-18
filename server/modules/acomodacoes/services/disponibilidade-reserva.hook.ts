/**
 * Fase 2 — anti-overbooking por data (disponibilidade_acomodacao).
 * Tabela vazia = todas as diárias livres (zero regressão).
 */
import { and, eq } from 'drizzle-orm';
import { countWizardNights } from '@rsv360/shared';
import { db } from '../../../lib/db';
import { disponibilidadeAcomodacao } from '../../../../backend/src/db/schema/disponibilidade-acomodacao';

export class DisponibilidadeReservaConflictError extends Error {
  readonly statusCode = 409;

  constructor(
    public readonly acomodacaoId: number,
    public readonly datasIndisponiveis: string[],
  ) {
    super('Unidade indisponível nas datas solicitadas');
    this.name = 'DisponibilidadeReservaConflictError';
  }
}

export function listDiariasEstadia(checkIn: string, checkOut: string): string[] {
  const nights = countWizardNights(checkIn, checkOut);
  if (nights <= 0) return [];

  const dates: string[] = [];
  for (let i = 0; i < nights; i++) {
    const d = new Date(`${checkIn}T12:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

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

export async function verificarDisponibilidadeReserva(
  acomodacaoId: number,
  checkIn: string,
  checkOut: string,
): Promise<{ ok: true } | { ok: false; datasIndisponiveis: string[] }> {
  const datasIndisponiveis: string[] = [];
  for (const data of listDiariasEstadia(checkIn, checkOut)) {
    if (await isDataBloqueada(acomodacaoId, data)) {
      datasIndisponiveis.push(data);
    }
  }
  if (datasIndisponiveis.length > 0) {
    return { ok: false, datasIndisponiveis };
  }
  return { ok: true };
}

export async function assertDisponibilidadeReserva(
  acomodacaoId: number,
  checkIn: string,
  checkOut: string,
): Promise<void> {
  const result = await verificarDisponibilidadeReserva(acomodacaoId, checkIn, checkOut);
  if (result.ok === false) {
    throw new DisponibilidadeReservaConflictError(acomodacaoId, result.datasIndisponiveis);
  }
}

export async function marcarDiariasReservadas(
  acomodacaoId: number,
  checkIn: string,
  checkOut: string,
): Promise<void> {
  for (const data of listDiariasEstadia(checkIn, checkOut)) {
    const [existente] = await db
      .select()
      .from(disponibilidadeAcomodacao)
      .where(
        and(
          eq(disponibilidadeAcomodacao.acomodacaoId, acomodacaoId),
          eq(disponibilidadeAcomodacao.data, data),
        ),
      )
      .limit(1);

    if (existente) {
      await db
        .update(disponibilidadeAcomodacao)
        .set({
          disponivel: false,
          observacao: 'reservado',
          atualizadoEm: new Date(),
        })
        .where(eq(disponibilidadeAcomodacao.id, existente.id));
    } else {
      await db.insert(disponibilidadeAcomodacao).values({
        acomodacaoId,
        data,
        disponivel: false,
        observacao: 'reservado',
      });
    }
  }
}

module.exports = {
  DisponibilidadeReservaConflictError,
  listDiariasEstadia,
  isDataBloqueada,
  verificarDisponibilidadeReserva,
  assertDisponibilidadeReserva,
  marcarDiariasReservadas,
};
