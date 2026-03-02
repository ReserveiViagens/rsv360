const cron = require('node-cron');
const { pool } = require('../../database/db');
const otaService = require('../api/v1/ota/service');
const logger = require('../utils/logger');

/**
 * Jobs para sincronização automática com OTAs
 */

/**
 * Sincronizar todas as conexões OTA ativas
 * Executa a cada 15 minutos (configurável por conexão)
 */
const syncAllConnections = cron.schedule('*/15 * * * *', async () => {
  try {
    const tableExists = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ota_connections')
    `);
    if (!tableExists.rows[0]?.exists) return;
    // Buscar todas as conexões OTA ativas com auto_sync habilitado
    const query = `
      SELECT * FROM ota_connections
      WHERE status = 'active'
        AND auto_sync = true
        AND (
          last_sync_at IS NULL
          OR last_sync_at < NOW() - INTERVAL '1 minute' * sync_frequency
        )
    `;

    const result = await pool.query(query);
    const connections = result.rows;

    logger.info(`🔄 Starting OTA sync for ${connections.length} connections`);

    for (const connection of connections) {
      try {
        // Sincronizar disponibilidade se habilitado
        if (connection.sync_availability) {
          await otaService.syncAvailability(connection.id);
          logger.info(`✅ Availability synced for OTA connection ${connection.id} (${connection.ota_name})`);
        }

        // Sincronizar reservas se habilitado
        if (connection.sync_reservations) {
          await otaService.syncReservations(connection.id);
          logger.info(`✅ Reservations synced for OTA connection ${connection.id} (${connection.ota_name})`);
        }
      } catch (error) {
        logger.error(`❌ Error syncing OTA connection ${connection.id}:`, error.message);
        
        // Marcar conexão como erro se falhar múltiplas vezes
        // TODO: Implementar contador de falhas
      }
    }

    logger.info(`✅ OTA sync completed for ${connections.length} connections`);
  } catch (error) {
    logger.error('Error in syncAllConnections job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Verificar status de conexões OTA
 * Executa a cada hora
 */
const checkConnectionStatus = cron.schedule('0 * * * *', async () => {
  try {
    const tableExists = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ota_connections')
    `);
    if (!tableExists.rows[0]?.exists) return;
    const query = 'SELECT * FROM ota_connections WHERE status = $1';
    const result = await pool.query(query, ['active']);
    const connections = result.rows;

    for (const connection of connections) {
      try {
        // Testar conexão
        const adapter = otaService.createAdapter(connection.ota_name, {
          otaName: connection.ota_name,
          apiKey: connection.api_key,
          apiSecret: connection.api_secret,
          propertyId: connection.property_id,
          accommodationId: connection.accommodation_id,
        });

        const isConnected = await adapter.testConnection();
        
        if (!isConnected && connection.status === 'active') {
          // Marcar como erro
          await pool.query(
            'UPDATE ota_connections SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
            ['error', 'Connection test failed', connection.id]
          );
          logger.warn(`⚠️ OTA connection ${connection.id} (${connection.ota_name}) marked as error`);
        } else if (isConnected && connection.status === 'error') {
          // Restaurar para ativo
          await pool.query(
            'UPDATE ota_connections SET status = $1, error_message = NULL, updated_at = NOW() WHERE id = $2',
            ['active', connection.id]
          );
          logger.info(`✅ OTA connection ${connection.id} (${connection.ota_name}) restored to active`);
        }
      } catch (error) {
        logger.error(`Error checking connection ${connection.id}:`, error.message);
      }
    }
  } catch (error) {
    logger.error('Error in checkConnectionStatus job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Limpar logs antigos
 * Executa diariamente às 2h
 */
const cleanupOldLogs = cron.schedule('0 2 * * *', async () => {
  try {
    // Deletar logs com mais de 90 dias
    const query = `
      DELETE FROM ota_sync_logs
      WHERE created_at < NOW() - INTERVAL '90 days'
    `;

    const result = await pool.query(query);
    logger.info(`🗑️ Cleaned up ${result.rowCount} old OTA sync logs`);
  } catch (error) {
    logger.error('Error in cleanupOldLogs job:', error);
  }
}, {
  scheduled: false,
});

/**
 * Iniciar todos os jobs
 */
const startJobs = () => {
  syncAllConnections.start();
  checkConnectionStatus.start();
  cleanupOldLogs.start();
  logger.info('✅ OTA sync jobs started');
};

/**
 * Parar todos os jobs
 */
const stopJobs = () => {
  syncAllConnections.stop();
  checkConnectionStatus.stop();
  cleanupOldLogs.stop();
  logger.info('📴 OTA sync jobs stopped');
};

module.exports = {
  startJobs,
  stopJobs,
  syncAllConnections,
  checkConnectionStatus,
  cleanupOldLogs,
};
