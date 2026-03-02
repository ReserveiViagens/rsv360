const express = require('express');
const router = express.Router();
const googleHotelAdsController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');
const rateLimit = require('express-rate-limit');

/**
 * Rate limiting específico para feeds XML (mais restritivo)
 */
const feedXmlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 requisições por 15 minutos
  message: 'Too many requests for feed XML, please try again later.',
});

/**
 * Rotas públicas (feeds XML podem ser acessados publicamente)
 */

// Obter XML do feed (público, mas com rate limiting)
router.get('/feeds/:id/xml', feedXmlLimiter, googleHotelAdsController.getFeedXml);

/**
 * Rotas autenticadas
 */

// Feeds
router.get('/feeds', authenticateToken, googleHotelAdsController.listFeeds);
router.post('/feeds', authenticateToken, googleHotelAdsController.createFeed);
router.get('/feeds/:id', authenticateToken, googleHotelAdsController.getFeed);
router.put('/feeds/:id', authenticateToken, googleHotelAdsController.updateFeed);
router.delete('/feeds/:id', authenticateToken, googleHotelAdsController.deleteFeed);
router.post('/feeds/:id/generate', authenticateToken, googleHotelAdsController.generateFeed);
router.post('/feeds/:id/upload', authenticateToken, googleHotelAdsController.uploadFeed);

// Campanhas
router.get('/campaigns', authenticateToken, googleHotelAdsController.listCampaigns);
router.post('/campaigns', authenticateToken, googleHotelAdsController.createCampaign);
router.get('/campaigns/:id/metrics', authenticateToken, googleHotelAdsController.getCampaignMetrics);

module.exports = router;
