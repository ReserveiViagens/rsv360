import { Worker } from 'bullmq';
import { createBullMQConnection } from '../fornecedores-hub/redis-connection';
import {
  contarVisualizacoesSemAceite,
  revelarComparativo,
} from './objecao';
import {
  JOB_AVALIAR_OBJECAO,
  PROPOSTAS_QUEUE_NAME,
  type AvaliarObjecaoJobData,
} from './propostas.queue';

let worker: Worker<AvaliarObjecaoJobData> | null = null;

const MIN_VISUALIZACOES = 3;

async function processAvaliarObjecao(job: { data: AvaliarObjecaoJobData }) {
  const { propostaId } = job.data;
  const views = await contarVisualizacoesSemAceite(propostaId);
  if (views < MIN_VISUALIZACOES) {
    return { skipped: true, views };
  }
  const result = await revelarComparativo(propostaId, 'auto');
  return { revealed: Boolean(result), views };
}

export async function startPropostasWorker(): Promise<void> {
  if (worker) return;
  if (process.env.REDIS_DISABLED === 'true' || !process.env.REDIS_URL) {
    console.warn('[propostas] Worker objeção omitido — REDIS_URL ausente');
    return;
  }

  const connection = await createBullMQConnection();
  worker = new Worker<AvaliarObjecaoJobData>(
    PROPOSTAS_QUEUE_NAME,
    async (job) => {
      if (job.name !== JOB_AVALIAR_OBJECAO) {
        throw new Error(`Job desconhecido: ${job.name}`);
      }
      return processAvaliarObjecao(job);
    },
    { connection, concurrency: 3 },
  );

  console.log('[propostas] Worker BullMQ avaliar-objecao registrado ✓');
}

export async function stopPropostasWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
