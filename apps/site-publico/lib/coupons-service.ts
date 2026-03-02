/**
 * ✅ ITEM 71: SERVIÇO DE CUPONS/DESCONTOS - BACKEND
 */

import { queryDatabase } from './db';

export interface Coupon {
  id?: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_night';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  applicable_to?: 'all' | 'properties' | 'categories' | 'specific';
  applicable_properties?: number[];
  applicable_categories?: string[];
  is_active?: boolean;
  is_public?: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discount_amount?: number;
  coupon?: Coupon;
}

/**
 * Criar cupom
 */
export async function createCoupon(coupon: Coupon, createdBy?: number): Promise<Coupon> {
  const result = await queryDatabase(
    `INSERT INTO coupons 
     (code, name, description, discount_type, discount_value, valid_from, valid_until,
      min_purchase_amount, max_discount_amount, usage_limit, usage_limit_per_user,
      applicable_to, applicable_properties, applicable_categories, is_active, is_public, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      coupon.code.toUpperCase(),
      coupon.name,
      coupon.description || null,
      coupon.discount_type,
      coupon.discount_value,
      coupon.valid_from,
      coupon.valid_until,
      coupon.min_purchase_amount || null,
      coupon.max_discount_amount || null,
      coupon.usage_limit || null,
      coupon.usage_limit_per_user || 1,
      coupon.applicable_to || 'all',
      coupon.applicable_properties ? JSON.stringify(coupon.applicable_properties) : null,
      coupon.applicable_categories ? JSON.stringify(coupon.applicable_categories) : null,
      coupon.is_active !== false,
      coupon.is_public !== false,
      createdBy || null,
    ]
  );

  return result[0];
}

/**
 * Validar cupom
 */
export async function validateCoupon(
  code: string,
  amount: number,
  userId?: number,
  propertyId?: number
): Promise<CouponValidationResult> {
  // Buscar cupom
  const coupons = await queryDatabase(
    `SELECT * FROM coupons 
     WHERE code = $1 AND is_active = true`,
    [code.toUpperCase()]
  );

  if (coupons.length === 0) {
    return { valid: false, error: 'Cupom não encontrado ou inativo' };
  }

  const coupon = coupons[0];
  const now = new Date();
  const validFrom = new Date(coupon.valid_from);
  const validUntil = new Date(coupon.valid_until);

  // Verificar validade de datas
  if (now < validFrom || now > validUntil) {
    return { valid: false, error: 'Cupom fora do período de validade' };
  }

  // Verificar valor mínimo de compra
  if (coupon.min_purchase_amount && amount < coupon.min_purchase_amount) {
    return {
      valid: false,
      error: `Valor mínimo de compra: R$ ${coupon.min_purchase_amount.toFixed(2)}`,
    };
  }

  // Verificar limite de uso total
  if (coupon.usage_limit && coupon.total_uses >= coupon.usage_limit) {
    return { valid: false, error: 'Cupom esgotado' };
  }

  // Verificar limite de uso por usuário
  if (userId && coupon.usage_limit_per_user) {
    const userUsage = await queryDatabase(
      `SELECT COUNT(*) as count FROM coupon_usage 
       WHERE coupon_id = $1 AND user_id = $2`,
      [coupon.id, userId]
    );

    if (parseInt(userUsage[0]?.count || '0') >= coupon.usage_limit_per_user) {
      return { valid: false, error: 'Limite de uso por usuário atingido' };
    }
  }

  // Verificar aplicabilidade
  if (coupon.applicable_to === 'properties' && propertyId) {
    const applicableProperties = coupon.applicable_properties || [];
    if (!applicableProperties.includes(propertyId)) {
      return { valid: false, error: 'Cupom não aplicável a esta propriedade' };
    }
  }

  // Calcular desconto
  let discountAmount = 0;

  if (coupon.discount_type === 'percentage') {
    discountAmount = (amount * coupon.discount_value) / 100;
    if (coupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
    }
  } else if (coupon.discount_type === 'fixed') {
    discountAmount = Math.min(coupon.discount_value, amount);
  } else if (coupon.discount_type === 'free_night') {
    // Lógica de noite grátis
    if (coupon.discount_type === 'free_night') {
      // Para noite grátis, calcular baseado no número de noites
      const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
      if (nights >= coupon.discount_value) {
        // Desconto equivalente ao valor de uma noite
        const nightlyRate = amount / nights;
        discountAmount = nightlyRate * coupon.discount_value;
      } else {
        return {
          valid: false,
          error: `É necessário pelo menos ${coupon.discount_value} noites para usar este cupom`,
        };
      }
    }
    discountAmount = 0; // Placeholder
  }

  return {
    valid: true,
    discount_amount: discountAmount,
    coupon,
  };
}

/**
 * Aplicar cupom a uma reserva
 */
export async function applyCouponToBooking(
  couponId: number,
  bookingId: number,
  userId: number,
  originalAmount: number,
  discountAmount: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const coupon = await queryDatabase(
    `SELECT code FROM coupons WHERE id = $1`,
    [couponId]
  );

  if (coupon.length === 0) {
    throw new Error('Cupom não encontrado');
  }

  await queryDatabase(
    `INSERT INTO coupon_usage 
     (coupon_id, booking_id, user_id, code_used, discount_applied, 
      original_amount, final_amount, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      couponId,
      bookingId,
      userId,
      coupon[0].code,
      discountAmount,
      originalAmount,
      originalAmount - discountAmount,
      ipAddress || null,
      userAgent || null,
    ]
  );
}

/**
 * Listar cupons
 */
export async function listCoupons(filters: {
  is_active?: boolean;
  is_public?: boolean;
  search?: string;
} = {}): Promise<Coupon[]> {
  let query = `SELECT * FROM coupons WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.is_active !== undefined) {
    query += ` AND is_active = $${paramIndex}`;
    params.push(filters.is_active);
    paramIndex++;
  }

  if (filters.is_public !== undefined) {
    query += ` AND is_public = $${paramIndex}`;
    params.push(filters.is_public);
    paramIndex++;
  }

  if (filters.search) {
    query += ` AND (code ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  return await queryDatabase(query, params);
}

/**
 * Obter estatísticas de cupom
 */
export async function getCouponStats(couponId: number): Promise<{
  total_uses: number;
  total_discount_given: number;
  unique_users: number;
  recent_uses: any[];
}> {
  const coupon = await queryDatabase(
    `SELECT total_uses, total_discount_given FROM coupons WHERE id = $1`,
    [couponId]
  );

  const uniqueUsers = await queryDatabase(
    `SELECT COUNT(DISTINCT user_id) as count FROM coupon_usage WHERE coupon_id = $1`,
    [couponId]
  );

  const recentUses = await queryDatabase(
    `SELECT * FROM coupon_usage 
     WHERE coupon_id = $1 
     ORDER BY used_at DESC 
     LIMIT 10`,
    [couponId]
  );

  return {
    total_uses: coupon[0]?.total_uses || 0,
    total_discount_given: parseFloat(coupon[0]?.total_discount_given || '0'),
    unique_users: parseInt(uniqueUsers[0]?.count || '0'),
    recent_uses: recentUses,
  };
}

