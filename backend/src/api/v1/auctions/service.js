const { pool } = require('../../../../database/db');
const { cache, locks } = require('../../../config/redis');
const logger = require('../../../utils/logger');
const warnedInTest = new Set();

function warnOnceInTest(key, ...args) {
  if (process.env.NODE_ENV !== 'test') {
    logger.warn(...args);
    return;
  }

  if (warnedInTest.has(key)) {
    return;
  }

  warnedInTest.add(key);
  logger.warn(...args);
}

/**
 * Service para gerenciar leilões
 */
class AuctionsService {
  /**
   * Listar leilões com filtros
   */
  async list(filters = {}) {
    try {
      // Verificar se tabela auctions existe
      const tableCheck = await pool.query(`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auctions')
      `);
      if (!tableCheck.rows[0]?.exists) {
        warnOnceInTest('auctions-table-missing', 'Tabela auctions não existe. Execute as migrations SQL (003_create_auctions_tables.sql)');
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }

      const {
        page = 1,
        limit = 20,
        status,
        enterprise_id,
        property_id,
        accommodation_id,
        search,
      } = filters;

      let query = `
        SELECT 
          a.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name,
          COUNT(b.id) as total_bids,
          MAX(b.amount) as highest_bid
        FROM auctions a
        LEFT JOIN enterprises e ON a.enterprise_id = e.id
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN accommodations acc ON a.accommodation_id = acc.id
        LEFT JOIN bids b ON a.id = b.auction_id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
      }

      if (enterprise_id) {
        paramCount++;
        query += ` AND a.enterprise_id = $${paramCount}`;
        params.push(enterprise_id);
      }

      if (property_id) {
        paramCount++;
        query += ` AND a.property_id = $${paramCount}`;
        params.push(property_id);
      }

      if (accommodation_id) {
        paramCount++;
        query += ` AND a.accommodation_id = $${paramCount}`;
        params.push(accommodation_id);
      }

      if (search) {
        paramCount++;
        query += ` AND (a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount})`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` GROUP BY a.id, e.name, p.name, acc.name ORDER BY a.created_at DESC`;

      // Contar total (query separada sem GROUP BY para evitar múltiplas linhas)
      let countQuery = `
        SELECT COUNT(*) as total FROM auctions a
        LEFT JOIN enterprises e ON a.enterprise_id = e.id
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN accommodations acc ON a.accommodation_id = acc.id
        WHERE 1=1
      `;
      const countParams = [];
      let countParamIdx = 0;
      if (status) { countParamIdx++; countQuery += ` AND a.status = $${countParamIdx}`; countParams.push(status); }
      if (enterprise_id) { countParamIdx++; countQuery += ` AND a.enterprise_id = $${countParamIdx}`; countParams.push(enterprise_id); }
      if (property_id) { countParamIdx++; countQuery += ` AND a.property_id = $${countParamIdx}`; countParams.push(property_id); }
      if (accommodation_id) { countParamIdx++; countQuery += ` AND a.accommodation_id = $${countParamIdx}`; countParams.push(accommodation_id); }
      if (search) { countParamIdx++; countQuery += ` AND (a.title ILIKE $${countParamIdx} OR a.description ILIKE $${countParamIdx})`; countParams.push(`%${search}%`); }

      // Adicionar paginação
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push((page - 1) * limit);

      let totalCount = 0;
      let result;

      try {
        const countResult = await pool.query(countQuery, countParams);
        totalCount = parseInt(countResult.rows[0]?.total || 0);
        result = await pool.query(query, params);
      } catch (queryErr) {
        // Fallback: tabelas/colunas auxiliares podem não existir ou schema diferente (leiloes vs 003)
        const isRecoverable = queryErr.message && (
          queryErr.message.includes('does not exist') ||
          queryErr.message.includes('relation') ||
          queryErr.message.includes('enterprises') ||
          queryErr.message.includes('properties') ||
          queryErr.message.includes('accommodations') ||
          queryErr.message.includes('bids') ||
          queryErr.message.includes('enterprise_id') ||
          queryErr.message.includes('start_price') ||
          queryErr.message.includes('column')
        );
        if (isRecoverable) {
          warnOnceInTest('auctions-list-fallback', 'Query completa de auctions falhou. Usando query simples:', queryErr.message);
          try {
            const simpleCount = await pool.query('SELECT COUNT(*) as total FROM auctions');
            totalCount = parseInt(simpleCount.rows[0]?.total || 0);
            const simpleResult = await pool.query(
              'SELECT * FROM auctions ORDER BY COALESCE(created_at, start_date) DESC NULLS LAST LIMIT $1 OFFSET $2',
              [limit, (page - 1) * limit]
            );
            const rows = simpleResult.rows.map(r => ({
              ...r,
              start_price: r.start_price ?? r.starting_price ?? r.current_price ?? 0,
              min_increment: r.min_increment ?? 10,
              enterprise_name: null,
              property_name: null,
              accommodation_name: null,
              total_bids: r.total_bids ?? 0,
              highest_bid: r.highest_bid ?? r.current_price,
            }));
            return {
              data: rows,
              pagination: { page: parseInt(page), limit: parseInt(limit), total: totalCount, totalPages: Math.ceil(totalCount / limit) },
            };
          } catch (simpleErr) {
            logger.error('Fallback query de auctions também falhou:', simpleErr.message);
            return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
          }
        }
        throw queryErr;
      }

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
      logger.error('Error listing auctions:', error);
      throw error;
    }
  }

  /**
   * Buscar leilão por ID
   */
  async findById(id) {
    try {
      const cacheKey = `auction:${id}`;
      
      // Tentar buscar do cache primeiro
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const query = `
        SELECT 
          a.*,
          e.name as enterprise_name,
          e.address_city,
          e.address_state,
          p.name as property_name,
          acc.name as accommodation_name,
          acc.max_guests,
          acc.images,
          COUNT(b.id) as total_bids,
          MAX(b.amount) as highest_bid
        FROM auctions a
        LEFT JOIN enterprises e ON a.enterprise_id = e.id
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN accommodations acc ON a.accommodation_id = acc.id
        LEFT JOIN bids b ON a.id = b.auction_id
        WHERE a.id = $1
        GROUP BY a.id, e.name, e.address_city, e.address_state, p.name, acc.name, acc.max_guests, acc.images
      `;

      const result = await pool.query(query, [id]);
      const auction = result.rows[0] || null;

      if (!auction) {
        return null;
      }

      // Cachear por 5 minutos
      await cache.set(cacheKey, auction, 300);

      return auction;
    } catch (error) {
      logger.error(`Error finding auction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Criar novo leilão
   */
  async create(auctionData) {
    try {
      const {
        enterprise_id,
        property_id,
        accommodation_id,
        title,
        description,
        start_price,
        min_increment,
        reserve_price,
        start_date,
        end_date,
        created_by,
      } = auctionData;

      // Validar datas
      const start = new Date(start_date);
      const end = new Date(end_date);
      const now = new Date();

      if (start < now) {
        throw new Error('Start date must be in the future');
      }

      if (end <= start) {
        throw new Error('End date must be after start date');
      }

      // Validar preços
      if (start_price <= 0) {
        throw new Error('Start price must be greater than 0');
      }

      if (min_increment <= 0) {
        throw new Error('Min increment must be greater than 0');
      }

      if (reserve_price && reserve_price < start_price) {
        throw new Error('Reserve price must be greater than or equal to start price');
      }

      const query = `
        INSERT INTO auctions (
          enterprise_id, property_id, accommodation_id, title, description,
          start_price, current_price, min_increment, reserve_price,
          start_date, end_date, status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        enterprise_id,
        property_id,
        accommodation_id,
        title,
        description,
        start_price,
        start_price, // current_price inicia igual ao start_price
        min_increment || 10.00,
        reserve_price || null,
        start,
        end,
        'scheduled',
        created_by,
      ];

      const result = await pool.query(query, values);
      const auction = result.rows[0];

      // Invalidar cache
      await cache.deletePattern('auctions:*');

      logger.info(`✅ Auction created: ${auction.id}`);
      return auction;
    } catch (error) {
      logger.error('Error creating auction:', error);
      throw error;
    }
  }

  /**
   * Atualizar leilão
   */
  async update(id, auctionData) {
    try {
      const auction = await this.findById(id);
      if (!auction) {
        throw new Error('Auction not found');
      }

      // Não permitir atualizar leilões ativos ou finalizados
      if (auction.status === 'active' || auction.status === 'finished') {
        throw new Error(`Cannot update auction with status: ${auction.status}`);
      }

      const fields = [];
      const values = [];
      let paramCount = 0;

      Object.keys(auctionData).forEach((key) => {
        if (auctionData[key] !== undefined) {
          paramCount++;
          fields.push(`${key} = $${paramCount}`);
          values.push(auctionData[key]);
        }
      });

      if (fields.length === 0) {
        return auction;
      }

      paramCount++;
      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE auctions 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const updated = result.rows[0];

      // Invalidar cache
      await cache.delete(`auction:${id}`);
      await cache.deletePattern('auctions:*');

      return updated;
    } catch (error) {
      logger.error(`Error updating auction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletar leilão
   */
  async delete(id) {
    try {
      const auction = await this.findById(id);
      if (!auction) {
        throw new Error('Auction not found');
      }

      // Não permitir deletar leilões ativos ou finalizados
      if (auction.status === 'active' || auction.status === 'finished') {
        throw new Error(`Cannot delete auction with status: ${auction.status}`);
      }

      await pool.query('DELETE FROM auctions WHERE id = $1', [id]);

      // Invalidar cache
      await cache.delete(`auction:${id}`);
      await cache.deletePattern('auctions:*');

      return true;
    } catch (error) {
      logger.error(`Error deleting auction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fazer lance em um leilão
   */
  async placeBid(auctionId, customerId, amount) {
    try {
      // Verificar lock temporário (5 minutos)
      const lockKey = `auction:${auctionId}:bid`;
      const hasLock = await locks.exists(lockKey);
      if (hasLock) {
        throw new Error('Auction is temporarily locked. Please try again in a few minutes.');
      }

      const auction = await this.findById(auctionId);
      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.status !== 'active') {
        throw new Error(`Auction is not active. Current status: ${auction.status}`);
      }

      // Verificar se leilão ainda está ativo (não expirou)
      const now = new Date();
      const endDate = new Date(auction.end_date);
      if (now > endDate) {
        throw new Error('Auction has ended');
      }

      // Validar lance
      const minBid = parseFloat(auction.current_price) + parseFloat(auction.min_increment);
      if (amount < minBid) {
        throw new Error(`Bid must be at least ${minBid.toFixed(2)}. Current price: ${auction.current_price}, Min increment: ${auction.min_increment}`);
      }

      // Usar transação para garantir consistência
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Criar lance
        const bidQuery = `
          INSERT INTO bids (auction_id, customer_id, amount, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING *
        `;
        const bidResult = await client.query(bidQuery, [auctionId, customerId, amount, 'accepted']);
        const bid = bidResult.rows[0];

        // Atualizar preço atual do leilão
        await client.query(
          'UPDATE auctions SET current_price = $1, updated_at = NOW() WHERE id = $2',
          [amount, auctionId]
        );

        // Marcar lance anterior como "outbid" (se houver)
        await client.query(
          `UPDATE bids 
           SET status = 'outbid', updated_at = NOW() 
           WHERE auction_id = $1 AND id != $2 AND status = 'accepted'`,
          [auctionId, bid.id]
        );

        await client.query('COMMIT');

        // Invalidar cache
        await cache.delete(`auction:${auctionId}`);
        await cache.deletePattern('auctions:*');

        logger.info(`✅ Bid placed: ${bid.id} for auction ${auctionId} by customer ${customerId}`);

        return bid;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error placing bid on auction ${auctionId}:`, error);
      throw error;
    }
  }

  /**
   * Listar lances de um leilão
   */
  async getBids(auctionId, filters = {}) {
    try {
      const { page = 1, limit = 50 } = filters;

      const query = `
        SELECT 
          b.*,
          c.name as customer_name,
          c.email as customer_email
        FROM bids b
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE b.auction_id = $1
        ORDER BY b.amount DESC, b.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = 'SELECT COUNT(*) as total FROM bids WHERE auction_id = $1';
      const countResult = await pool.query(countQuery, [auctionId]);
      const totalCount = parseInt(countResult.rows[0]?.total || 0);

      const result = await pool.query(query, [auctionId, limit, (page - 1) * limit]);
      const bids = result.rows;

      return {
        data: bids,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error(`Error getting bids for auction ${auctionId}:`, error);
      throw error;
    }
  }

  /**
   * Listar leilões ativos
   * @param {Object} filters - search, checkIn, checkOut, minPrice, maxPrice
   */
  async getActive(filters = {}) {
    try {
      const { search, checkIn, checkOut, minPrice, maxPrice } = filters;
      const hasFilters = !!(search || checkIn || checkOut || minPrice != null || maxPrice != null);
      const cacheKey = hasFilters ? `auctions:active:${JSON.stringify(filters)}` : 'auctions:active';
      
      // Usar cache apenas quando não há filtros (para evitar chaves excessivas)
      if (!hasFilters) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const now = new Date();
      const params = [now];
      let paramCount = 1;
      const conditions = [
        "a.status = 'active'",
        'a.start_date <= $1',
        'a.end_date > $1',
      ];

      if (search) {
        paramCount++;
        conditions.push(`(a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount})`);
        params.push(`%${search}%`);
      }
      if (checkIn) {
        paramCount++;
        conditions.push(`a.end_date >= $${paramCount}`);
        params.push(checkIn);
      }
      if (checkOut) {
        paramCount++;
        conditions.push(`a.start_date <= $${paramCount}`);
        params.push(checkOut);
      }
      if (minPrice != null && !Number.isNaN(minPrice)) {
        paramCount++;
        conditions.push(`a.current_price >= $${paramCount}`);
        params.push(minPrice);
      }
      if (maxPrice != null && !Number.isNaN(maxPrice)) {
        paramCount++;
        conditions.push(`a.current_price <= $${paramCount}`);
        params.push(maxPrice);
      }

      const whereClause = conditions.join(' AND ');
      
      // Query completa com JOINs (requer enterprise_id na tabela auctions)
      try {
        const query = `
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
          LEFT JOIN bids b ON a.id::text = b.auction_id::text
          WHERE ${whereClause}
          GROUP BY a.id, e.name, p.name, acc.name
          ORDER BY a.end_date ASC
        `;
        const result = await pool.query(query, params);
        const auctions = result.rows;
        if (!hasFilters) {
          await cache.set(cacheKey, auctions, 60);
        }
        return auctions;
      } catch (joinError) {
        // Fallback: query simples (schema antigo ou uuid/integer mismatch)
        const isRecoverable = joinError.message && (
          joinError.message.includes('enterprise_id') ||
          joinError.message.includes('não existe') ||
          joinError.message.includes('uuid = integer') ||
          joinError.message.includes('operator does not exist')
        );
        if (isRecoverable) {
          warnOnceInTest('auctions-active-fallback', 'Usando query simples (schema/join):', joinError.message);
          try {
            const simpleQuery = `SELECT * FROM auctions a WHERE ${whereClause} ORDER BY a.end_date ASC`;
            const simpleResult = await pool.query(simpleQuery, params);
            return simpleResult.rows.map((r) => ({
              ...r,
              total_bids: r.total_bids ?? 0,
              enterprise_name: r.enterprise_name ?? null,
              property_name: r.property_name ?? null,
              accommodation_name: r.accommodation_name ?? null,
            }));
          } catch (simpleErr) {
            logger.error('Fallback query also failed:', simpleErr.message);
            return [];
          }
        }
        throw joinError;
      }
    } catch (error) {
      logger.error('Error getting active auctions:', error);
      throw error;
    }
  }

  /**
   * Listar próximos leilões
   */
  async getUpcoming() {
    try {
      const now = new Date();
      const query = `
        SELECT 
          a.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name
        FROM auctions a
        LEFT JOIN enterprises e ON a.enterprise_id = e.id
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN accommodations acc ON a.accommodation_id = acc.id
        WHERE a.status = 'scheduled'
          AND a.start_date > $1
        ORDER BY a.start_date ASC
        LIMIT 20
      `;

      const result = await pool.query(query, [now]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting upcoming auctions:', error);
      throw error;
    }
  }

  /**
   * Dados para mapa: leilões ativos/agendados com coordenadas (id, title, lat, lng, status)
   */
  async getMapData() {
    try {
      const now = new Date();
      try {
        const query = `
          SELECT a.id, a.title, a.status, e.latitude as lat, e.longitude as lng
          FROM auctions a
          INNER JOIN enterprises e ON a.enterprise_id = e.id
          WHERE e.latitude IS NOT NULL AND e.longitude IS NOT NULL
            AND ((a.status = 'active' AND a.start_date <= $1 AND a.end_date > $1)
                 OR (a.status = 'scheduled' AND a.start_date > $1))
          ORDER BY CASE WHEN a.status = 'active' THEN 0 ELSE 1 END, a.end_date ASC
          LIMIT 100
        `;
        const result = await pool.query(query, [now]);
        return result.rows.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lng),
        }));
      } catch (joinErr) {
        if (joinErr.message && (joinErr.message.includes('enterprise_id') || joinErr.message.includes('não existe'))) {
          const simpleQuery = `
            SELECT id, title, status FROM auctions
            WHERE (status = 'active' AND start_date <= $1 AND end_date > $1)
               OR (status = 'scheduled' AND start_date > $1)
            ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, end_date ASC
            LIMIT 100
          `;
          const simpleResult = await pool.query(simpleQuery, [now]);
          const CALDAS_NOVAS = { lat: -17.7444, lng: -48.6278 };
          return simpleResult.rows.map((r) => ({
            id: r.id,
            title: r.title,
            status: r.status,
            lat: CALDAS_NOVAS.lat,
            lng: CALDAS_NOVAS.lng,
          }));
        }
        throw joinErr;
      }
    } catch (error) {
      logger.error('Error getting auction map data:', error);
      return [];
    }
  }

  /**
   * Listar leilões finalizados
   */
  async getFinished() {
    try {
      const now = new Date();
      const query = `
        SELECT 
          a.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name,
          c.name as winner_name,
          c.email as winner_email
        FROM auctions a
        LEFT JOIN enterprises e ON a.enterprise_id = e.id
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN accommodations acc ON a.accommodation_id = acc.id
        LEFT JOIN customers c ON a.winner_id = c.id
        WHERE a.status = 'finished'
           OR (a.status = 'active' AND a.end_date <= $1)
        ORDER BY a.end_date DESC
        LIMIT 50
      `;

      const result = await pool.query(query, [now]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting finished auctions:', error);
      throw error;
    }
  }

  /**
   * Finalizar leilão e identificar vencedor
   */
  async finish(auctionId) {
    try {
      const auction = await this.findById(auctionId);
      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.status === 'finished') {
        return auction; // Já finalizado
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Buscar maior lance válido
        const bidQuery = `
          SELECT * FROM bids
          WHERE auction_id = $1 AND status = 'accepted'
          ORDER BY amount DESC, created_at ASC
          LIMIT 1
        `;
        const bidResult = await client.query(bidQuery, [auctionId]);
        const winningBid = bidResult.rows[0];

        if (!winningBid) {
          // Nenhum lance válido - finalizar sem vencedor
          await client.query(
            'UPDATE auctions SET status = $1, updated_at = NOW() WHERE id = $2',
            ['finished', auctionId]
          );
        } else {
          // Atualizar leilão com vencedor
          await client.query(
            `UPDATE auctions 
             SET status = $1, winner_id = $2, winner_bid_id = $3, updated_at = NOW() 
             WHERE id = $4`,
            ['finished', winningBid.customer_id, winningBid.id, auctionId]
          );
        }

        await client.query('COMMIT');

        // Criar lock temporário (5 minutos) para pagamento
        if (winningBid) {
          const lockKey = `auction:${auctionId}:payment`;
          await locks.acquire(lockKey, 300); // 5 minutos
        }

        // Invalidar cache
        await cache.delete(`auction:${auctionId}`);
        await cache.deletePattern('auctions:*');

        logger.info(`✅ Auction ${auctionId} finished. Winner: ${winningBid?.customer_id || 'none'}, Bid: ${winningBid?.id || 'none'}`);

        return await this.findById(auctionId);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error finishing auction ${auctionId}:`, error);
      throw error;
    }
  }

  /**
   * Criar reserva após leilão ganho
   */
  async createBookingFromAuction(auctionId, paymentData) {
    try {
      const auction = await this.findById(auctionId);
      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.status !== 'finished' || !auction.winner_id) {
        throw new Error('Auction is not finished or has no winner');
      }

      // Verificar se já existe reserva
      const existingQuery = 'SELECT * FROM bookings WHERE auction_id = $1';
      const existingResult = await pool.query(existingQuery, [auctionId]);
      if (existingResult.rows.length > 0) {
        throw new Error('Booking already exists for this auction');
      }

      // Buscar dados da acomodação
      const accQuery = 'SELECT * FROM accommodations WHERE id = $1';
      const accResult = await pool.query(accQuery, [auction.accommodation_id]);
      const accommodation = accResult.rows[0];

      if (!accommodation) {
        throw new Error('Accommodation not found');
      }

      // Calcular datas (assumindo estadia de 1 noite por padrão)
      const checkIn = new Date(auction.end_date);
      checkIn.setDate(checkIn.getDate() + 1);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 1);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Criar reserva
        const bookingQuery = `
          INSERT INTO bookings (
            customer_id, enterprise_id, property_id, accommodation_id,
            check_in, check_out, guests, value, status, payment_status,
            payment_method, payment_transaction_id, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          RETURNING *
        `;
        const bookingValues = [
          auction.winner_id,
          auction.enterprise_id,
          auction.property_id,
          auction.accommodation_id,
          checkIn,
          checkOut,
          accommodation.max_guests || 2,
          auction.current_price,
          'confirmed',
          paymentData.status || 'paid',
          paymentData.method,
          paymentData.transaction_id,
          `Reserva criada automaticamente do leilão ${auctionId}`,
        ];
        const bookingResult = await client.query(bookingQuery, bookingValues);
        const booking = bookingResult.rows[0];

        // Atualizar disponibilidade
        const availabilityQuery = `
          INSERT INTO accommodation_availability (accommodation_id, date, available, booking_id, created_at)
          VALUES ($1, $2, false, $3, NOW())
          ON CONFLICT (accommodation_id, date)
          DO UPDATE SET available = false, booking_id = $3, updated_at = NOW()
        `;
        await client.query(availabilityQuery, [auction.accommodation_id, checkIn, booking.id]);

        await client.query('COMMIT');

        // Liberar lock de pagamento
        const lockKey = `auction:${auctionId}:payment`;
        await locks.release(lockKey);

        logger.info(`✅ Booking created from auction ${auctionId}: ${booking.id}`);

        return booking;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error creating booking from auction ${auctionId}:`, error);
      throw error;
    }
  }
}

module.exports = new AuctionsService();
