import { Queue } from 'bullmq';
import { createBullMQConnection } from './redis-connection';

export const RESERVAS_QUEUE_NAME = 'cotacao-reservas';
export const JOB_EXPIRAR_LOCK = 'expirar-lock';

export type ExpirarLockJobData = {
  reservaId: string;
  chaveVaga: string;
  parceiroId: string;
};

let queue: Queue<ExpirarLockJobData> | null = null;

export async function getReservasQueue(): Promise<Queue<ExpirarLockJobData>> {
  if (queue) return queue;
  const connection = await createBullMQConnection();
  queue = new Queue<ExpirarLockJobData>(RESERVAS_QUEUE_NAME, { connection });
  return queue;
}

export async function agendarExpiracaoLock(data: ExpirarLockJobData & { delayMs: number }) {
  const q = await getReservasQueue();
  await q.add(
    JOB_EXPIRAR_LOCK,
    {
      reservaId: data.reservaId,
      chaveVaga: data.chaveVaga,
      parceiroId: data.parceiroId,
    },
    {
      jobId: `expirar-lock:${data.reservaId}`,
      delay: data.delayMs,
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  );
}

export async function closeReservasQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}
