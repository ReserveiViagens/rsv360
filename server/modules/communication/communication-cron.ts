import { QueueService } from './services/queue.service';

let started = false;

export function startCommunicationCron() {
  if (started) return;
  started = true;

  setInterval(async () => {
    try {
      await QueueService.processQueue();
    } catch (err: any) {
      console.error('[COMM-CRON] Queue error:', err?.message || err);
    }
  }, 60_000);

  setInterval(async () => {
    try {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() < 5) {
        // Sem migration nova para purge avançado, apenas processa fila pendente.
        await QueueService.processQueue();
      }
    } catch (err: any) {
      console.error('[COMM-CRON] Daily maintenance error:', err?.message || err);
    }
  }, 300_000);

  console.info('[COMM-CRON] Communication cron jobs started');
}
