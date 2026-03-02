const proprietorService = require('./service');
const logger = require('../../../utils/logger');

/**
 * Controller para rotas do proprietário
 */
class ProprietorController {
  /**
   * GET /api/v1/proprietor/dashboard/stats
   * Obter estatísticas do dashboard do proprietário
   */
  async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await proprietorService.getDashboardStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/proprietor/auctions
   * Obter leilões do proprietário
   */
  async getAuctions(req, res) {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 20 } = req.query;
      const auctions = await proprietorService.getAuctions(userId, { status, page, limit });
      res.json({ success: true, data: auctions });
    } catch (error) {
      logger.error('Error getting proprietor auctions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/proprietor/revenue
   * Obter dados de receita do proprietário
   */
  async getRevenue(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;
      const revenue = await proprietorService.getRevenue(userId, period);
      res.json({ success: true, data: revenue });
    } catch (error) {
      logger.error('Error getting proprietor revenue:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/proprietor/occupancy
   * Obter taxa de ocupação do proprietário
   */
  async getOccupancy(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;
      const occupancy = await proprietorService.getOccupancy(userId, period);
      res.json({ success: true, data: occupancy });
    } catch (error) {
      logger.error('Error getting proprietor occupancy:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/proprietor/revenue/trends
   * Obter tendências de receita
   */
  async getRevenueTrends(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;
      const trends = await proprietorService.getRevenueTrends(userId, period);
      res.json({ success: true, data: trends });
    } catch (error) {
      logger.error('Error getting revenue trends:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/proprietor/occupancy/trends
   * Obter tendências de ocupação
   */
  async getOccupancyTrends(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;
      const trends = await proprietorService.getOccupancyTrends(userId, period);
      res.json({ success: true, data: trends });
    } catch (error) {
      logger.error('Error getting occupancy trends:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/proprietor/auctions/performance
   * Obter performance de leilões
   */
  async getAuctionPerformance(req, res) {
    try {
      const userId = req.user.id;
      const performance = await proprietorService.getAuctionPerformance(userId);
      res.json({ success: true, data: performance });
    } catch (error) {
      logger.error('Error getting auction performance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ProprietorController();
