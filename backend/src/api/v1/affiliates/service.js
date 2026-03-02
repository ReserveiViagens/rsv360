const { pool } = require('../../../../database/db');
const logger = require('../../../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Service para gerenciar Afiliados
 */
class AffiliatesService {
  /**
   * Listar afiliados com filtros
   */
  async listAffiliates(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        search,
      } = filters;

      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          a.*,
          COUNT(DISTINCT ar.id) as total_referrals,
          COUNT(DISTINCT ac.id) as total_commissions,
          COALESCE(SUM(CASE WHEN ac.status = 'paid' THEN ac.commission_amount ELSE 0 END), 0) as total_earned
        FROM affiliates a
        LEFT JOIN affiliate_referrals ar ON a.id = ar.affiliate_id
        LEFT JOIN affiliate_commissions ac ON a.id = ac.affiliate_id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
      }

      if (search) {
        paramCount++;
        query += ` AND (a.name ILIKE $${paramCount} OR a.email ILIKE $${paramCount} OR a.referral_code ILIKE $${paramCount})`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` GROUP BY a.id ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      const affiliates = result.rows;

      // Buscar total
      const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT a.id) as total FROM').split('GROUP BY')[0];
      const countResult = await pool.query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0]?.total || 0);

      return {
        data: affiliates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing affiliates:', error);
      throw error;
    }
  }

  /**
   * Buscar afiliado por ID
   */
  async findAffiliateById(id) {
    try {
      const query = `
        SELECT 
          a.*,
          COUNT(DISTINCT ar.id) as total_referrals,
          COUNT(DISTINCT ac.id) as total_commissions,
          COALESCE(SUM(CASE WHEN ac.status = 'paid' THEN ac.commission_amount ELSE 0 END), 0) as total_earned
        FROM affiliates a
        LEFT JOIN affiliate_referrals ar ON a.id = ar.affiliate_id
        LEFT JOIN affiliate_commissions ac ON a.id = ac.affiliate_id
        WHERE a.id = $1
        GROUP BY a.id
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding affiliate by ID:', error);
      throw error;
    }
  }

  /**
   * Buscar afiliado por código de referência
   */
  async getAffiliateByCode(referralCode) {
    try {
      const query = 'SELECT * FROM affiliates WHERE referral_code = $1';
      const result = await pool.query(query, [referralCode]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding affiliate by code:', error);
      throw error;
    }
  }

  /**
   * Criar novo afiliado
   */
  async createAffiliate(data) {
    try {
      const {
        name,
        email,
        phone,
        company_name,
        tax_id,
        payment_method,
        payment_details,
      } = data;

      // Gerar código de referência único
      let referralCode;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        referralCode = this.generateReferralCode();
        const existing = await this.getAffiliateByCode(referralCode);
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique referral code');
      }

      const query = `
        INSERT INTO affiliates (
          name, email, phone, company_name, tax_id, referral_code,
          payment_method, payment_details, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
        RETURNING *
      `;

      const result = await pool.query(query, [
        name,
        email,
        phone,
        company_name,
        tax_id,
        referralCode,
        payment_method,
        JSON.stringify(payment_details || {}),
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating affiliate:', error);
      throw error;
    }
  }

  /**
   * Gerar código de referência único
   */
  generateReferralCode() {
    // Gerar código alfanumérico de 8 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Atualizar afiliado
   */
  async updateAffiliate(id, data) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 0;

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && key !== 'id') {
          paramCount++;
          if (key === 'payment_details') {
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
        UPDATE affiliates
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating affiliate:', error);
      throw error;
    }
  }

  /**
   * Criar referência (hotel referenciado)
   */
  async createReferral(affiliateId, enterpriseId) {
    try {
      // Buscar afiliado para obter o referral_code
      const affiliate = await this.findAffiliateById(affiliateId);
      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      // Verificar se já existe
      const existingQuery = `
        SELECT * FROM affiliate_referrals
        WHERE affiliate_id = $1 AND enterprise_id = $2
      `;
      const existing = await pool.query(existingQuery, [affiliateId, enterpriseId]);

      if (existing.rows.length > 0) {
        return existing.rows[0];
      }

      const query = `
        INSERT INTO affiliate_referrals (affiliate_id, enterprise_id, referral_code, status)
        VALUES ($1, $2, $3, 'active')
        RETURNING *
      `;

      const result = await pool.query(query, [affiliateId, enterpriseId, affiliate.referral_code]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating referral:', error);
      throw error;
    }
  }

  /**
   * Listar referências de um afiliado
   */
  async listReferrals(affiliateId, filters = {}) {
    try {
      const { page = 1, limit = 50, status } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          ar.*,
          e.name as enterprise_name
        FROM affiliate_referrals ar
        LEFT JOIN enterprises e ON ar.enterprise_id = e.id
        WHERE ar.affiliate_id = $1
      `;
      const params = [affiliateId];
      let paramCount = 1;

      if (status) {
        paramCount++;
        query += ` AND ar.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY ar.started_at DESC, ar.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing referrals:', error);
      throw error;
    }
  }

  /**
   * Calcular comissão recorrente de 20%
   */
  async calculateCommission(affiliateId, period) {
    try {
      const { start_date, end_date } = period;

      // Buscar todas as referências ativas do afiliado
      const referralsQuery = `
        SELECT enterprise_id FROM affiliate_referrals
        WHERE affiliate_id = $1 AND status = 'active'
      `;
      const referralsResult = await pool.query(referralsQuery, [affiliateId]);
      const enterpriseIds = referralsResult.rows.map(r => r.enterprise_id);

      if (enterpriseIds.length === 0) {
        return {
          total_commission: 0,
          commissions: [],
        };
      }

      // Buscar receita dos enterprises referenciados no período
      // Assumindo que temos uma tabela de bookings ou receitas
      const revenueQuery = `
        SELECT 
          b.enterprise_id,
          SUM(b.total_amount) as total_revenue
        FROM bookings b
        WHERE b.enterprise_id = ANY($1)
          AND b.status = 'confirmed'
          AND b.created_at >= $2
          AND b.created_at <= $3
        GROUP BY b.enterprise_id
      `;
      const revenueResult = await pool.query(revenueQuery, [
        enterpriseIds,
        start_date,
        end_date,
      ]);

      const commissions = [];
      let totalCommission = 0;

      for (const row of revenueResult.rows) {
        const commissionAmount = row.total_revenue * 0.20; // 20% comissão
        totalCommission += commissionAmount;

        commissions.push({
          enterprise_id: row.enterprise_id,
          revenue: parseFloat(row.total_revenue),
          commission: commissionAmount,
        });
      }

      return {
        total_commission: totalCommission,
        commissions,
      };
    } catch (error) {
      logger.error('Error calculating commission:', error);
      throw error;
    }
  }

  /**
   * Criar registro de comissão
   */
  async createCommission(affiliateId, enterpriseId, amount, period) {
    try {
      const { start_date, end_date } = period;
      const baseAmount = amount / 0.20; // Calcular base_amount a partir da comissão (20%)

      const query = `
        INSERT INTO affiliate_commissions (
          affiliate_id, enterprise_id, base_amount, commission_amount, commission_rate,
          period_start, period_end, status
        )
        VALUES ($1, $2, $3, $4, 0.20, $5, $6, 'pending')
        RETURNING *
      `;

      const result = await pool.query(query, [
        affiliateId,
        enterpriseId,
        baseAmount,
        amount,
        start_date,
        end_date,
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating commission:', error);
      throw error;
    }
  }

  /**
   * Listar comissões de um afiliado
   */
  async listCommissions(affiliateId, filters = {}) {
    try {
      const { page = 1, limit = 20, status } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          ac.*,
          e.name as enterprise_name
        FROM affiliate_commissions ac
        LEFT JOIN enterprises e ON ac.enterprise_id = e.id
        WHERE ac.affiliate_id = $1
      `;
      const params = [affiliateId];
      let paramCount = 1;

      if (status) {
        paramCount++;
        query += ` AND ac.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY ac.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing commissions:', error);
      throw error;
    }
  }

  /**
   * Processar pagamento de comissões
   */
  async processPayout(affiliateId, commissionIds) {
    try {
      // Verificar se todas as comissões pertencem ao afiliado
      const checkQuery = `
        SELECT id FROM affiliate_commissions
        WHERE id = ANY($1) AND affiliate_id = $2 AND status = 'pending'
      `;
      const checkResult = await pool.query(checkQuery, [commissionIds, affiliateId]);

      if (checkResult.rows.length !== commissionIds.length) {
        throw new Error('Some commissions are invalid or already processed');
      }

      // Calcular total (coluna commission_amount na migration)
      const totalQuery = `
        SELECT SUM(commission_amount) as total FROM affiliate_commissions
        WHERE id = ANY($1)
      `;
      const totalResult = await pool.query(totalQuery, [commissionIds]);
      const totalAmount = parseFloat(totalResult.rows[0].total || 0);

      // Criar registro de payout (payment_method NOT NULL)
      const payoutQuery = `
        INSERT INTO affiliate_payouts (
          affiliate_id, total_amount, commission_ids, payment_method, status
        )
        VALUES ($1, $2, $3, 'bank_transfer', 'pending')
        RETURNING *
      `;
      const payoutResult = await pool.query(payoutQuery, [
        affiliateId,
        totalAmount,
        commissionIds,
      ]);

      // Atualizar status das comissões (a migration não tem paid_at nem payout_id, então apenas status)
      const updateQuery = `
        UPDATE affiliate_commissions
        SET status = 'paid'
        WHERE id = ANY($1)
      `;
      await pool.query(updateQuery, [commissionIds]);

      return payoutResult.rows[0];
    } catch (error) {
      logger.error('Error processing payout:', error);
      throw error;
    }
  }

  /**
   * Listar payouts de um afiliado
   */
  async listPayouts(affiliateId, filters = {}) {
    try {
      const { page = 1, limit = 50, status } = filters;
      const offset = (page - 1) * limit;

      let query = `
        SELECT * FROM affiliate_payouts
        WHERE affiliate_id = $1
      `;
      const params = [affiliateId];
      let paramCount = 1;

      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing payouts:', error);
      throw error;
    }
  }

  /**
   * Obter dados do dashboard do afiliado
   */
  async getAffiliateDashboard(affiliateId, period) {
    try {
      const { start_date, end_date } = period;

      // Estatísticas gerais
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT ar.id) as total_referrals,
          COUNT(DISTINCT ac.id) as total_commissions,
          COALESCE(SUM(CASE WHEN ac.status = 'paid' THEN ac.commission_amount ELSE 0 END), 0) as total_earned,
          COALESCE(SUM(CASE WHEN ac.status = 'pending' THEN ac.commission_amount ELSE 0 END), 0) as pending_amount
        FROM affiliates a
        LEFT JOIN affiliate_referrals ar ON a.id = ar.affiliate_id
        LEFT JOIN affiliate_commissions ac ON a.id = ac.affiliate_id
        WHERE a.id = $1
      `;
      const statsResult = await pool.query(statsQuery, [affiliateId]);
      const stats = statsResult.rows[0];

      // Comissões do período
      const commissions = await this.listCommissions(affiliateId, {
        limit: 1000,
      });

      const periodCommissions = commissions.filter(c => {
        const created = new Date(c.created_at);
        return created >= new Date(start_date) && created <= new Date(end_date);
      });

      return {
        stats: {
          total_referrals: parseInt(stats.total_referrals || 0),
          total_commissions: parseInt(stats.total_commissions || 0),
          total_earned: parseFloat(stats.total_earned || 0),
          pending_amount: parseFloat(stats.pending_amount || 0),
        },
        period_commissions: periodCommissions,
      };
    } catch (error) {
      logger.error('Error getting affiliate dashboard:', error);
      throw error;
    }
  }
}

module.exports = new AffiliatesService();
