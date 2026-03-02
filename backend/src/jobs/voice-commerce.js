const cron = require('node-cron');
const { pool } = require('../../database/db');
const logger = require('../utils/logger');

/**
 * Jobs para Voice Commerce
 */

/**
 * Job: Finalizar sessões abandonadas (a cada hora)
 * Cron: 0 * * * * (todo minuto 0 de cada hora)
 */
const finalizeAbandonedSessionsJob = cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Starting abandoned sessions finalization job...');

    // Buscar sessões ativas há mais de 1 hora sem atividade
    const query = `
      UPDATE voice_commerce_sessions
      SET status = 'abandoned', updated_at = NOW()
      WHERE status = 'active'
        AND updated_at < NOW() - INTERVAL '1 hour'
    `;

    const result = await pool.query(query);
    logger.info(`Finalized ${result.rowCount} abandoned sessions`);
  } catch (error) {
    logger.error('Error in finalizeAbandonedSessionsJob:', error);
  }
});

/**
 * Job: Processar gravações pendentes (a cada 30 minutos)
 * Cron: a cada 30 minutos
 */
const processPendingRecordingsJob = cron.schedule('*/30 * * * *', async () => {
  try {
    logger.info('Starting pending recordings processing job...');

    // TODO: Implementar processamento de gravações pendentes
    // Por enquanto, apenas logar
    logger.info('Pending recordings processing job completed (not implemented yet)');
  } catch (error) {
    logger.error('Error in processPendingRecordingsJob:', error);
  }
});

/**
 * Job: Gerar transcrições de chamadas finalizadas (a cada hora)
 * Cron: 0 * * * * (todo minuto 0 de cada hora)
 */
const generateTranscriptionsJob = cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Starting transcriptions generation job...');

    // Buscar chamadas finalizadas sem transcrição
    const query = `
      SELECT id, call_sid, audio_url
      FROM voice_commerce_calls
      WHERE status = 'completed'
        AND transcription IS NULL
        AND audio_url IS NOT NULL
      LIMIT 10
    `;

    const result = await pool.query(query);
    const calls = result.rows;

    logger.info(`Found ${calls.length} calls to transcribe`);

    // TODO: Implementar transcrição usando Twilio/Deepgram
    // Por enquanto, apenas logar
    for (const call of calls) {
      logger.info(`Would transcribe call ${call.id} (${call.call_sid})`);
    }
  } catch (error) {
    logger.error('Error in generateTranscriptionsJob:', error);
  }
});

// Iniciar jobs apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  finalizeAbandonedSessionsJob.start();
  processPendingRecordingsJob.start();
  generateTranscriptionsJob.start();
  logger.info('Voice Commerce jobs started');
}

module.exports = {
  finalizeAbandonedSessionsJob,
  processPendingRecordingsJob,
  generateTranscriptionsJob,
};
