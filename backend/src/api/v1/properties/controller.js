// ===================================================================
// CONTROLLER - PROPRIEDADES
// ===================================================================

const { pool } = require('../../../../database/db');
const { logAuditEvent } = require('../../../utils/auditLogger');

// ===================================================================
// LISTAR PROPRIEDADES
// ===================================================================

const listProperties = async (req, res) => {
  try {
    const {
      enterprise_id,
      type,
      status,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT 
        p.*,
        COUNT(DISTINCT a.id) as accommodations_count
      FROM properties p
      LEFT JOIN accommodations a ON a.property_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (enterprise_id) {
      paramCount++;
      query += ` AND p.enterprise_id = $${paramCount}`;
      params.push(enterprise_id);
    }

    if (type) {
      paramCount++;
      query += ` AND p.property_type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        p.name ILIKE $${paramCount} OR
        p.description ILIKE $${paramCount} OR
        p.room_number ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const properties = result.rows.map(row => ({
      ...row,
      images: row.images || [],
      amenities: row.amenities || [],
      metadata: row.metadata || {}
    }));

    // Contar total
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT p.id) as total FROM').split('LIMIT')[0];
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    logAuditEvent(req.user?.id, 'properties', 'list', { filters: req.query });

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar propriedades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar propriedades',
      error: error.message
    });
  }
};

// ===================================================================
// OBTER PROPRIEDADE POR ID
// ===================================================================

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM properties WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Propriedade não encontrada'
      });
    }

    const property = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'properties', 'view', { propertyId: id });

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Erro ao obter propriedade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter propriedade',
      error: error.message
    });
  }
};

// ===================================================================
// CRIAR PROPRIEDADE
// ===================================================================

const createProperty = async (req, res) => {
  try {
    const {
      enterprise_id,
      name,
      description,
      property_type,
      room_number,
      floor_number,
      building_name,
      bedrooms,
      bathrooms,
      beds,
      max_guests,
      area_sqm,
      amenities,
      base_price_per_night,
      currency,
      cleaning_fee,
      service_fee_percentage,
      min_stay_nights,
      max_stay_nights,
      status,
      is_featured,
      is_instant_book,
      images,
      metadata
    } = req.body;

    const result = await pool.query(
      `INSERT INTO properties (
        enterprise_id, name, description, property_type,
        room_number, floor_number, building_name,
        bedrooms, bathrooms, beds, max_guests, area_sqm,
        amenities, base_price_per_night, currency, cleaning_fee, service_fee_percentage,
        min_stay_nights, max_stay_nights,
        status, is_featured, is_instant_book,
        images, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      ) RETURNING *`,
      [
        enterprise_id,
        name,
        description,
        property_type,
        room_number,
        floor_number,
        building_name,
        bedrooms || 0,
        bathrooms || 0,
        beds || 0,
        max_guests || 1,
        area_sqm,
        JSON.stringify(amenities || []),
        base_price_per_night,
        currency || 'BRL',
        cleaning_fee || 0,
        service_fee_percentage,
        min_stay_nights || 1,
        max_stay_nights,
        status || 'active',
        is_featured || false,
        is_instant_book || false,
        JSON.stringify(images || []),
        JSON.stringify(metadata || {})
      ]
    );

    const property = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'properties', 'create', { propertyId: property.id });

    res.status(201).json({
      success: true,
      message: 'Propriedade criada com sucesso',
      data: property
    });
  } catch (error) {
    console.error('Erro ao criar propriedade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar propriedade',
      error: error.message
    });
  }
};

// ===================================================================
// ATUALIZAR PROPRIEDADE
// ===================================================================

const updateProperty = async (req, res) => {
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
      UPDATE properties 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Propriedade não encontrada'
      });
    }

    const property = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'properties', 'update', { propertyId: id });

    res.json({
      success: true,
      message: 'Propriedade atualizada com sucesso',
      data: property
    });
  } catch (error) {
    console.error('Erro ao atualizar propriedade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar propriedade',
      error: error.message
    });
  }
};

// ===================================================================
// DELETAR PROPRIEDADE
// ===================================================================

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM properties WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Propriedade não encontrada'
      });
    }

    logAuditEvent(req.user?.id, 'properties', 'delete', { propertyId: id });

    res.json({
      success: true,
      message: 'Propriedade deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar propriedade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar propriedade',
      error: error.message
    });
  }
};

// ===================================================================
// OBTER ACOMODAÇÕES DA PROPRIEDADE
// ===================================================================

const getPropertyAccommodations = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM accommodations WHERE property_id = $1 ORDER BY room_number, name`,
      [id]
    );

    const accommodations = result.rows.map(row => ({
      ...row,
      images: row.images || [],
      amenities: row.amenities || [],
      metadata: row.metadata || {}
    }));

    res.json({
      success: true,
      data: accommodations
    });
  } catch (error) {
    console.error('Erro ao obter acomodações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter acomodações',
      error: error.message
    });
  }
};

module.exports = {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyAccommodations
};
