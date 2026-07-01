import { Queue } from 'bullmq';
import { createBullMQConnection } from '../fornecedores-hub/redis-connection';

export const PROPOSTAS_QUEUE_NAME = 'cotacao-propostas';
export const JOB_AVALIAR_OBJECAO = 'avaliar-objecao';
export const JOB_EXPIRAR_PROPOSTA = 'expirar-proposta';
export const JOB_AVISO_EXPIRACAO = 'aviso-expiracao-proposta';
export const JOB_ENTREGAR_ROTEIRO = 'entregar-roteiro';

export type AvaliarObjecaoJobData = { propostaId: number };
export type ExpirarPropostaJobData = { propostaId: number };
export type AvisoExpiracaoJobData = { propostaId: number };
export type EntregarRoteiroJobData = { propostaId: number };
export type PropostasJobData =
  | AvaliarObjecaoJobData
  | ExpirarPropostaJobData
  | AvisoExpiracaoJobData
  | EntregarRoteiroJobData;

let queue: Queue<PropostasJobData> | null = null;

export async function getPropostasQueue(): Promise<Queue<PropostasJobData>> {
  if (queue) return queue;
  const connection = await createBullMQConnection();
  queue = new Queue<PropostasJobData>(PROPOSTAS_QUEUE_NAME, { connection });
  return queue;
}

export async function agendarAvaliarObjecao(propostaId: number, delayMs: number): Promise<void> {
  const q = await getPropostasQueue();
  await q.add(
    JOB_AVALIAR_OBJECAO,
    { propostaId },
    {
      jobId: `avaliar-objecao-${propostaId}`,
      delay: delayMs,
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  );
}

export async function agendarExpiracao(propostaId: number, validoAte: Date): Promise<void> {
  const delay = Math.max(0, validoAte.getTime() - Date.now());
  const q = await getPropostasQueue();
  await q.add(
    JOB_EXPIRAR_PROPOSTA,
    { propostaId },
    {
      jobId: `expirar:${propostaId}`,
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

/** Agenda aviso X horas antes de valido_ate (config avisoExpiracaoHoras). */
export async function agendarAvisoExpiracao(
  propostaId: number,
  validoAte: Date,
  avisoExpiracaoHoras: number,
): Promise<void> {
  if (avisoExpiracaoHoras <= 0) return;

  const avisoEm = validoAte.getTime() - avisoExpiracaoHoras * 60 * 60 * 1000;
  const delay = Math.max(0, avisoEm - Date.now());
  const q = await getPropostasQueue();
  await q.add(
    JOB_AVISO_EXPIRACAO,
    { propostaId },
    {
      jobId: `aviso-expiracao:${propostaId}`,
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

/** Agenda entrega idempotente do link do roteiro (WhatsApp/e-mail) após accept/paid. */
export async function agendarEntregaRoteiro(propostaId: number, delayMs = 0): Promise<void> {
  const q = await getPropostasQueue();
  await q.add(
    JOB_ENTREGAR_ROTEIRO,
    { propostaId },
    {
      jobId: `entregar-roteiro-${propostaId}`,
      delay: Math.max(0, delayMs),
      removeOnComplete: true,
      removeOnFail: 50,
    },
  );
}

export async function closePropostasQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}

module.exports = {
  PROPOSTAS_QUEUE_NAME,
  JOB_AVALIAR_OBJECAO,
  JOB_EXPIRAR_PROPOSTA,
  JOB_AVISO_EXPIRACAO,
  JOB_ENTREGAR_ROTEIRO,
  getPropostasQueue,
  agendarAvaliarObjecao,
  agendarExpiracao,
  agendarAvisoExpiracao,
  agendarEntregaRoteiro,
  closePropostasQueue,
};
