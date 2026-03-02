const cron = require('node-cron');
const { pool } = require('../../database/db');
const flashDealsService = require('../api/v1/flash-deals/service');
const logger = require('../utils/logger');

/**
 * Jobs para gerenciar Flash Deals automaticamente
 * Nota: Jobs verificam se a tabela flash_deals existe antes de executar
 */

/** Verifica se a tabela flash_deals existe no banco */
async function flashDealsTableExists() {
  try {
    const result = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flash_deals')
    `);
    return result.rows[0]?.exists === true;
  } catch {
    return false;
  }
}

/**
 * Iniciar flash deals agendados
 * Executa a cada minuto
 */
const startScheduledFlashDeals = cron.schedule('* * * * *', async () => {
  try {
    if (!(await flashDealsTableExists())) return;
    const now = new Date();
    
    // Buscar flash deals agendados que devem iniciar
    const query = `
      SELECT * FROM flash_deals
      WHERE status = 'scheduled'
        AND start_date <= $1
        AND start_date > $1 - INTERVAL '1 minute'
    `;

    const result = await pool.query(query, [now]);
    const flashDeals = result.rows;

    for (const flashDeal of flashDeals) {
      try {
        await pool.query(
          'UPDATE flash_deals SET status = $1, updated_at = NOW() WHERE id = $2',
          ['active', flashDeal.id]
        );

        // Invalidar cache
        const { cache } = require('../config/redis');
        await cache.delete(`flash-deal:${flashDeal.id}`);
        await cache.deletePattern('flash-deals:*');

        // Emitir evento WebSocket
        if (global.wsServer) {
          global.wsServer.emitToAll('flash-deal:started', {
            id: flashDeal.id,
            status: 'active',
          });
        }

        logger.info(`✅ Flash deal ${flashDeal.id} started automatically`);
      } catch (error) {
        logger.error(`Error starting flash deal ${flashDeal.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in startScheduledFlashDeals job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Finalizar flash deals expirados
 * Executa a cada minuto
 */
const finishExpiredFlashDeals = cron.schedule('* * * * *', async () => {
  try {
    if (!(await flashDealsTableExists())) return;
    const now = new Date();
    
    // Buscar flash deals ativos que expiraram
    const query = `
      SELECT * FROM flash_deals
      WHERE status = 'active'
        AND end_date <= $1
    `;

    const result = await pool.query(query, [now]);
    const flashDeals = result.rows;

    for (const flashDeal of flashDeals) {
      try {
        await pool.query(
          'UPDATE flash_deals SET status = $1, updated_at = NOW() WHERE id = $2',
          ['expired', flashDeal.id]
        );

        // Invalidar cache
        const { cache } = require('../config/redis');
        await cache.delete(`flash-deal:${flashDeal.id}`);
        await cache.deletePattern('flash-deals:*');

        // Emitir evento WebSocket
        if (global.wsServer) {
          global.wsServer.emitToFlashDeal(flashDeal.id, 'flash-deal:expired', {
            id: flashDeal.id,
            status: 'expired',
          });
        }

        logger.info(`✅ Flash deal ${flashDeal.id} expired automatically`);
      } catch (error) {
        logger.error(`Error expiring flash deal ${flashDeal.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in finishExpiredFlashDeals job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Atualizar desconto progressivo
 * Executa a cada 5 minutos
 */
const updateDiscounts = cron.schedule('*/5 * * * *', async () => {
  try {
    if (!(await flashDealsTableExists())) return;
    const now = new Date();
    
    // Buscar flash deals ativos
    const query = `
      SELECT * FROM flash_deals
      WHERE status = 'active'
        AND start_date <= $1
        AND end_date > $1
    `;

    const result = await pool.query(query, [now]);
    const flashDeals = result.rows;

    for (const flashDeal of flashDeals) {
      try {
        await flashDealsService.updateDiscount(flashDeal.id);
      } catch (error) {
        logger.error(`Error updating discount for flash deal ${flashDeal.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in updateDiscounts job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Notificar sobre novos flash deals
 * Executa a cada hora
 */
const notifyNewFlashDeals = cron.schedule('0 * * * *', async () => {
  try {
    if (!(await flashDealsTableExists())) return;
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Buscar flash deals que vão começar na próxima hora
    const query = `
      SELECT * FROM flash_deals
      WHERE status = 'scheduled'
        AND start_date > $1
        AND start_date <= $2
    `;

    const result = await pool.query(query, [now, oneHourFromNow]);
    const flashDeals = result.rows;

    for (const flashDeal of flashDeals) {
      try {
        // Aqui você pode enviar email, push notification, etc.
        logger.info(`📧 New flash deal notification: ${flashDeal.id} starting soon`);
        
        // TODO: Implementar envio de notificações
        // await notificationService.sendFlashDealNotification(flashDeal);
      } catch (error) {
        logger.error(`Error notifying about flash deal ${flashDeal.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in notifyNewFlashDeals job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Iniciar todos os jobs
 */
const startJobs = () => {
  startScheduledFlashDeals.start();
  finishExpiredFlashDeals.start();
  updateDiscounts.start();
  notifyNewFlashDeals.start();
  logger.info('✅ Flash deals jobs started');
};

/**
 * Parar todos os jobs
 */
const stopJobs = () => {
  startScheduledFlashDeals.stop();
  finishExpiredFlashDeals.stop();
  updateDiscounts.stop();
  notifyNewFlashDeals.stop();
  logger.info('📴 Flash deals jobs stopped');
};

module.exports = {
  startJobs,
  stopJobs,
  startScheduledFlashDeals,
  finishExpiredFlashDeals,
  updateDiscounts,
  notifyNewFlashDeals,
};
