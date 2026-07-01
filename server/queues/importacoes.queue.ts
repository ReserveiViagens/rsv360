import { Queue } from 'bullmq';
import { createBullMQConnection } from '../modules/fornecedores-hub/redis-connection';

export const IMPORTACOES_QUEUE_NAME = 'importacoes';
export const JOB_IMPORTAR_ACOMODACOES = 'importar-acomodacoes';

export type ImportarAcomodacoesJobData = {
  jobId: string;
  nomeArquivo: string;
  bufferBase64: string;
  proprietarioId?: number | null;
  bulkPublicado?: boolean;
  statusPublicacao?: 'rascunho' | 'completo' | 'em_aprovacao' | 'publicado' | 'rejeitado';
  userId?: number;
};

let queue: Queue<ImportarAcomodacoesJobData> | null = null;

export async function getImportacoesQueue(): Promise<Queue<ImportarAcomodacoesJobData>> {
  if (queue) return queue;
  const connection = await createBullMQConnection();
  queue = new Queue<ImportarAcomodacoesJobData>(IMPORTACOES_QUEUE_NAME, { connection });
  return queue;
}

export async function enfileirarImportacao(
  data: Omit<ImportarAcomodacoesJobData, 'jobId'> & { jobId?: string },
): Promise<string> {
  const q = await getImportacoesQueue();
  const jobId = data.jobId ?? `import-${Date.now()}`;
  await q.add(
    JOB_IMPORTAR_ACOMODACOES,
    { ...data, jobId },
    {
      jobId,
      removeOnComplete: 50,
      removeOnFail: 20,
    },
  );
  return jobId;
}

export async function closeImportacoesQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}

module.exports = {
  IMPORTACOES_QUEUE_NAME,
  JOB_IMPORTAR_ACOMODACOES,
  getImportacoesQueue,
  enfileirarImportacao,
  closeImportacoesQueue,
};
