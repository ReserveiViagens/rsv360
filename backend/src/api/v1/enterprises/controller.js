// ===================================================================
// CONTROLLER - EMPREENDIMENTOS
// ===================================================================

const { pool } = require('../../../../database/db');
const { logAuditEvent } = require('../../../utils/auditLogger');

// ===================================================================
// LISTAR EMPREENDIMENTOS
// ===================================================================

const listEnterprises = async (req, res) => {
  try {
    const {
      type,
      city,
      state,
      status,
      featured,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT 
        e.*,
        COUNT(DISTINCT p.id) as properties_count,
        COUNT(DISTINCT a.id) as accommodations_count
      FROM enterprises e
      LEFT JOIN properties p ON p.enterprise_id = e.id
      LEFT JOIN accommodations a ON a.property_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND e.enterprise_type = $${paramCount}`;
      params.push(type);
    }

    if (city) {
      paramCount++;
      query += ` AND e.address_city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    if (state) {
      paramCount++;
      query += ` AND e.address_state = $${paramCount}`;
      params.push(state);
    }

    if (status) {
      paramCount++;
      query += ` AND e.status = $${paramCount}`;
      params.push(status);
    }

    if (featured === 'true') {
      query += ` AND e.is_featured = true`;
    }

    if (search) {
      paramCount++;
      query += ` AND (
        e.name ILIKE $${paramCount} OR
        e.description ILIKE $${paramCount} OR
        e.address_city ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY e.id ORDER BY e.created_at DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const enterprises = result.rows.map(row => ({
      ...row,
      images: row.images || [],
      amenities: row.amenities || [],
      metadata: row.metadata || {}
    }));

    // Contar total
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT e.id) as total FROM').split('LIMIT')[0];
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    logAuditEvent(req.user?.id, 'enterprises', 'list', { filters: req.query });

    res.json({
      success: true,
      data: enterprises,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar empreendimentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar empreendimentos',
      error: error.message
    });
  }
};

// ===================================================================
// OBTER EMPREENDIMENTO POR ID
// ===================================================================

const getEnterpriseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM enterprises WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empreendimento não encontrado'
      });
    }

    const enterprise = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'enterprises', 'view', { enterpriseId: id });

    res.json({
      success: true,
      data: enterprise
    });
  } catch (error) {
    console.error('Erro ao obter empreendimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter empreendimento',
      error: error.message
    });
  }
};

// ===================================================================
// CRIAR EMPREENDIMENTO
// ===================================================================

const createEnterprise = async (req, res) => {
  try {
    const {
      owner_id,
      name,
      legal_name,
      description,
      enterprise_type,
      address_street,
      address_number,
      address_complement,
      address_neighborhood,
      address_city,
      address_state,
      address_zip_code,
      address_country,
      latitude,
      longitude,
      phone,
      email,
      website,
      check_in_time,
      check_out_time,
      cancellation_policy,
      status,
      is_featured,
      logo_url,
      images,
      amenities,
      metadata
    } = req.body;

    const result = await pool.query(
      `INSERT INTO enterprises (
        owner_id, name, legal_name, description, enterprise_type,
        address_street, address_number, address_complement, address_neighborhood,
        address_city, address_state, address_zip_code, address_country,
        latitude, longitude, phone, email, website,
        check_in_time, check_out_time, cancellation_policy,
        status, is_featured, logo_url, images, amenities, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      ) RETURNING *`,
      [
        owner_id || req.user?.id,
        name,
        legal_name,
        description,
        enterprise_type,
        address_street,
        address_number,
        address_complement,
        address_neighborhood,
        address_city,
        address_state,
        address_zip_code,
        address_country || 'Brasil',
        latitude,
        longitude,
        phone,
        email,
        website,
        check_in_time || '15:00',
        check_out_time || '11:00',
        cancellation_policy || 'moderate',
        status || 'active',
        is_featured || false,
        logo_url,
        JSON.stringify(images || []),
        JSON.stringify(amenities || []),
        JSON.stringify(metadata || {})
      ]
    );

    const enterprise = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'enterprises', 'create', { enterpriseId: enterprise.id });

    res.status(201).json({
      success: true,
      message: 'Empreendimento criado com sucesso',
      data: enterprise
    });
  } catch (error) {
    console.error('Erro ao criar empreendimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar empreendimento',
      error: error.message
    });
  }
};

// ===================================================================
// ATUALIZAR EMPREENDIMENTO
// ===================================================================

const updateEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Construir query dinâmica
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
      UPDATE enterprises 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empreendimento não encontrado'
      });
    }

    const enterprise = {
      ...result.rows[0],
      images: result.rows[0].images || [],
      amenities: result.rows[0].amenities || [],
      metadata: result.rows[0].metadata || {}
    };

    logAuditEvent(req.user?.id, 'enterprises', 'update', { enterpriseId: id });

    res.json({
      success: true,
      message: 'Empreendimento atualizado com sucesso',
      data: enterprise
    });
  } catch (error) {
    console.error('Erro ao atualizar empreendimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar empreendimento',
      error: error.message
    });
  }
};

// ===================================================================
// DELETAR EMPREENDIMENTO
// ===================================================================

const deleteEnterprise = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM enterprises WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empreendimento não encontrado'
      });
    }

    logAuditEvent(req.user?.id, 'enterprises', 'delete', { enterpriseId: id });

    res.json({
      success: true,
      message: 'Empreendimento deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar empreendimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar empreendimento',
      error: error.message
    });
  }
};

// ===================================================================
// OBTER PROPRIEDADES DO EMPREENDIMENTO
// ===================================================================

const getEnterpriseProperties = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM properties WHERE enterprise_id = $1 ORDER BY name`,
      [id]
    );

    const properties = result.rows.map(row => ({
      ...row,
      images: row.images || [],
      amenities: row.amenities || [],
      metadata: row.metadata || {}
    }));

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Erro ao obter propriedades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter propriedades',
      error: error.message
    });
  }
};

module.exports = {
  listEnterprises,
  getEnterpriseById,
  createEnterprise,
  updateEnterprise,
  deleteEnterprise,
  getEnterpriseProperties
};
