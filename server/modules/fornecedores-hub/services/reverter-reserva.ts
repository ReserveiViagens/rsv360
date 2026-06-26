import { liberarLock } from '../lock';
import { reservasCotacaoService } from './reservas-cotacao.service';

export type RefundFn = (reservaId: string) => Promise<{ ok: boolean; idempotencyKey?: string }>;

const processedRefunds = new Set<string>();

/**
 * Reverte reserva: refund idempotente antes de liberar lock Redis.
 * Aborta se refund falhar — lock permanece até expiração BullMQ.
 */
export async function reverterReserva(
  reservaId: string,
  refundFn: RefundFn,
): Promise<{ reverted: boolean; refundSkipped?: boolean }> {
  const reserva = await reservasCotacaoService.findById(reservaId);
  if (!reserva) throw new Error('Reserva não encontrada');
  if (reserva.status === 'cancelada') {
    return { reverted: true, refundSkipped: true };
  }

  const idempotencyKey = `refund:${reservaId}`;
  if (!processedRefunds.has(idempotencyKey)) {
    const refund = await refundFn(reservaId);
    if (!refund.ok) {
      throw new Error('Refund falhou — lock mantido');
    }
    processedRefunds.add(idempotencyKey);
    if (refund.idempotencyKey) processedRefunds.add(refund.idempotencyKey);
  }

  await reservasCotacaoService.marcarCancelada(reservaId);
  await liberarLock(reserva.chaveVaga, reservaId);
  return { reverted: true };
}
