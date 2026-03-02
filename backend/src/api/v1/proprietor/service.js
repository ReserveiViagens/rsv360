const { pool } = require('../../../../database/db');
const { cache } = require('../../../config/redis');
const logger = require('../../../utils/logger');

/**
 * Service para dados do proprietário
 */
class ProprietorService {
  /**
   * Resolve o relacionamento de proprietário com enterprises para diferentes schemas.
   */
  async getEnterpriseIdsByOwner(userId) {
    const ownerColumns = ['owner_id', 'user_id', 'created_by'];

    for (const column of ownerColumns) {
      try {
        const query = `
          SELECT id
          FROM enterprises
          WHERE ${column} = $1
        `;
        const result = await pool.query(query, [userId]);
        if (result.rows.length > 0) {
          return result.rows.map((row) => row.id);
        }
      } catch (error) {
        if (error.message && error.message.includes(`column "${column}" does not exist`)) {
          continue;
        }
        throw error;
      }
    }

    return [];
  }

  /**
   * Obter estatísticas do dashboard
   */
  async getDashboardStats(userId) {
    try {
      const cacheKey = `proprietor:${userId}:dashboard:stats`;
      
      // Tentar buscar do cache primeiro
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const enterpriseIds = await this.getEnterpriseIdsByOwner(userId);

      if (enterpriseIds.length === 0) {
        // Retornar dados vazios se não houver enterprises
        return {
          occupancyRate: 0,
          revenueToday: 0,
          activeAuctions: 0,
          wonAuctions: 0,
          totalRevenue: 0,
          averageBidValue: 0,
          conversionRate: 0,
        };
      }

      // Calcular período (hoje)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Receita de hoje
      const revenueTodayQuery = `
        SELECT COALESCE(SUM(b.amount), 0) as revenue_today
        FROM bids b
        INNER JOIN auctions a ON b.auction_id = a.id
        WHERE a.enterprise_id = ANY($1::int[])
        AND b.status = 'accepted'
        AND b.created_at >= $2
        AND b.created_at <= $3
      `;
      const revenueTodayResult = await pool.query(revenueTodayQuery, [
        enterpriseIds,
        todayStart,
        todayEnd,
      ]);
      const revenueToday = parseFloat(revenueTodayResult.rows[0]?.revenue_today || 0);

      // Leilões ativos
      const activeAuctionsQuery = `
        SELECT COUNT(*) as count
        FROM auctions
        WHERE enterprise_id = ANY($1::int[])
        AND status = 'active'
      `;
      const activeAuctionsResult = await pool.query(activeAuctionsQuery, [enterpriseIds]);
      const activeAuctions = parseInt(activeAuctionsResult.rows[0]?.count || 0);

      // Leilões vencidos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const wonAuctionsQuery = `
        SELECT COUNT(*) as count
        FROM auctions
        WHERE enterprise_id = ANY($1::int[])
        AND status = 'finished'
        AND winner_id IS NOT NULL
        AND finished_at >= $2
      `;
      const wonAuctionsResult = await pool.query(wonAuctionsQuery, [enterpriseIds, thirtyDaysAgo]);
      const wonAuctions = parseInt(wonAuctionsResult.rows[0]?.count || 0);

      // Receita total (últimos 30 dias)
      const totalRevenueQuery = `
        SELECT COALESCE(SUM(b.amount), 0) as total_revenue
        FROM bids b
        INNER JOIN auctions a ON b.auction_id = a.id
        WHERE a.enterprise_id = ANY($1::int[])
        AND b.status = 'accepted'
        AND b.created_at >= $2
      `;
      const totalRevenueResult = await pool.query(totalRevenueQuery, [enterpriseIds, thirtyDaysAgo]);
      const totalRevenue = parseFloat(totalRevenueResult.rows[0]?.total_revenue || 0);

      // Valor médio de lance
      const avgBidQuery = `
        SELECT COALESCE(AVG(b.amount), 0) as avg_bid
        FROM bids b
        INNER JOIN auctions a ON b.auction_id = a.id
        WHERE a.enterprise_id = ANY($1::int[])
        AND b.created_at >= $2
      `;
      const avgBidResult = await pool.query(avgBidQuery, [enterpriseIds, thirtyDaysAgo]);
      const averageBidValue = parseFloat(avgBidResult.rows[0]?.avg_bid || 0);

      // Taxa de ocupação (simplificada - baseada em leilões finalizados vs total)
      const occupancyQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'finished' AND winner_id IS NOT NULL) as finished_with_winner,
          COUNT(*) as total
        FROM auctions
        WHERE enterprise_id = ANY($1::int[])
        AND created_at >= $2
      `;
      const occupancyResult = await pool.query(occupancyQuery, [enterpriseIds, thirtyDaysAgo]);
      const finishedWithWinner = parseInt(occupancyResult.rows[0]?.finished_with_winner || 0);
      const totalAuctions = parseInt(occupancyResult.rows[0]?.total || 0);
      const occupancyRate = totalAuctions > 0 ? Math.round((finishedWithWinner / totalAuctions) * 100) : 0;

      // Taxa de conversão (leilões com lances vs total)
      const conversionQuery = `
        SELECT 
          COUNT(DISTINCT a.id) FILTER (WHERE EXISTS (SELECT 1 FROM bids WHERE auction_id = a.id)) as with_bids,
          COUNT(*) as total
        FROM auctions a
        WHERE a.enterprise_id = ANY($1::int[])
        AND a.created_at >= $2
      `;
      const conversionResult = await pool.query(conversionQuery, [enterpriseIds, thirtyDaysAgo]);
      const withBids = parseInt(conversionResult.rows[0]?.with_bids || 0);
      const totalForConversion = parseInt(conversionResult.rows[0]?.total || 0);
      const conversionRate = totalForConversion > 0 ? Math.round((withBids / totalForConversion) * 100) : 0;

      const stats = {
        occupancyRate,
        revenueToday,
        activeAuctions,
        wonAuctions,
        totalRevenue,
        averageBidValue: Math.round(averageBidValue),
        conversionRate,
      };

      // Cachear por 5 minutos
      await cache.set(cacheKey, stats, 300);

      return stats;
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Obter leilões do proprietário
   */
  async getAuctions(userId, filters = {}) {
    try {
      const { status, page = 1, limit = 20 } = filters;

      const enterpriseIds = await this.getEnterpriseIdsByOwner(userId);

      if (enterpriseIds.length === 0) {
        return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }

      let query = `
        SELECT 
          a.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name,
          COUNT(b.id) as total_bids
        FROM auctions a
        LEFT JOIN enterprises e ON a.enterprise_id = e.id
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN accommodations acc ON a.accommodation_id = acc.id
        LEFT JOIN bids b ON a.id = b.auction_id
        WHERE a.enterprise_id = ANY($1::int[])
      `;
      const params = [enterpriseIds];
      let paramCount = 1;

      if (status) {
        paramCount++;
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
      }

      query += ` GROUP BY a.id, e.name, p.name, acc.name ORDER BY a.created_at DESC`;

      // Contar total
      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT a.id) as total FROM').split('ORDER BY')[0];
      const countResult = await pool.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0]?.total || 0);

      // Adicionar paginação
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push((page - 1) * limit);

      const result = await pool.query(query, params);
      const auctions = result.rows;

      return {
        data: auctions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting proprietor auctions:', error);
      throw error;
    }
  }

  /**
   * Obter receita do proprietário
   */
  async getRevenue(userId, period = '30d') {
    try {
      // Calcular período
      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default: // 30d
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const enterpriseIds = await this.getEnterpriseIdsByOwner(userId);

      if (enterpriseIds.length === 0) {
        return { total: 0, byDay: [] };
      }

      // Receita total
      const revenueQuery = `
        SELECT COALESCE(SUM(b.amount), 0) as total
        FROM bids b
        INNER JOIN auctions a ON b.auction_id = a.id
        WHERE a.enterprise_id = ANY($1::int[])
        AND b.status = 'accepted'
        AND b.created_at >= $2
      `;
      const revenueResult = await pool.query(revenueQuery, [enterpriseIds, startDate]);
      const total = parseFloat(revenueResult.rows[0]?.total || 0);

      // Receita por dia
      const revenueByDayQuery = `
        SELECT 
          DATE(b.created_at) as date,
          COALESCE(SUM(b.amount), 0) as revenue
        FROM bids b
        INNER JOIN auctions a ON b.auction_id = a.id
        WHERE a.enterprise_id = ANY($1::int[])
        AND b.status = 'accepted'
        AND b.created_at >= $2
        GROUP BY DATE(b.created_at)
        ORDER BY DATE(b.created_at)
      `;
      const revenueByDayResult = await pool.query(revenueByDayQuery, [enterpriseIds, startDate]);
      const byDay = revenueByDayResult.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
      }));

      return { total, byDay };
    } catch (error) {
      logger.error('Error getting proprietor revenue:', error);
      throw error;
    }
  }

  /**
   * Obter taxa de ocupação
   */
  async getOccupancy(userId, period = '30d') {
    try {
      // Similar ao getRevenue, mas para ocupação
      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const enterpriseIds = await this.getEnterpriseIdsByOwner(userId);

      if (enterpriseIds.length === 0) {
        return { rate: 0, byDay: [] };
      }

      const occupancyQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE status = 'finished' AND winner_id IS NOT NULL) as finished_with_winner,
          COUNT(*) as total
        FROM auctions
        WHERE enterprise_id = ANY($1::int[])
        AND created_at >= $2
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `;
      const occupancyResult = await pool.query(occupancyQuery, [enterpriseIds, startDate]);
      const byDay = occupancyResult.rows.map(row => ({
        date: row.date,
        rate: row.total > 0 ? Math.round((row.finished_with_winner / row.total) * 100) : 0,
      }));

      const overallRate = byDay.length > 0
        ? Math.round(byDay.reduce((sum, day) => sum + day.rate, 0) / byDay.length)
        : 0;

      return { rate: overallRate, byDay };
    } catch (error) {
      logger.error('Error getting proprietor occupancy:', error);
      throw error;
    }
  }

  /**
   * Obter tendências de receita
   */
  async getRevenueTrends(userId, period = '30d') {
    try {
      const revenue = await this.getRevenue(userId, period);
      return revenue.byDay;
    } catch (error) {
      logger.error('Error getting revenue trends:', error);
      throw error;
    }
  }

  /**
   * Obter tendências de ocupação
   */
  async getOccupancyTrends(userId, period = '30d') {
    try {
      const occupancy = await this.getOccupancy(userId, period);
      return occupancy.byDay;
    } catch (error) {
      logger.error('Error getting occupancy trends:', error);
      throw error;
    }
  }

  /**
   * Obter performance de leilões
   */
  async getAuctionPerformance(userId) {
    try {
      const enterpriseIds = await this.getEnterpriseIdsByOwner(userId);

      if (enterpriseIds.length === 0) {
        return {
          byStatus: [],
          wonVsLost: { won: 0, lost: 0 },
        };
      }

      const performanceQuery = `
        SELECT 
          status,
          COUNT(*) as count
        FROM auctions
        WHERE enterprise_id = ANY($1::int[])
        GROUP BY status
      `;
      const performanceResult = await pool.query(performanceQuery, [enterpriseIds]);
      const byStatus = performanceResult.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count),
      }));

      const wonVsLostQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'finished' AND winner_id IS NOT NULL) as won,
          COUNT(*) FILTER (WHERE status = 'finished' AND winner_id IS NULL) as lost
        FROM auctions
        WHERE enterprise_id = ANY($1::int[])
        AND status = 'finished'
      `;
      const wonVsLostResult = await pool.query(wonVsLostQuery, [enterpriseIds]);
      const wonVsLost = {
        won: parseInt(wonVsLostResult.rows[0]?.won || 0),
        lost: parseInt(wonVsLostResult.rows[0]?.lost || 0),
      };

      return { byStatus, wonVsLost };
    } catch (error) {
      logger.error('Error getting auction performance:', error);
      throw error;
    }
  }
}

module.exports = new ProprietorService();
