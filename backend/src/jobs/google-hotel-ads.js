const cron = require('node-cron');
const googleHotelAdsService = require('../api/v1/google-hotel-ads/service');
const logger = require('../utils/logger');

/**
 * Jobs para Google Hotel Ads
 */

/**
 * Job: Gerar feeds automaticamente (a cada hora)
 * Cron: 0 * * * * (todo minuto 0 de cada hora)
 */
const generateFeedsJob = cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Starting automatic feed generation job...');

    // Buscar feeds configurados para auto-geração
    const { feeds } = await googleHotelAdsService.listFeeds({
      status: 'active',
      limit: 1000,
    });

    const autoGenerateFeeds = feeds.filter(
      (feed) => feed.auto_generate === true
    );

    logger.info(`Found ${autoGenerateFeeds.length} feeds to generate`);

    for (const feed of autoGenerateFeeds) {
      try {
        // Verificar se precisa gerar (baseado na frequência)
        const now = new Date();
        const lastGenerated = feed.last_generated_at
          ? new Date(feed.last_generated_at)
          : null;

        if (lastGenerated) {
          const minutesSinceLastGeneration =
            (now - lastGenerated) / (1000 * 60);
          
          if (minutesSinceLastGeneration < feed.generation_frequency) {
            logger.info(
              `Skipping feed ${feed.id} - last generated ${minutesSinceLastGeneration.toFixed(0)} minutes ago`
            );
            continue;
          }
        }

        logger.info(`Generating feed ${feed.id} (${feed.feed_name})...`);
        await googleHotelAdsService.generateFeed(feed.id);
        logger.info(`Feed ${feed.id} generated successfully`);

        // Upload automático se configurado
        if (feed.auto_generate) {
          try {
            await googleHotelAdsService.uploadFeed(feed.id);
            logger.info(`Feed ${feed.id} uploaded successfully`);
          } catch (uploadError) {
            logger.error(`Error uploading feed ${feed.id}:`, uploadError);
          }
        }
      } catch (error) {
        logger.error(`Error generating feed ${feed.id}:`, error);
        // Continuar com próximo feed mesmo se houver erro
      }
    }

    logger.info('Automatic feed generation job completed');
  } catch (error) {
    logger.error('Error in generateFeedsJob:', error);
  }
});

/**
 * Job: Upload automático de feeds atualizados (a cada 30 minutos)
 * Cron: a cada 30 minutos
 */
const uploadFeedsJob = cron.schedule('*/30 * * * *', async () => {
  try {
    logger.info('Starting automatic feed upload job...');

    // Buscar feeds que foram gerados mas não foram uploadados recentemente
    const { feeds } = await googleHotelAdsService.listFeeds({
      status: 'active',
      limit: 1000,
    });

    const feedsToUpload = feeds.filter((feed) => {
      if (!feed.last_generated_at) return false;
      if (!feed.last_uploaded_at) return true;

      const lastGenerated = new Date(feed.last_generated_at);
      const lastUploaded = new Date(feed.last_uploaded_at);

      // Uploadar se foi gerado após último upload
      return lastGenerated > lastUploaded;
    });

    logger.info(`Found ${feedsToUpload.length} feeds to upload`);

    for (const feed of feedsToUpload) {
      try {
        logger.info(`Uploading feed ${feed.id} (${feed.feed_name})...`);
        await googleHotelAdsService.uploadFeed(feed.id);
        logger.info(`Feed ${feed.id} uploaded successfully`);
      } catch (error) {
        logger.error(`Error uploading feed ${feed.id}:`, error);
      }
    }

    logger.info('Automatic feed upload job completed');
  } catch (error) {
    logger.error('Error in uploadFeedsJob:', error);
  }
});

/**
 * Job: Sincronizar métricas de campanhas (a cada 6 horas)
 * Cron: a cada 6 horas
 */
const syncCampaignMetricsJob = cron.schedule('0 */6 * * *', async () => {
  try {
    logger.info('Starting campaign metrics sync job...');

    // Buscar campanhas ativas
    const campaigns = await googleHotelAdsService.listCampaigns({
      status: 'active',
      limit: 1000,
    });

    logger.info(`Found ${campaigns.length} active campaigns to sync`);

    for (const campaign of campaigns) {
      try {
        // TODO: Implementar sincronização real com Google Ads API
        // Por enquanto, apenas logar
        logger.info(
          `Syncing metrics for campaign ${campaign.id} (${campaign.campaign_name})...`
        );

        // Exemplo de como seria a sincronização:
        // const metrics = await googleAdsApi.getCampaignMetrics(campaign.campaign_id);
        // await googleHotelAdsService.updateCampaignMetrics(campaign.id, metrics);
      } catch (error) {
        logger.error(`Error syncing campaign ${campaign.id}:`, error);
      }
    }

    logger.info('Campaign metrics sync job completed');
  } catch (error) {
    logger.error('Error in syncCampaignMetricsJob:', error);
  }
});

// Iniciar jobs apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  generateFeedsJob.start();
  uploadFeedsJob.start();
  syncCampaignMetricsJob.start();
  logger.info('Google Hotel Ads jobs started');
}

module.exports = {
  generateFeedsJob,
  uploadFeedsJob,
  syncCampaignMetricsJob,
};
