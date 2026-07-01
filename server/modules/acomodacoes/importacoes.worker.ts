import { Worker } from 'bullmq';
import { createBullMQConnection } from '../fornecedores-hub/redis-connection';
import { pipelineImportacao } from '../modules/acomodacoes/import/pipeline';
import {
  IMPORTACOES_QUEUE_NAME,
  JOB_IMPORTAR_ACOMODACOES,
  type ImportarAcomodacoesJobData,
} from '../queues/importacoes.queue';

let worker: Worker<ImportarAcomodacoesJobData> | null = null;

export async function processImportJob(job: { data: ImportarAcomodacoesJobData }) {
  const buffer = Buffer.from(job.data.bufferBase64, 'base64');
  const relatorio = await pipelineImportacao(buffer, job.data.nomeArquivo, {
    dryRun: false,
    proprietarioId: job.data.proprietarioId ?? null,
    bulkPublicado: job.data.bulkPublicado,
    statusPublicacao: job.data.statusPublicacao,
  });

  console.log('[importacoes] import concluído', {
    jobId: job.data.jobId,
    sucesso: relatorio.sucesso,
    erros: relatorio.erros,
  });

  return relatorio;
}

export async function startImportacoesWorker(): Promise<void> {
  if (worker) return;
  if (process.env.REDIS_DISABLED === 'true' || !process.env.REDIS_URL) {
    console.warn('[importacoes] Worker BullMQ omitido — REDIS_URL ausente');
    return;
  }

  const connection = await createBullMQConnection();
  worker = new Worker<ImportarAcomodacoesJobData>(
    IMPORTACOES_QUEUE_NAME,
    async (job) => {
      if (job.name === JOB_IMPORTAR_ACOMODACOES) {
        return processImportJob(job);
      }
      throw new Error(`Job desconhecido: ${job.name}`);
    },
    { connection, concurrency: 1 },
  );

  worker.on('failed', (job, err) => {
    console.error('[importacoes] job falhou', {
      jobId: job?.id,
      error: err?.message,
    });
  });

  console.log('[importacoes] Worker BullMQ registrado ✓');
}

export async function stopImportacoesWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}

module.exports = {
  startImportacoesWorker,
  stopImportacoesWorker,
  processImportJob,
};
