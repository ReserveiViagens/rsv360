const { pool } = require('../../../../database/db');
const { cache, getRedisClient } = require('../../../config/redis');
const logger = require('../../../utils/logger');
const GoogleHotelAdsXmlGenerator = require('../../../utils/google-hotel-ads-xml-generator');

/**
 * Service para gerenciar Google Hotel Ads
 */
class GoogleHotelAdsService {
  constructor() {
    this.xmlGenerator = new GoogleHotelAdsXmlGenerator();
  }

  /**
   * Listar feeds
   */
  async listFeeds(filters = {}) {
    try {
      // Verificar se a tabela existe
      const tableCheck = await pool.query(`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'google_hotel_ads_feeds')
      `);
      if (!tableCheck.rows[0]?.exists) {
        return { feeds: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }

      const { page = 1, limit = 20, status, property_id } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          f.*,
          p.name as property_name
        FROM google_hotel_ads_feeds f
        LEFT JOIN properties p ON f.property_id = p.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND f.status = $${paramCount}`;
        params.push(status);
      }

      if (property_id) {
        paramCount++;
        query += ` AND f.property_id = $${paramCount}`;
        params.push(property_id);
      }

      query += ` ORDER BY f.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      const feeds = result.rows;

      // Buscar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM google_hotel_ads_feeds f
        WHERE 1=1
        ${status ? `AND f.status = '${status}'` : ''}
        ${property_id ? `AND f.property_id = ${property_id}` : ''}
      `;
      const countResult = await pool.query(countQuery);
      const total = parseInt(countResult.rows[0].total);

      return {
        feeds,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing Google Hotel Ads feeds:', error);
      throw error;
    }
  }

  /**
   * Buscar feed por ID
   */
  async findFeedById(id) {
    try {
      const query = `
        SELECT 
          f.*,
          p.name as property_name
        FROM google_hotel_ads_feeds f
        LEFT JOIN properties p ON f.property_id = p.id
        WHERE f.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding feed by ID:', error);
      throw error;
    }
  }

  /**
   * Criar novo feed
   */
  async createFeed(data) {
    try {
      const {
        feed_name,
        property_id,
        status = 'active',
        generation_frequency = 60,
        auto_generate = true,
        created_by,
      } = data;

      const query = `
        INSERT INTO google_hotel_ads_feeds (
          feed_name, property_id, status, generation_frequency, 
          auto_generate, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await pool.query(query, [
        feed_name,
        property_id,
        status,
        generation_frequency,
        auto_generate,
        created_by,
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating feed:', error);
      throw error;
    }
  }

  /**
   * Atualizar feed
   */
  async updateFeed(id, data) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 0;

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) {
          paramCount++;
          fields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      paramCount++;
      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE google_hotel_ads_feeds
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating feed:', error);
      throw error;
    }
  }

  /**
   * Deletar feed
   */
  async deleteFeed(id) {
    try {
      const query = 'DELETE FROM google_hotel_ads_feeds WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting feed:', error);
      throw error;
    }
  }

  /**
   * Gerar feed XML
   */
  async generateFeed(feedId, options = {}) {
    try {
      const feed = await this.findFeedById(feedId);
      if (!feed) {
        throw new Error('Feed not found');
      }

      // Buscar propriedades e acomodações
      let propertiesQuery = `
        SELECT 
          p.*,
          e.name as enterprise_name,
          e.country,
          e.state
        FROM properties p
        LEFT JOIN enterprises e ON p.enterprise_id = e.id
      `;

      if (feed.property_id) {
        propertiesQuery += ` WHERE p.id = $1`;
      }

      const propertiesResult = await pool.query(
        propertiesQuery,
        feed.property_id ? [feed.property_id] : []
      );
      const properties = propertiesResult.rows;

      // Buscar acomodações para cada propriedade
      for (const property of properties) {
        const accommodationsQuery = `
          SELECT 
            a.*,
            (
              SELECT json_agg(json_build_object(
                'id', au.id,
                'title', au.title,
                'current_price', au.current_price,
                'start_price', au.start_price,
                'start_date', au.start_date,
                'end_date', au.end_date,
                'status', au.status,
                'discount_percentage', 
                  CASE 
                    WHEN au.start_price > 0 
                    THEN ROUND(((au.start_price - au.current_price) / au.start_price) * 100, 2)
                    ELSE 0
                  END
              ))
              FROM auctions au
              WHERE au.accommodation_id = a.id
              AND au.status = 'active'
              AND au.end_date > NOW()
            ) as active_auctions,
            (
              SELECT json_agg(json_build_object(
                'id', fd.id,
                'title', fd.title,
                'current_price', fd.current_price,
                'original_price', fd.original_price,
                'start_date', fd.start_date,
                'end_date', fd.end_date,
                'status', fd.status,
                'units_available', fd.units_available,
                'discount_percentage', fd.discount_percentage
              ))
              FROM flash_deals fd
              WHERE fd.accommodation_id = a.id
              AND fd.status = 'active'
              AND fd.end_date > NOW()
              AND fd.units_available > 0
            ) as active_flash_deals
          FROM accommodations a
          WHERE a.property_id = $1
          AND a.status = 'active'
        `;

        const accommodationsResult = await pool.query(accommodationsQuery, [property.id]);
        property.accommodations = accommodationsResult.rows;
      }

      // Gerar XML
      const xml = this.xmlGenerator.generateFeed(properties, {
        feedName: feed.feed_name,
        includeAuctions: true,
        includeFlashDeals: true,
      });

      // Validar XML
      const validation = this.xmlGenerator.validateFeed(xml);
      if (!validation.valid) {
        throw new Error(`Invalid XML: ${validation.errors.join(', ')}`);
      }

      // Atualizar feed com informações de geração
      await this.updateFeed(feedId, {
        last_generated_at: new Date(),
        total_properties: properties.length,
        total_rooms: properties.reduce((sum, p) => sum + (p.accommodations?.length || 0), 0),
        errors: null,
      });

      // Cachear XML (24 horas) - armazenar como string diretamente no Redis
      const cacheKey = `google_hotel_ads_feed_${feedId}`;
      try {
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isReady) {
          await redisClient.setEx(cacheKey, 86400, xml); // 24 horas, armazenar como string
        }
      } catch (cacheError) {
        logger.warn('Error caching XML feed:', cacheError.message);
      }

      return {
        xml,
        feed: {
          ...feed,
          last_generated_at: new Date(),
          total_properties: properties.length,
          total_rooms: properties.reduce((sum, p) => sum + (p.accommodations?.length || 0), 0),
        },
      };
    } catch (error) {
      logger.error('Error generating feed:', error);
      
      // Salvar erro no feed
      if (feedId) {
        await this.updateFeed(feedId, {
          errors: error.message,
          status: 'error',
        });
      }

      throw error;
    }
  }

  /**
   * Upload feed para Google Hotel Center (mock - implementar integração real)
   */
  async uploadFeed(feedId) {
    try {
      const feed = await this.findFeedById(feedId);
      if (!feed) {
        throw new Error('Feed not found');
      }

      // Tentar buscar do cache primeiro - buscar como string diretamente
      const cacheKey = `google_hotel_ads_feed_${feedId}`;
      let xml = null;
      try {
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isReady) {
          xml = await redisClient.get(cacheKey);
        }
      } catch (cacheError) {
        logger.warn('Error getting cached XML feed:', cacheError.message);
      }

      if (!xml) {
        const generated = await this.generateFeed(feedId);
        xml = generated.xml;
      }

      // TODO: Implementar upload real para Google Hotel Center
      // Por enquanto, apenas simular
      logger.info(`Uploading feed ${feedId} to Google Hotel Center...`);

      // Atualizar feed
      await this.updateFeed(feedId, {
        last_uploaded_at: new Date(),
        feed_url: `https://api.rsv360.com/google-hotel-ads/feeds/${feedId}/xml`,
        status: 'active',
      });

      return {
        success: true,
        feed_url: `https://api.rsv360.com/google-hotel-ads/feeds/${feedId}/xml`,
        uploaded_at: new Date(),
      };
    } catch (error) {
      logger.error('Error uploading feed:', error);
      throw error;
    }
  }

  /**
   * Listar campanhas
   */
  async listCampaigns(filters = {}) {
    try {
      // Verificar se a tabela existe
      const tableCheck = await pool.query(`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'google_hotel_ads_campaigns')
      `);
      if (!tableCheck.rows[0]?.exists) {
        return [];
      }

      const { page = 1, limit = 20, status, feed_id } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          c.*,
          f.feed_name
        FROM google_hotel_ads_campaigns c
        LEFT JOIN google_hotel_ads_feeds f ON c.feed_id = f.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
      }

      if (feed_id) {
        paramCount++;
        query += ` AND c.feed_id = $${paramCount}`;
        params.push(feed_id);
      }

      query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing campaigns:', error);
      throw error;
    }
  }

  /**
   * Criar campanha
   */
  async createCampaign(data) {
    try {
      const {
        feed_id,
        campaign_name,
        campaign_id,
        budget_daily,
        budget_monthly,
        target_countries,
        target_cities,
        status = 'active',
        start_date,
        end_date,
        created_by,
      } = data;

      const query = `
        INSERT INTO google_hotel_ads_campaigns (
          feed_id, campaign_name, campaign_id, budget_daily, budget_monthly,
          target_countries, target_cities, status, start_date, end_date, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const result = await pool.query(query, [
        feed_id,
        campaign_name,
        campaign_id,
        budget_daily,
        budget_monthly,
        target_countries || [],
        target_cities || [],
        status,
        start_date,
        end_date,
        created_by,
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Buscar métricas de campanha
   */
  async getCampaignMetrics(campaignId) {
    try {
      const query = `
        SELECT 
          impressions, clicks, conversions, cost, revenue
        FROM google_hotel_ads_campaigns
        WHERE id = $1
      `;
      const result = await pool.query(query, [campaignId]);
      
      const campaign = result.rows[0];
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Calcular métricas derivadas
      const ctr = campaign.impressions > 0 
        ? (campaign.clicks / campaign.impressions) * 100 
        : 0;
      const conversionRate = campaign.clicks > 0 
        ? (campaign.conversions / campaign.clicks) * 100 
        : 0;
      const cpc = campaign.clicks > 0 
        ? campaign.cost / campaign.clicks 
        : 0;
      const roas = campaign.cost > 0 
        ? campaign.revenue / campaign.cost 
        : 0;

      return {
        ...campaign,
        ctr: parseFloat(ctr.toFixed(2)),
        conversion_rate: parseFloat(conversionRate.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        roas: parseFloat(roas.toFixed(2)),
      };
    } catch (error) {
      logger.error('Error getting campaign metrics:', error);
      throw error;
    }
  }
}

module.exports = new GoogleHotelAdsService();
