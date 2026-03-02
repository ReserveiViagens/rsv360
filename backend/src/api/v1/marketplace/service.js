const { pool } = require('../../../../database/db');
const logger = require('../../../utils/logger');

/**
 * Service para gerenciar Marketplace
 */
class MarketplaceService {
  /**
   * Listar listagens com filtros
   */
  async listListings(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        enterprise_id,
        property_id,
        search,
      } = filters;

      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          ml.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name
        FROM marketplace_listings ml
        LEFT JOIN enterprises e ON ml.enterprise_id = e.id
        LEFT JOIN properties p ON ml.property_id = p.id
        LEFT JOIN accommodations acc ON ml.accommodation_id = acc.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND ml.status = $${paramCount}`;
        params.push(status);
      }

      if (enterprise_id) {
        paramCount++;
        query += ` AND ml.enterprise_id = $${paramCount}`;
        params.push(enterprise_id);
      }

      if (property_id) {
        paramCount++;
        query += ` AND ml.property_id = $${paramCount}`;
        params.push(property_id);
      }

      if (search) {
        paramCount++;
        query += ` AND (ml.title ILIKE $${paramCount} OR ml.description ILIKE $${paramCount})`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY ml.ranking_score DESC, ml.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      const listings = result.rows;

      // Buscar total
      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT ml.id) as total FROM').split('ORDER BY')[0];
      const countResult = await pool.query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0]?.total || 0);

      return {
        data: listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing marketplace listings:', error);
      throw error;
    }
  }

  /**
   * Buscar listagem por ID
   */
  async findListingById(id) {
    try {
      const query = `
        SELECT 
          ml.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name
        FROM marketplace_listings ml
        LEFT JOIN enterprises e ON ml.enterprise_id = e.id
        LEFT JOIN properties p ON ml.property_id = p.id
        LEFT JOIN accommodations acc ON ml.accommodation_id = acc.id
        WHERE ml.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding listing by ID:', error);
      throw error;
    }
  }

  /**
   * Criar nova listagem
   */
  async createListing(data) {
    try {
      const {
        enterprise_id,
        property_id,
        accommodation_id,
        title,
        description,
        base_price,
        commission_rate = 0.08, // 8% padrão
        images,
        amenities,
        created_by,
      } = data;

      // Calcular ranking score inicial
      const rankingScore = await this.calculateRankingScore({
        property_id,
        accommodation_id,
        base_price,
      });

      const query = `
        INSERT INTO marketplace_listings (
          enterprise_id, property_id, accommodation_id, title, description,
          base_price, commission_rate, images, amenities, ranking_score,
          status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11)
        RETURNING *
      `;

      const result = await pool.query(query, [
        enterprise_id,
        property_id,
        accommodation_id,
        title,
        description,
        base_price,
        commission_rate,
        JSON.stringify(images || []),
        JSON.stringify(amenities || []),
        rankingScore,
        created_by,
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating listing:', error);
      throw error;
    }
  }

  /**
   * Atualizar listagem
   */
  async updateListing(id, data) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 0;

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && key !== 'id') {
          paramCount++;
          if (key === 'images' || key === 'amenities') {
            fields.push(`${key} = $${paramCount}::jsonb`);
            values.push(JSON.stringify(data[key]));
          } else {
            fields.push(`${key} = $${paramCount}`);
            values.push(data[key]);
          }
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      paramCount++;
      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE marketplace_listings
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating listing:', error);
      throw error;
    }
  }

  /**
   * Aprovar listagem
   */
  async approveListing(id, approverId) {
    try {
      const listing = await this.findListingById(id);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'pending') {
        throw new Error('Only pending listings can be approved');
      }

      // Recalcular ranking score antes de aprovar
      const rankingScore = await this.calculateRankingScore({
        property_id: listing.property_id,
        accommodation_id: listing.accommodation_id,
        base_price: listing.base_price,
      });

      const query = `
        UPDATE marketplace_listings
        SET status = 'active', approved_at = NOW(), approved_by = $1, ranking_score = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;

      const result = await pool.query(query, [approverId, rankingScore, id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error approving listing:', error);
      throw error;
    }
  }

  /**
   * Rejeitar listagem
   */
  async rejectListing(id, reason, approverId) {
    try {
      const listing = await this.findListingById(id);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'pending') {
        throw new Error('Only pending listings can be rejected');
      }

      const query = `
        UPDATE marketplace_listings
        SET status = 'rejected', rejection_reason = $1, approved_by = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;

      const result = await pool.query(query, [reason, approverId, id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error rejecting listing:', error);
      throw error;
    }
  }

  /**
   * Calcular ranking score baseado em RevPAR, ocupação, reviews
   */
  async calculateRankingScore(data) {
    try {
      const { property_id, accommodation_id, base_price } = data;

      // Buscar métricas da propriedade/acomodação
      let revpar = 0;
      let occupancy = 0;
      let avgRating = 0;

      // TODO: Buscar dados reais de RevPAR, ocupação e reviews
      // Por enquanto, usar valores padrão baseados no preço
      if (base_price) {
        revpar = base_price * 0.7; // Estimativa
        occupancy = 0.75; // 75% estimado
        avgRating = 4.0; // Rating padrão
      }

      // Fórmula de ranking score (pesos ajustáveis)
      const score = (
        (revpar / 100) * 0.4 + // 40% peso no RevPAR
        occupancy * 0.3 + // 30% peso na ocupação
        (avgRating / 5) * 0.3 // 30% peso nas avaliações
      ) * 100;

      return Math.round(score * 100) / 100; // Arredondar para 2 casas decimais
    } catch (error) {
      logger.error('Error calculating ranking score:', error);
      return 50; // Score padrão em caso de erro
    }
  }

  /**
   * Criar pedido do marketplace
   */
  async createOrder(listingId, customerId, bookingData) {
    try {
      const listing = await this.findListingById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'active') {
        throw new Error('Only active listings can be ordered');
      }

      const {
        check_in,
        check_out,
        guests,
        total_amount,
      } = bookingData;

      // Calcular comissão (8%)
      const commissionAmount = total_amount * listing.commission_rate;

      const query = `
        INSERT INTO marketplace_orders (
          listing_id, customer_id, check_in, check_out, guests,
          total_amount, commission_rate, commission_amount, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING *
      `;

      const result = await pool.query(query, [
        listingId,
        customerId,
        check_in,
        check_out,
        guests,
        total_amount,
        listing.commission_rate,
        commissionAmount,
      ]);

      // Criar registro de comissão
      await this.createCommission(result.rows[0].id, commissionAmount);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Criar registro de comissão
   */
  async createCommission(orderId, amount) {
    try {
      const orderQuery = `
        SELECT listing_id, enterprise_id, commission_rate
        FROM marketplace_orders
        WHERE id = $1
      `;
      const orderResult = await pool.query(orderQuery, [orderId]);
      const order = orderResult.rows[0];

      if (!order) {
        throw new Error('Order not found');
      }

      const query = `
        INSERT INTO marketplace_commissions (
          order_id, enterprise_id, amount, status
        )
        VALUES ($1, $2, $3, 'pending')
        RETURNING *
      `;

      const result = await pool.query(query, [
        orderId,
        order.enterprise_id,
        amount,
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating commission:', error);
      throw error;
    }
  }

  /**
   * Listar pedidos
   */
  async listOrders(filters = {}) {
    try {
      const { page = 1, limit = 20, status, enterprise_id, customer_id } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          mo.*,
          ml.title as listing_title,
          e.name as enterprise_name
        FROM marketplace_orders mo
        LEFT JOIN marketplace_listings ml ON mo.listing_id = ml.id
        LEFT JOIN enterprises e ON ml.enterprise_id = e.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND mo.status = $${paramCount}`;
        params.push(status);
      }

      if (enterprise_id) {
        paramCount++;
        query += ` AND ml.enterprise_id = $${paramCount}`;
        params.push(enterprise_id);
      }

      if (customer_id) {
        paramCount++;
        query += ` AND mo.customer_id = $${paramCount}`;
        params.push(customer_id);
      }

      query += ` ORDER BY mo.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing orders:', error);
      throw error;
    }
  }

  /**
   * Listar comissões
   */
  async listCommissions(filters = {}) {
    try {
      const { page = 1, limit = 20, status, enterprise_id } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          mc.*,
          mo.total_amount as order_amount,
          ml.title as listing_title
        FROM marketplace_commissions mc
        LEFT JOIN marketplace_orders mo ON mc.order_id = mo.id
        LEFT JOIN marketplace_listings ml ON mo.listing_id = ml.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND mc.status = $${paramCount}`;
        params.push(status);
      }

      if (enterprise_id) {
        paramCount++;
        query += ` AND mc.enterprise_id = $${paramCount}`;
        params.push(enterprise_id);
      }

      query += ` ORDER BY mc.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing commissions:', error);
      throw error;
    }
  }
}

module.exports = new MarketplaceService();
