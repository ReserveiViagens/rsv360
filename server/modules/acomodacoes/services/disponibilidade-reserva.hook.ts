/**
 * Fase 2 — anti-overbooking por data (disponibilidade_acomodacao).
 * Tabela vazia = todas as diárias livres (zero regressão).
 */
import { and, eq, sql } from 'drizzle-orm';
import { countWizardNights } from '@rsv360/shared';
import { db } from '../../../lib/db';
import { disponibilidadeAcomodacao } from '../../../../backend/src/db/schema/disponibilidade-acomodacao';

type ReservaTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type RunReservaTransaction = <T>(
  fn: (tx: ReservaTransaction) => Promise<T>,
) => Promise<T>;

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

/**
 * PR-11d — hard-hold at proposal acceptance.
 *
 * Missing calendar rows cannot be protected with FOR UPDATE. Transaction-scoped
 * advisory locks serialize the same accommodation+nights, then an atomic upsert
 * claims each night. Any conflict throws and rolls the whole transaction back,
 * including the caller's proposal-status CAS.
 */
export async function comHoldReservaAtomico<T>(
  acomodacaoId: number,
  checkIn: string,
  checkOut: string,
  onClaimed: (tx: ReservaTransaction) => Promise<T>,
  runInTransaction: RunReservaTransaction = (fn) => db.transaction(fn),
): Promise<T> {
  const datas = [...listDiariasEstadia(checkIn, checkOut)].sort();

  return runInTransaction(async (tx) => {
    for (const data of datas) {
      const lockKey = `rsv360:proposta-hold:v1:${acomodacaoId}:${data}`;
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
      );
    }

    for (const data of datas) {
      const claimed = await tx.execute(sql`
        INSERT INTO disponibilidade_acomodacao
          (acomodacao_id, data, disponivel, observacao, atualizado_em)
        VALUES
          (${acomodacaoId}, ${data}, false, 'reservado', CURRENT_TIMESTAMP)
        ON CONFLICT (acomodacao_id, data) DO UPDATE
        SET disponivel = false,
            observacao = 'reservado',
            atualizado_em = CURRENT_TIMESTAMP
        WHERE disponibilidade_acomodacao.disponivel = true
        RETURNING data
      `);

      if (claimed.rows.length === 0) {
        throw new DisponibilidadeReservaConflictError(acomodacaoId, [data]);
      }
    }

    return onClaimed(tx);
  });
}

module.exports = {
  DisponibilidadeReservaConflictError,
  listDiariasEstadia,
  isDataBloqueada,
  verificarDisponibilidadeReserva,
  assertDisponibilidadeReserva,
  marcarDiariasReservadas,
  comHoldReservaAtomico,
};
