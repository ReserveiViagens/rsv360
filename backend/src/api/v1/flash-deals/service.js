const { pool } = require('../../../../database/db');
const { cache } = require('../../../config/redis');
const logger = require('../../../utils/logger');

/**
 * Service para gerenciar Flash Deals
 */
class FlashDealsService {
  /**
   * Listar flash deals com filtros
   */
  async list(filters = {}) {
    try {
      // Verificar se a tabela existe
      const tableCheck = await pool.query(`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flash_deals')
      `);
      if (!tableCheck.rows[0]?.exists) {
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
          fd.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name
        FROM flash_deals fd
        LEFT JOIN enterprises e ON fd.enterprise_id = e.id
        LEFT JOIN properties p ON fd.property_id = p.id
        LEFT JOIN accommodations acc ON fd.accommodation_id = acc.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND fd.status = $${paramCount}`;
        params.push(status);
      }

      if (enterprise_id) {
        paramCount++;
        query += ` AND fd.enterprise_id = $${paramCount}`;
        params.push(enterprise_id);
      }

      if (property_id) {
        paramCount++;
        query += ` AND fd.property_id = $${paramCount}`;
        params.push(property_id);
      }

      if (accommodation_id) {
        paramCount++;
        query += ` AND fd.accommodation_id = $${paramCount}`;
        params.push(accommodation_id);
      }

      if (search) {
        paramCount++;
        query += ` AND (fd.title ILIKE $${paramCount} OR fd.description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY fd.created_at DESC`;

      // Contar total
      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT fd.id) as total FROM').split('ORDER BY')[0];
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
      const flashDeals = result.rows;

      return {
        data: flashDeals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing flash deals:', error);
      throw error;
    }
  }

  /**
   * Buscar flash deal por ID
   */
  async findById(id) {
    try {
      const cacheKey = `flash-deal:${id}`;
      
      // Tentar buscar do cache primeiro
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const query = `
        SELECT 
          fd.*,
          e.name as enterprise_name,
          e.address_city,
          e.address_state,
          p.name as property_name,
          acc.name as accommodation_name,
          acc.max_guests,
          acc.images
        FROM flash_deals fd
        LEFT JOIN enterprises e ON fd.enterprise_id = e.id
        LEFT JOIN properties p ON fd.property_id = p.id
        LEFT JOIN accommodations acc ON fd.accommodation_id = acc.id
        WHERE fd.id = $1
      `;

      const result = await pool.query(query, [id]);
      const flashDeal = result.rows[0] || null;

      if (!flashDeal) {
        return null;
      }

      // Calcular preço atual baseado no desconto
      flashDeal.current_price = this.calculateCurrentPrice(flashDeal);

      // Cachear por 1 minuto
      await cache.set(cacheKey, flashDeal, 60);

      return flashDeal;
    } catch (error) {
      logger.error(`Error finding flash deal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calcular preço atual baseado no desconto progressivo
   */
  calculateCurrentPrice(flashDeal) {
    const originalPrice = parseFloat(flashDeal.original_price);
    const discountPercent = flashDeal.discount_percentage || 0;
    const currentPrice = originalPrice * (1 - discountPercent / 100);
    return Math.round(currentPrice * 100) / 100; // Arredondar para 2 casas decimais
  }

  /**
   * Criar novo flash deal
   */
  async create(flashDealData) {
    try {
      const {
        enterprise_id,
        property_id,
        accommodation_id,
        title,
        description,
        original_price,
        discount_percentage = 0,
        max_discount,
        discount_increment = 5,
        increment_interval = 60,
        units_available,
        start_date,
        end_date,
        created_by,
      } = flashDealData;

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
      if (original_price <= 0) {
        throw new Error('Original price must be greater than 0');
      }

      if (max_discount && (max_discount < 0 || max_discount > 100)) {
        throw new Error('Max discount must be between 0 and 100');
      }

      if (units_available <= 0) {
        throw new Error('Units available must be greater than 0');
      }

      const currentPrice = this.calculateCurrentPrice({
        original_price,
        discount_percentage,
      });

      const query = `
        INSERT INTO flash_deals (
          enterprise_id, property_id, accommodation_id, title, description,
          original_price, current_price, discount_percentage, max_discount,
          discount_increment, increment_interval, units_available, units_sold,
          start_date, end_date, status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        enterprise_id,
        property_id,
        accommodation_id,
        title,
        description,
        original_price,
        currentPrice,
        discount_percentage,
        max_discount || 50,
        discount_increment,
        increment_interval,
        units_available,
        0, // units_sold inicia em 0
        start,
        end,
        'scheduled',
        created_by,
      ];

      const result = await pool.query(query, values);
      const flashDeal = result.rows[0];

      // Invalidar cache
      await cache.deletePattern('flash-deals:*');

      logger.info(`✅ Flash deal created: ${flashDeal.id}`);
      return flashDeal;
    } catch (error) {
      logger.error('Error creating flash deal:', error);
      throw error;
    }
  }

  /**
   * Atualizar flash deal
   */
  async update(id, flashDealData) {
    try {
      const flashDeal = await this.findById(id);
      if (!flashDeal) {
        throw new Error('Flash deal not found');
      }

      // Não permitir atualizar flash deals ativos ou esgotados
      if (flashDeal.status === 'active' || flashDeal.status === 'sold_out') {
        throw new Error(`Cannot update flash deal with status: ${flashDeal.status}`);
      }

      const fields = [];
      const values = [];
      let paramCount = 0;

      Object.keys(flashDealData).forEach((key) => {
        if (flashDealData[key] !== undefined && key !== 'current_price') {
          paramCount++;
          fields.push(`${key} = $${paramCount}`);
          values.push(flashDealData[key]);
        }
      });

      if (fields.length === 0) {
        return flashDeal;
      }

      // Recalcular preço atual se desconto mudou
      if (flashDealData.discount_percentage !== undefined) {
        const updatedDeal = { ...flashDeal, ...flashDealData };
        const newCurrentPrice = this.calculateCurrentPrice(updatedDeal);
        paramCount++;
        fields.push(`current_price = $${paramCount}`);
        values.push(newCurrentPrice);
      }

      paramCount++;
      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE flash_deals 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const updated = result.rows[0];

      // Invalidar cache
      await cache.delete(`flash-deal:${id}`);
      await cache.deletePattern('flash-deals:*');

      return updated;
    } catch (error) {
      logger.error(`Error updating flash deal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletar flash deal
   */
  async delete(id) {
    try {
      const flashDeal = await this.findById(id);
      if (!flashDeal) {
        throw new Error('Flash deal not found');
      }

      // Não permitir deletar flash deals ativos ou esgotados
      if (flashDeal.status === 'active' || flashDeal.status === 'sold_out') {
        throw new Error(`Cannot delete flash deal with status: ${flashDeal.status}`);
      }

      await pool.query('DELETE FROM flash_deals WHERE id = $1', [id]);

      // Invalidar cache
      await cache.delete(`flash-deal:${id}`);
      await cache.deletePattern('flash-deals:*');

      return true;
    } catch (error) {
      logger.error(`Error deleting flash deal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Listar flash deals ativos
   */
  async getActive() {
    try {
      const cacheKey = 'flash-deals:active';
      
      // Tentar buscar do cache primeiro
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const now = new Date();
      const query = `
        SELECT 
          fd.*,
          e.name as enterprise_name,
          p.name as property_name,
          acc.name as accommodation_name
        FROM flash_deals fd
        LEFT JOIN enterprises e ON fd.enterprise_id = e.id
        LEFT JOIN properties p ON fd.property_id = p.id
        LEFT JOIN accommodations acc ON fd.accommodation_id = acc.id
        WHERE fd.status = 'active'
          AND fd.start_date <= $1
          AND fd.end_date > $1
          AND fd.units_sold < fd.units_available
        ORDER BY fd.end_date ASC
      `;

      const result = await pool.query(query, [now]);
      const flashDeals = result.rows.map(fd => ({
        ...fd,
        current_price: this.calculateCurrentPrice(fd),
      }));

      // Cachear por 1 minuto
      await cache.set(cacheKey, flashDeals, 60);

      return flashDeals;
    } catch (error) {
      logger.error('Error getting active flash deals:', error);
      throw error;
    }
  }

  /**
   * Reservar flash deal
   */
  async reserve(flashDealId, customerId, paymentData) {
    try {
      const flashDeal = await this.findById(flashDealId);
      if (!flashDeal) {
        throw new Error('Flash deal not found');
      }

      if (flashDeal.status !== 'active') {
        throw new Error(`Flash deal is not active. Current status: ${flashDeal.status}`);
      }

      // Verificar se ainda está ativo
      const now = new Date();
      const endDate = new Date(flashDeal.end_date);
      if (now > endDate) {
        throw new Error('Flash deal has expired');
      }

      // Verificar disponibilidade
      if (flashDeal.units_sold >= flashDeal.units_available) {
        throw new Error('Flash deal is sold out');
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Verificar disponibilidade novamente (lock)
        const checkQuery = 'SELECT units_sold, units_available FROM flash_deals WHERE id = $1 FOR UPDATE';
        const checkResult = await client.query(checkQuery, [flashDealId]);
        const currentDeal = checkResult.rows[0];

        if (currentDeal.units_sold >= currentDeal.units_available) {
          throw new Error('Flash deal is sold out');
        }

        // Atualizar unidades vendidas
        const newUnitsSold = currentDeal.units_sold + 1;
        const newStatus = newUnitsSold >= currentDeal.units_available ? 'sold_out' : 'active';

        await client.query(
          'UPDATE flash_deals SET units_sold = $1, status = $2, updated_at = NOW() WHERE id = $3',
          [newUnitsSold, newStatus, flashDealId]
        );

        // Buscar dados da acomodação
        const accQuery = 'SELECT * FROM accommodations WHERE id = $1';
        const accResult = await client.query(accQuery, [flashDeal.accommodation_id]);
        const accommodation = accResult.rows[0];

        if (!accommodation) {
          throw new Error('Accommodation not found');
        }

        // Calcular datas (assumindo estadia de 1 noite por padrão)
        const checkIn = new Date(flashDeal.end_date);
        checkIn.setDate(checkIn.getDate() + 1);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 1);

        const currentPrice = this.calculateCurrentPrice(flashDeal);

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
          customerId,
          flashDeal.enterprise_id,
          flashDeal.property_id,
          flashDeal.accommodation_id,
          checkIn,
          checkOut,
          accommodation.max_guests || 2,
          currentPrice,
          'confirmed',
          paymentData.status || 'paid',
          paymentData.method,
          paymentData.transaction_id,
          `Reserva criada automaticamente do flash deal ${flashDealId}`,
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
        await client.query(availabilityQuery, [flashDeal.accommodation_id, checkIn, booking.id]);

        await client.query('COMMIT');

        // Invalidar cache
        await cache.delete(`flash-deal:${flashDealId}`);
        await cache.deletePattern('flash-deals:*');

        logger.info(`✅ Flash deal reserved: ${flashDealId} by customer ${customerId}, booking: ${booking.id}`);

        return booking;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error reserving flash deal ${flashDealId}:`, error);
      throw error;
    }
  }

  /**
   * Atualizar desconto progressivo
   */
  async updateDiscount(flashDealId) {
    try {
      const flashDeal = await this.findById(flashDealId);
      if (!flashDeal) {
        return;
      }

      if (flashDeal.status !== 'active') {
        return;
      }

      // Verificar se é hora de incrementar desconto
      const now = new Date();
      const startDate = new Date(flashDeal.start_date);
      const minutesElapsed = Math.floor((now - startDate) / (1000 * 60));
      const intervalsElapsed = Math.floor(minutesElapsed / (flashDeal.increment_interval || 60));

      const newDiscount = Math.min(
        (flashDeal.discount_percentage || 0) + (intervalsElapsed * (flashDeal.discount_increment || 5)),
        flashDeal.max_discount || 50
      );

      if (newDiscount > flashDeal.discount_percentage) {
        const newCurrentPrice = this.calculateCurrentPrice({
          ...flashDeal,
          discount_percentage: newDiscount,
        });

        await pool.query(
          `UPDATE flash_deals 
           SET discount_percentage = $1, current_price = $2, updated_at = NOW() 
           WHERE id = $3`,
          [newDiscount, newCurrentPrice, flashDealId]
        );

        // Invalidar cache
        await cache.delete(`flash-deal:${flashDealId}`);
        await cache.deletePattern('flash-deals:*');

        // Emitir evento WebSocket
        if (global.wsServer) {
          global.wsServer.emitToFlashDeal(flashDealId, 'flash-deal:updated', {
            id: flashDealId,
            discount_percentage: newDiscount,
            current_price: newCurrentPrice,
          });
        }

        logger.info(`✅ Flash deal ${flashDealId} discount updated to ${newDiscount}%`);
      }
    } catch (error) {
      logger.error(`Error updating discount for flash deal ${flashDealId}:`, error);
    }
  }
}

module.exports = new FlashDealsService();
