// ===================================================================
// CONTROLLER - ACOMODAÇÕES
// ===================================================================

const { pool } = require('../../../../database/db');
const { logAuditEvent } = require('../../../utils/auditLogger');

// ===================================================================
// LISTAR ACOMODAÇÕES
// ===================================================================

const listAccommodations = async (req, res) => {
  try {
    const {
      property_id,
      enterprise_id,
      type,
      status,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT 
        a.*,
        p.name as property_name,
        p.enterprise_id,
        e.name as enterprise_name
      FROM accommodations a
      LEFT JOIN properties p ON p.id = a.property_id
      LEFT JOIN enterprises e ON e.id = p.enterprise_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (property_id) {
      paramCount++;
      query += ` AND a.property_id = $${paramCount}`;
      params.push(property_id);
    }

    if (enterprise_id) {
      paramCount++;
      query += ` AND p.enterprise_id = $${paramCount}`;
      params.push(enterprise_id);
    }

    if (type) {
      paramCount++;
      query += ` AND a.accommodation_type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        a.name ILIKE $${paramCount} OR
        a.description ILIKE $${paramCount} OR
        a.room_number ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const accommodations = result.rows.map(row => ({
      ...row,
      images: row.images || [],
      amenities: row.amenities || [],
      metadata: row.metadata || {}
    }));

    // Contar total
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').split('LIMIT')[0];
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    logAuditEvent(req.user?.id, 'accommodations', 'list', { filters: req.query });

    res.json({
      success: true,
      data: accommodations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar acomodações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar acomodações',
      error: error.message
    });
  }
};

// ===================================================================
// OBTER ACOMODAÇÃO POR ID
// ===================================================================

const getAccommodationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        a.*,
        p.name as property_name,
        p.enterprise_id,
        e.name as enterprise_name
      FROM accommodations a
      LEFT JOIN properties p ON p.id = a.property_id
      LEFT JOIN enterprises e ON e.id = p.enterprise_id
      WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Acomodação não encontrada'
      });
    }

    const accommodation = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'accommodations', 'view', { accommodationId: id });

    res.json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    console.error('Erro ao obter acomodação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter acomodação',
      error: error.message
    });
  }
};

// ===================================================================
// CRIAR ACOMODAÇÃO
// ===================================================================

const createAccommodation = async (req, res) => {
  try {
    const {
      property_id,
      name,
      description,
      accommodation_type,
      room_number,
      floor_number,
      bedrooms,
      bathrooms,
      beds,
      bed_type,
      max_guests,
      area_sqm,
      amenities,
      base_price_per_night,
      currency,
      cleaning_fee,
      min_stay_nights,
      max_stay_nights,
      status,
      is_featured,
      is_instant_book,
      images,
      metadata
    } = req.body;

    const result = await pool.query(
      `INSERT INTO accommodations (
        property_id, name, description, accommodation_type,
        room_number, floor_number,
        bedrooms, bathrooms, beds, bed_type, max_guests, area_sqm,
        amenities, base_price_per_night, currency, cleaning_fee,
        min_stay_nights, max_stay_nights,
        status, is_featured, is_instant_book,
        images, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *`,
      [
        property_id,
        name,
        description,
        accommodation_type,
        room_number,
        floor_number,
        bedrooms || 0,
        bathrooms || 0,
        beds || 0,
        bed_type,
        max_guests || 1,
        area_sqm,
        JSON.stringify(amenities || []),
        base_price_per_night,
        currency || 'BRL',
        cleaning_fee || 0,
        min_stay_nights || 1,
        max_stay_nights,
        status || 'active',
        is_featured || false,
        is_instant_book || false,
        JSON.stringify(images || []),
        JSON.stringify(metadata || {})
      ]
    );

    const accommodation = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'accommodations', 'create', { accommodationId: accommodation.id });

    res.status(201).json({
      success: true,
      message: 'Acomodação criada com sucesso',
      data: accommodation
    });
  } catch (error) {
    console.error('Erro ao criar acomodação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar acomodação',
      error: error.message
    });
  }
};

// ===================================================================
// ATUALIZAR ACOMODAÇÃO
// ===================================================================

const updateAccommodation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateFields).forEach(key => {
      if (key === 'images' || key === 'amenities' || key === 'metadata') {
        fields.push(`${key} = $${++paramCount}`);
        values.push(JSON.stringify(updateFields[key]));
      } else {
        fields.push(`${key} = $${++paramCount}`);
        values.push(updateFields[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    values.push(id);
    const query = `
      UPDATE accommodations 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Acomodação não encontrada'
      });
    }

    const accommodation = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'accommodations', 'update', { accommodationId: id });

    res.json({
      success: true,
      message: 'Acomodação atualizada com sucesso',
      data: accommodation
    });
  } catch (error) {
    console.error('Erro ao atualizar acomodação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar acomodação',
      error: error.message
    });
  }
};

// ===================================================================
// DELETAR ACOMODAÇÃO
// ===================================================================

const deleteAccommodation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM accommodations WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Acomodação não encontrada'
      });
    }

    logAuditEvent(req.user?.id, 'accommodations', 'delete', { accommodationId: id });

    res.json({
      success: true,
      message: 'Acomodação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar acomodação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar acomodação',
      error: error.message
    });
  }
};

// ===================================================================
// VERIFICAR DISPONIBILIDADE
// ===================================================================

const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out } = req.query;

    if (!check_in || !check_out) {
      return res.status(400).json({
        success: false,
        message: 'check_in e check_out são obrigatórios'
      });
    }

    // Verificar disponibilidade nas datas
    const result = await pool.query(
      `SELECT 
        date,
        is_available,
        price_override,
        min_stay_override
      FROM accommodation_availability
      WHERE accommodation_id = $1
        AND date >= $2::date
        AND date < $3::date
      ORDER BY date`,
      [id, check_in, check_out]
    );

    // Verificar se há reservas conflitantes
    const bookingsResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM bookings
      WHERE accommodation_id = $1
        AND status != 'cancelled'
        AND (
          (check_in::date <= $2::date AND check_out::date > $2::date) OR
          (check_in::date < $3::date AND check_out::date >= $3::date) OR
          (check_in::date >= $2::date AND check_out::date < $3::date)
        )`,
      [id, check_in, check_out]
    );

    const hasBookings = parseInt(bookingsResult.rows[0].count) > 0;
    const availability = result.rows;
    const isAvailable = !hasBookings && availability.every(a => a.is_available !== false);

    res.json({
      success: true,
      data: {
        isAvailable,
        hasBookings,
        availability,
        checkIn: check_in,
        checkOut: check_out
      }
    });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar disponibilidade',
      error: error.message
    });
  }
};

module.exports = {
  listAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  checkAvailability
};
