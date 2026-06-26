import { Queue } from 'bullmq';
import { createBullMQConnection } from '../fornecedores-hub/redis-connection';

export const PROPOSTAS_QUEUE_NAME = 'cotacao-propostas';
export const JOB_AVALIAR_OBJECAO = 'avaliar-objecao';

export type AvaliarObjecaoJobData = { propostaId: number };

let queue: Queue<AvaliarObjecaoJobData> | null = null;

export async function getPropostasQueue(): Promise<Queue<AvaliarObjecaoJobData>> {
  if (queue) return queue;
  const connection = await createBullMQConnection();
  queue = new Queue<AvaliarObjecaoJobData>(PROPOSTAS_QUEUE_NAME, { connection });
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

export async function closePropostasQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}
