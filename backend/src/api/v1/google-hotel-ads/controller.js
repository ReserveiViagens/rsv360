const googleHotelAdsService = require('./service');
const logger = require('../../../utils/logger');
const { getRedisClient } = require('../../../config/redis');

/**
 * Controller para gerenciar Google Hotel Ads
 */

/**
 * Listar feeds
 */
const listFeeds = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      property_id: req.query.property_id,
    };

    const result = await googleHotelAdsService.listFeeds(filters);
    res.json(result);
  } catch (error) {
    logger.error('Error in listFeeds:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Criar feed
 */
const createFeed = async (req, res) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id,
    };

    const feed = await googleHotelAdsService.createFeed(data);
    res.status(201).json(feed);
  } catch (error) {
    logger.error('Error in createFeed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Obter feed por ID
 */
const getFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const feed = await googleHotelAdsService.findFeedById(id);

    if (!feed) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Feed not found',
      });
    }

    res.json(feed);
  } catch (error) {
    logger.error('Error in getFeed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Obter XML do feed
 */
const getFeedXml = async (req, res) => {
  try {
    const { id } = req.params;

    // Tentar buscar do cache primeiro
    const cacheKey = `google_hotel_ads_feed_${id}`;
    let cachedXml = null;
    try {
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        cachedXml = await redisClient.get(cacheKey);
      }
    } catch (cacheError) {
      // Ignorar erro de cache e continuar
    }

    if (cachedXml) {
      res.setHeader('Content-Type', 'application/xml');
      return res.send(cachedXml);
    }

    // Gerar XML se não estiver em cache
    const result = await googleHotelAdsService.generateFeed(id);
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(result.xml);
  } catch (error) {
    logger.error('Error in getFeedXml:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Atualizar feed
 */
const updateFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {
      ...req.body,
      updated_by: req.user?.id,
    };

    const feed = await googleHotelAdsService.updateFeed(id, data);
    
    if (!feed) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Feed not found',
      });
    }

    res.json(feed);
  } catch (error) {
    logger.error('Error in updateFeed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Deletar feed
 */
const deleteFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const feed = await googleHotelAdsService.deleteFeed(id);

    if (!feed) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Feed not found',
      });
    }

    res.json({ message: 'Feed deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteFeed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Gerar feed XML manualmente
 */
const generateFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body.options || {};

    const result = await googleHotelAdsService.generateFeed(id, options);
    res.json({
      message: 'Feed generated successfully',
      feed: result.feed,
      xml_length: result.xml.length,
    });
  } catch (error) {
    logger.error('Error in generateFeed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Upload feed para Google Hotel Center
 */
const uploadFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await googleHotelAdsService.uploadFeed(id);
    res.json(result);
  } catch (error) {
    logger.error('Error in uploadFeed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Listar campanhas
 */
const listCampaigns = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      feed_id: req.query.feed_id,
    };

    const campaigns = await googleHotelAdsService.listCampaigns(filters);
    res.json(campaigns);
  } catch (error) {
    logger.error('Error in listCampaigns:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Criar campanha
 */
const createCampaign = async (req, res) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id,
    };

    const campaign = await googleHotelAdsService.createCampaign(data);
    res.status(201).json(campaign);
  } catch (error) {
    logger.error('Error in createCampaign:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Obter métricas de campanha
 */
const getCampaignMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = await googleHotelAdsService.getCampaignMetrics(id);
    res.json(metrics);
  } catch (error) {
    logger.error('Error in getCampaignMetrics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = {
  listFeeds,
  createFeed,
  getFeed,
  getFeedXml,
  updateFeed,
  deleteFeed,
  generateFeed,
  uploadFeed,
  listCampaigns,
  createCampaign,
  getCampaignMetrics,
};
