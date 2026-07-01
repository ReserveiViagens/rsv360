import { and, eq, notInArray } from 'drizzle-orm';
import { db } from '../../lib/db';
import { propostas } from '../../../backend/src/db/schema/propostas';
import { CONFIG_PROPOSTA_PADRAO } from '../fornecedores-hub/schema';
import { recordPropostaExpirada } from './metrics';

export const PROPOSTA_EXPIRADA_MSG =
  'Proposta expirada. Solicite a atualização das tarifas ao seu consultor.';

/** Status que não devem ser sobrescritos pelo worker de expiração. */
export const PROPOSTA_STATUS_FECHADO = ['accepted', 'converted', 'paid', 'cancelled'] as const;

export class PropostaExpiradaError extends Error {
  statusCode = 403;

  constructor(message = PROPOSTA_EXPIRADA_MSG) {
    super(message);
    this.name = 'PropostaExpiradaError';
  }
}

export function servidorAgora(): Date {
  return new Date();
}

export function isValidoAteVencido(
  validoAte: Date | null | undefined,
  agora: Date = servidorAgora(),
): boolean {
  if (!validoAte) return false;
  return agora.getTime() > new Date(validoAte).getTime();
}

export function isPropostaExpirada(
  row: { status: string; validoAte?: Date | null },
  agora: Date = servidorAgora(),
): boolean {
  if (row.status === 'expired') return true;
  return isValidoAteVencido(row.validoAte, agora);
}

export async function buildValidadePayload(row: { status: string; validoAte?: Date | null }) {
  const agora = servidorAgora();
  const validoAte = row.validoAte ? new Date(row.validoAte) : null;
  const restanteMs = validoAte ? Math.max(0, validoAte.getTime() - agora.getTime()) : null;
  const expirada = isPropostaExpirada(row, agora);

  let urgenciaEstilo = CONFIG_PROPOSTA_PADRAO.urgenciaEstilo;
  try {
    const { ConfigService } = require('../configuracoes/config.service');
    const config = await ConfigService.obterRegrasCotacao();
    urgenciaEstilo = config.urgenciaEstilo ?? urgenciaEstilo;
  } catch {
    /* config opcional */
  }

  return {
    validoAte: validoAte?.toISOString() ?? null,
    servidorAgora: agora.toISOString(),
    restanteMs,
    expirada,
    status: row.status,
    urgenciaEstilo,
  };
}

/** Marca como expirada apenas se a proposta não estiver fechada (idempotente). */
export async function marcarExpirada(propostaId: number) {
  const [updated] = await db
    .update(propostas)
    .set({ status: 'expired', updatedAt: new Date() })
    .where(
      and(
        eq(propostas.id, propostaId),
        notInArray(propostas.status, [...PROPOSTA_STATUS_FECHADO]),
      ),
    )
    .returning();

  return updated ?? null;
}

export async function assertPropostaNaoExpirada(row: {
  id: number;
  status: string;
  validoAte?: Date | null;
}): Promise<void> {
  if (row.status === 'expired') {
    throw new PropostaExpiradaError();
  }

  if (isValidoAteVencido(row.validoAte)) {
    const updated = await marcarExpirada(row.id);
    if (updated) {
      recordPropostaExpirada('sync');
    }
    throw new PropostaExpiradaError();
  }
}

export function isPropostaExpiradaError(error: unknown): boolean {
  return (
    error instanceof PropostaExpiradaError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { name?: string; statusCode?: number }).name === 'PropostaExpiradaError')
  );
}

module.exports = {
  PROPOSTA_EXPIRADA_MSG,
  PROPOSTA_STATUS_FECHADO,
  PropostaExpiradaError,
  isPropostaExpiradaError,
  servidorAgora,
  isValidoAteVencido,
  isPropostaExpirada,
  buildValidadePayload,
  marcarExpirada,
  assertPropostaNaoExpirada,
};
