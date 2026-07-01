import { Worker } from 'bullmq';
import { createBullMQConnection } from '../fornecedores-hub/redis-connection';
import {
  contarVisualizacoesSemAceite,
  revelarComparativo,
} from './objecao';
import { marcarExpirada } from './proposta-validade';
import {
  JOB_AVALIAR_OBJECAO,
  JOB_AVISO_EXPIRACAO,
  JOB_ENTREGAR_ROTEIRO,
  JOB_EXPIRAR_PROPOSTA,
  PROPOSTAS_QUEUE_NAME,
  type PropostasJobData,
} from './propostas.queue';
import { enviarAvisoExpiracaoSeNecessario } from './services/aviso-expiracao.service';
import { propostasService } from './services/propostas.service';
import { propostaRoomBroadcast } from './websocket/proposta-broadcast';
import {
  logPropostaAlert,
  recordPropostaExpirada,
  recordPropostaJobFailed,
} from './metrics';

let worker: Worker<PropostasJobData> | null = null;

const MIN_VISUALIZACOES = 3;

async function processAvaliarObjecao(job: { data: { propostaId: number } }) {
  const { propostaId } = job.data;
  const views = await contarVisualizacoesSemAceite(propostaId);
  if (views < MIN_VISUALIZACOES) {
    return { skipped: true, views };
  }
  const result = await revelarComparativo(propostaId, 'auto');
  return { revealed: Boolean(result), views };
}

export async function processExpirarProposta(job: { data: { propostaId: number } }) {
  const { propostaId } = job.data;
  const updated = await marcarExpirada(propostaId);

  if (!updated) {
    console.log('[propostas] expirar-proposta ignorado (fechada ou inexistente)', { propostaId });
    return { skipped: true, propostaId };
  }

  console.log('[propostas] proposta expirada automaticamente ✓', {
    propostaId,
    token: updated.tokenPublico,
  });

  await propostasService.logEvent(
    propostaId,
    'expirada',
    'Proposta expirada automaticamente',
  );
  recordPropostaExpirada('worker');

  const payload = {
    type: 'proposta:expirada',
    propostaId,
    token: updated.tokenPublico,
    status: 'expired',
  };

  propostaRoomBroadcast(propostaId, 'proposta:expirada', payload);
  if (updated.tokenPublico) {
    propostaRoomBroadcast(updated.tokenPublico, 'proposta:expirada', payload);
  }

  return { expired: true, propostaId };
}

export async function processAvisoExpiracao(job: { data: { propostaId: number } }) {
  const { propostaId } = job.data;
  return enviarAvisoExpiracaoSeNecessario(propostaId);
}

export async function processEntregarRoteiro(job: { data: { propostaId: number } }) {
  const { propostaId } = job.data;
  const { entregarLinkRoteiroPosCompra } = await import('./services/roteiro-entrega.service');
  return entregarLinkRoteiroPosCompra(propostaId);
}

export async function startPropostasWorker(): Promise<void> {
  if (worker) return;
  if (process.env.REDIS_DISABLED === 'true' || !process.env.REDIS_URL) {
    console.warn('[propostas] Worker BullMQ omitido — REDIS_URL ausente');
    return;
  }

  const connection = await createBullMQConnection();
  worker = new Worker<PropostasJobData>(
    PROPOSTAS_QUEUE_NAME,
    async (job) => {
      if (job.name === JOB_AVALIAR_OBJECAO) {
        return processAvaliarObjecao(job);
      }
      if (job.name === JOB_EXPIRAR_PROPOSTA) {
        return processExpirarProposta(job);
      }
      if (job.name === JOB_AVISO_EXPIRACAO) {
        return processAvisoExpiracao(job);
      }
      if (job.name === JOB_ENTREGAR_ROTEIRO) {
        return processEntregarRoteiro(job);
      }
      throw new Error(`Job desconhecido: ${job.name}`);
    },
    { connection, concurrency: 3 },
  );

  worker.on('failed', (job, err) => {
    const jobName = job?.name ?? 'unknown';
    recordPropostaJobFailed(jobName);
    if (jobName === JOB_AVISO_EXPIRACAO) {
      logPropostaAlert(
        'aviso_expiracao_job_failed',
        {
          propostaId: job?.data?.propostaId,
          jobId: job?.id,
          error: err?.message,
        },
        `[AvisoExpiracao] Job BullMQ falhou para proposta ${job?.data?.propostaId ?? '?'}`,
      );
    }
  });

  console.log('[propostas] Worker BullMQ (avaliar-objecao + expirar-proposta + aviso-expiracao + entregar-roteiro) registrado ✓');
}

export async function stopPropostasWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}

module.exports = {
  startPropostasWorker,
  stopPropostasWorker,
  processExpirarProposta,
  processAvisoExpiracao,
  processEntregarRoteiro,
};
