import { Worker } from 'bullmq';
import { liberarLock } from './lock';
import { createBullMQConnection } from './redis-connection';
import {
  JOB_EXPIRAR_LOCK,
  RESERVAS_QUEUE_NAME,
  type ExpirarLockJobData,
} from './reservas.queue';
import { reservasCotacaoService } from './services/reservas-cotacao.service';
import { propostaBroadcast } from '../propostas/websocket/proposta-broadcast';

let worker: Worker<ExpirarLockJobData> | null = null;

async function processExpirarLock(job: { data: ExpirarLockJobData }) {
  const { reservaId, chaveVaga, parceiroId } = job.data;
  const reserva = await reservasCotacaoService.findById(reservaId);

  if (!reserva) {
    return { skipped: true, reason: 'reserva_nao_encontrada' };
  }

  if (reserva.status === 'confirmada') {
    return { skipped: true, reason: 'ja_confirmada' };
  }

  if (reserva.status === 'cancelada') {
    return { skipped: true, reason: 'ja_cancelada' };
  }

  await liberarLock(chaveVaga, reservaId);
  await reservasCotacaoService.marcarCancelada(reservaId);

  propostaBroadcast(parceiroId, 'vaga:liberada', {
    parceiroId,
    chaveVaga,
    reservaId,
    motivo: 'lock_expirado',
  });

  return { released: true };
}

export async function startReservasWorker(): Promise<void> {
  if (worker) return;
  if (process.env.REDIS_DISABLED === 'true' || !process.env.REDIS_URL) {
    console.warn('[fornecedores-hub] Worker reservas omitido — REDIS_URL ausente');
    return;
  }

  const connection = await createBullMQConnection();
  worker = new Worker<ExpirarLockJobData>(
    RESERVAS_QUEUE_NAME,
    async (job) => {
      if (job.name !== JOB_EXPIRAR_LOCK) {
        throw new Error(`Job desconhecido: ${job.name}`);
      }
      return processExpirarLock(job);
    },
    { connection, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    console.error('[fornecedores-hub] expirar-lock falhou', job?.id, err.message);
  });

  console.log('[fornecedores-hub] Worker BullMQ reservas (expirar-lock) registrado ✓');
}

export async function stopReservasWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
