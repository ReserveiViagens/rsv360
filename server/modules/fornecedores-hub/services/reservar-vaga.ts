import { randomUUID } from 'node:crypto';
import {
  adquirirLock,
  chaveVagaFromOferta,
  ConflictError,
  liberarLock,
  LOCK_TTL_SECONDS,
} from '../lock';
import { agendarExpiracaoLock } from '../reservas.queue';
import { reservasCotacaoService } from './reservas-cotacao.service';

export type ReservarVagaInput = {
  parceiroId: string;
  ofertaId: string;
  propostaId?: number;
};

export async function reservarVaga(input: ReservarVagaInput) {
  const reservaId = randomUUID();
  const chaveVaga = chaveVagaFromOferta(input.parceiroId, input.ofertaId);

  const locked = await adquirirLock(chaveVaga, reservaId);
  if (!locked) {
    throw new ConflictError();
  }

  try {
    const reserva = await reservasCotacaoService.create({
      id: reservaId,
      parceiroId: input.parceiroId,
      chaveVaga,
      propostaId: input.propostaId ?? null,
      status: 'pendente',
    });

    await agendarExpiracaoLock({
      reservaId,
      chaveVaga,
      parceiroId: input.parceiroId,
      delayMs: LOCK_TTL_SECONDS * 1000,
    });

    return reserva;
  } catch (error) {
    await liberarLock(chaveVaga, reservaId).catch(() => undefined);
    throw error;
  }
}
