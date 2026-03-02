const cron = require('node-cron');
const affiliatesService = require('../api/v1/affiliates/service');
const logger = require('../utils/logger');

/**
 * Jobs para Afiliados
 */

/**
 * Job: Calcular comissões recorrentes mensais (dia 1 de cada mês às 00:00)
 * Cron: 0 0 1 * * (todo dia 1 às 00:00)
 */
const calculateMonthlyCommissionsJob = cron.schedule('0 0 1 * *', async () => {
  try {
    logger.info('Starting monthly affiliate commissions calculation job...');

    // Buscar todos os afiliados ativos
    const { data: affiliates } = await affiliatesService.listAffiliates({
      status: 'active',
      limit: 1000,
    });

    logger.info(`Found ${affiliates.length} active affiliates`);

    // Período do mês anterior
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const period = {
      start_date: lastMonth.toISOString(),
      end_date: lastMonthEnd.toISOString(),
    };

    for (const affiliate of affiliates) {
      try {
        logger.info(`Calculating commissions for affiliate ${affiliate.id} (${affiliate.name})...`);

        // Calcular comissões do período
        const calculation = await affiliatesService.calculateCommission(affiliate.id, period);

        if (calculation.total_commission > 0) {
          // Criar registros de comissão para cada enterprise
          for (const commission of calculation.commissions) {
            await affiliatesService.createCommission(
              affiliate.id,
              commission.enterprise_id,
              commission.commission,
              period
            );
          }

          logger.info(
            `Created commissions for affiliate ${affiliate.id}: R$ ${calculation.total_commission.toFixed(2)}`
          );
        } else {
          logger.info(`No commissions for affiliate ${affiliate.id} in this period`);
        }
      } catch (error) {
        logger.error(`Error calculating commissions for affiliate ${affiliate.id}:`, error);
      }
    }

    logger.info('Monthly affiliate commissions calculation job completed');
  } catch (error) {
    logger.error('Error in calculateMonthlyCommissionsJob:', error);
  }
});

/**
 * Job: Processar payouts pendentes (diariamente às 08:00)
 * Cron: 0 8 * * * (todo dia às 08:00)
 */
const processPendingPayoutsJob = cron.schedule('0 8 * * *', async () => {
  try {
    logger.info('Starting pending payouts processing job...');

    // TODO: Implementar lógica para processar payouts pendentes
    // Por enquanto, apenas logar
    logger.info('Pending payouts processing job completed (not implemented yet)');
  } catch (error) {
    logger.error('Error in processPendingPayoutsJob:', error);
  }
});

/**
 * Job: Atualizar estatísticas de afiliados (diariamente às 02:00)
 * Cron: 0 2 * * * (todo dia às 02:00)
 */
const updateAffiliateStatsJob = cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Starting affiliate statistics update job...');

    // TODO: Implementar atualização de estatísticas
    // Por enquanto, apenas logar
    logger.info('Affiliate statistics update job completed (not implemented yet)');
  } catch (error) {
    logger.error('Error in updateAffiliateStatsJob:', error);
  }
});

// Iniciar jobs apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  calculateMonthlyCommissionsJob.start();
  processPendingPayoutsJob.start();
  updateAffiliateStatsJob.start();
  logger.info('Affiliates jobs started');
}

module.exports = {
  calculateMonthlyCommissionsJob,
  processPendingPayoutsJob,
  updateAffiliateStatsJob,
};
