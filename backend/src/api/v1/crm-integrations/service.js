const { pool } = require('../../../../database/db');
const logger = require('../../../utils/logger');

/**
 * Service para integrações CRM
 */
class CRMIntegrationsService {
  /**
   * Listar clientes que participaram de um leilão
   */
  async getCustomersByAuctionParticipation(auctionId) {
    try {
      const query = `
        SELECT DISTINCT
          c.id,
          c.name,
          c.email,
          c.phone,
          COUNT(b.id) as total_bids,
          MAX(b.amount) as highest_bid,
          MAX(b.created_at) as last_bid_at
        FROM bids b
        INNER JOIN customers c ON b.customer_id = c.id
        WHERE b.auction_id = $1
        GROUP BY c.id, c.name, c.email, c.phone
        ORDER BY highest_bid DESC
      `;

      const result = await pool.query(query, [auctionId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting customers by auction participation:', error);
      throw error;
    }
  }

  /**
   * Listar clientes que reservaram um flash deal
   */
  async getCustomersByFlashDeal(flashDealId) {
    try {
      const query = `
        SELECT DISTINCT
          c.id,
          c.name,
          c.email,
          c.phone,
          COUNT(fdr.id) as total_reservations,
          SUM(fdr.total_amount) as total_spent,
          MAX(fdr.created_at) as last_reservation_at
        FROM flash_deal_reservations fdr
        INNER JOIN customers c ON fdr.customer_id = c.id
        WHERE fdr.flash_deal_id = $1
        GROUP BY c.id, c.name, c.email, c.phone
        ORDER BY total_spent DESC
      `;

      const result = await pool.query(query, [flashDealId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting customers by flash deal:', error);
      throw error;
    }
  }

  /**
   * Criar segmento baseado em participantes de leilão
   */
  async createSegmentFromAuction(auctionId, segmentName) {
    try {
      const customers = await this.getCustomersByAuctionParticipation(auctionId);
      const customerIds = customers.map(c => c.id);

      // TODO: Implementar criação de segmento no CRM
      // Por enquanto, retornar dados do segmento
      return {
        segment_name: segmentName,
        source_type: 'auction',
        source_id: auctionId,
        customer_count: customerIds.length,
        customer_ids: customerIds,
        customers: customers,
      };
    } catch (error) {
      logger.error('Error creating segment from auction:', error);
      throw error;
    }
  }

  /**
   * Criar segmento baseado em reservas de flash deal
   */
  async createSegmentFromFlashDeal(flashDealId, segmentName) {
    try {
      const customers = await this.getCustomersByFlashDeal(flashDealId);
      const customerIds = customers.map(c => c.id);

      // TODO: Implementar criação de segmento no CRM
      // Por enquanto, retornar dados do segmento
      return {
        segment_name: segmentName,
        source_type: 'flash_deal',
        source_id: flashDealId,
        customer_count: customerIds.length,
        customer_ids: customerIds,
        customers: customers,
      };
    } catch (error) {
      logger.error('Error creating segment from flash deal:', error);
      throw error;
    }
  }

  /**
   * Obter analytics de leilões para CRM
   */
  async getAuctionAnalytics(period) {
    try {
      const { start_date, end_date } = period;

      const query = `
        SELECT 
          a.id,
          a.title,
          a.status,
          COUNT(DISTINCT b.customer_id) as unique_participants,
          COUNT(b.id) as total_bids,
          AVG(b.amount) as avg_bid_amount,
          MAX(b.amount) as highest_bid,
          COUNT(CASE WHEN a.status = 'finished' AND a.winner_id IS NOT NULL THEN 1 END) as conversions
        FROM auctions a
        LEFT JOIN bids b ON a.id = b.auction_id
        WHERE a.created_at >= $1 AND a.created_at <= $2
        GROUP BY a.id, a.title, a.status
        ORDER BY total_bids DESC
      `;

      const result = await pool.query(query, [start_date, end_date]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting auction analytics:', error);
      throw error;
    }
  }

  /**
   * Obter analytics de flash deals para CRM
   */
  async getFlashDealAnalytics(period) {
    try {
      const { start_date, end_date } = period;

      const query = `
        SELECT 
          fd.id,
          fd.title,
          fd.status,
          COUNT(DISTINCT fdr.customer_id) as unique_customers,
          COUNT(fdr.id) as total_reservations,
          SUM(fdr.total_amount) as total_revenue,
          AVG(fdr.total_amount) as avg_reservation_value,
          AVG(fd.discount_percentage) as avg_discount
        FROM flash_deals fd
        LEFT JOIN flash_deal_reservations fdr ON fd.id = fdr.flash_deal_id
        WHERE fd.created_at >= $1 AND fd.created_at <= $2
        GROUP BY fd.id, fd.title, fd.status
        ORDER BY total_reservations DESC
      `;

      const result = await pool.query(query, [start_date, end_date]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting flash deal analytics:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de participação em leilões de um cliente
   */
  async getCustomerAuctionHistory(customerId) {
    try {
      const query = `
        SELECT 
          a.id,
          a.title,
          a.status,
          COUNT(b.id) as total_bids,
          MAX(b.amount) as highest_bid,
          MIN(b.created_at) as first_bid_at,
          MAX(b.created_at) as last_bid_at,
          CASE WHEN a.winner_id = $1 THEN true ELSE false END as is_winner
        FROM auctions a
        INNER JOIN bids b ON a.id = b.auction_id
        WHERE b.customer_id = $1
        GROUP BY a.id, a.title, a.status, a.winner_id
        ORDER BY last_bid_at DESC
      `;

      const result = await pool.query(query, [customerId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting customer auction history:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de flash deals de um cliente
   */
  async getCustomerFlashDealHistory(customerId) {
    try {
      const query = `
        SELECT 
          fd.id,
          fd.title,
          fd.status,
          fdr.total_amount,
          fdr.created_at as reservation_date,
          fd.discount_percentage
        FROM flash_deal_reservations fdr
        INNER JOIN flash_deals fd ON fdr.flash_deal_id = fd.id
        WHERE fdr.customer_id = $1
        ORDER BY fdr.created_at DESC
      `;

      const result = await pool.query(query, [customerId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting customer flash deal history:', error);
      throw error;
    }
  }
}

module.exports = new CRMIntegrationsService();
