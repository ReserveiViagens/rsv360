const cron = require('node-cron');
const { pool } = require('../../database/db');
const auctionsService = require('../api/v1/auctions/service');
const { locks } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Jobs para gerenciar leilões automaticamente
 * Nota: notifyWinners verifica se winner_id e customers existem antes de executar
 */

/** Verifica se tabela auctions existe */
async function auctionsTableExists() {
  try {
    const result = await pool.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auctions')`);
    return result.rows[0]?.exists === true;
  } catch {
    return false;
  }
}

/** Verifica se auctions tem winner_id e customers existe (necessário para notifyWinners) */
async function canNotifyWinners() {
  try {
    const [winnerIdExists, customersExists] = await Promise.all([
      pool.query(`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auctions' AND column_name = 'winner_id')`),
      pool.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers')`),
    ]);
    return winnerIdExists.rows[0]?.exists && customersExists.rows[0]?.exists;
  } catch {
    return false;
  }
}

/**
 * Iniciar leilões agendados
 * Executa a cada minuto
 */
const startScheduledAuctions = cron.schedule('* * * * *', async () => {
  try {
    if (!(await auctionsTableExists())) return;
    const now = new Date();
    
    // Buscar leilões agendados que devem iniciar
    const query = `
      SELECT * FROM auctions
      WHERE status = 'scheduled'
        AND start_date <= $1
        AND start_date > $1 - INTERVAL '1 minute'
    `;

    const result = await pool.query(query, [now]);
    const auctions = result.rows;

    for (const auction of auctions) {
      try {
        await pool.query(
          'UPDATE auctions SET status = $1, updated_at = NOW() WHERE id = $2',
          ['active', auction.id]
        );

        // Invalidar cache
        const { cache } = require('../config/redis');
        await cache.delete(`auction:${auction.id}`);
        await cache.deletePattern('auctions:*');

        // Emitir evento WebSocket
        if (global.wsServer) {
          global.wsServer.emitToAll('auction:started', {
            id: auction.id,
            status: 'active',
          });
        }

        logger.info(`✅ Auction ${auction.id} started automatically`);
      } catch (error) {
        logger.error(`Error starting auction ${auction.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in startScheduledAuctions job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Finalizar leilões expirados
 * Executa a cada minuto
 */
const finishExpiredAuctions = cron.schedule('* * * * *', async () => {
  try {
    if (!(await auctionsTableExists())) return;
    const now = new Date();
    
    // Buscar leilões ativos que expiraram
    const query = `
      SELECT * FROM auctions
      WHERE status = 'active'
        AND end_date <= $1
    `;

    const result = await pool.query(query, [now]);
    const auctions = result.rows;

    for (const auction of auctions) {
      try {
        await auctionsService.finish(auction.id);

        // Emitir evento WebSocket
        if (global.wsServer) {
          global.wsServer.emitToAuction(auction.id, 'auction:finished', {
            id: auction.id,
            status: 'finished',
          });
        }

        logger.info(`✅ Auction ${auction.id} finished automatically`);
      } catch (error) {
        logger.error(`Error finishing auction ${auction.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in finishExpiredAuctions job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Limpar bloqueios temporários expirados
 * Executa a cada 5 minutos
 */
const cleanupExpiredLocks = cron.schedule('*/5 * * * *', async () => {
  try {
    // Os locks do Redis expiram automaticamente, mas podemos limpar manualmente
    // se necessário. Por enquanto, o Redis gerencia isso automaticamente.
    logger.debug('Cleanup expired locks job executed');
  } catch (error) {
    logger.error('Error in cleanupExpiredLocks job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Notificar vencedores de leilões finalizados
 * Executa a cada 5 minutos
 * Nota: Implementação de notificação pode ser adicionada posteriormente
 */
const notifyWinners = cron.schedule('*/5 * * * *', async () => {
  try {
    if (!(await canNotifyWinners())) return;
    // Buscar leilões finalizados recentemente com vencedores
    const query = `
      SELECT 
        a.*,
        c.email as winner_email,
        c.name as winner_name
      FROM auctions a
      INNER JOIN customers c ON a.winner_id = c.id
      WHERE a.status = 'finished'
        AND a.winner_id IS NOT NULL
        AND a.updated_at > NOW() - INTERVAL '10 minutes'
    `;

    const result = await pool.query(query);
    const auctions = result.rows;

    for (const auction of auctions) {
      try {
        // Aqui você pode enviar email, push notification, etc.
        // Por enquanto, apenas log
        logger.info(`📧 Winner notification for auction ${auction.id}: ${auction.winner_email}`);
        
        // TODO: Implementar envio de email/notificação
        // await emailService.sendWinnerNotification(auction);
      } catch (error) {
        logger.error(`Error notifying winner for auction ${auction.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in notifyWinners job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Iniciar todos os jobs
 */
const startJobs = () => {
  startScheduledAuctions.start();
  finishExpiredAuctions.start();
  cleanupExpiredLocks.start();
  notifyWinners.start();
  logger.info('✅ Auction jobs started');
};

/**
 * Parar todos os jobs
 */
const stopJobs = () => {
  startScheduledAuctions.stop();
  finishExpiredAuctions.stop();
  cleanupExpiredLocks.stop();
  notifyWinners.stop();
  logger.info('📴 Auction jobs stopped');
};

module.exports = {
  startJobs,
  stopJobs,
  startScheduledAuctions,
  finishExpiredAuctions,
  cleanupExpiredLocks,
  notifyWinners,
};
