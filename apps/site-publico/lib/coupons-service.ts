/**
 * ✅ ITEM 71: SERVIÇO DE CUPONS/DESCONTOS - BACKEND
 * PR-11c: applyCouponToBooking is atomic (row lock on coupon + re-check + INSERT).
 */

import type { PoolClient } from 'pg';
import { queryDatabase, withDbTransaction } from './db';

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
    const nights = Math.max(coupon.discount_value, 1);
    const nightlyRate = amount / nights;
    discountAmount = nightlyRate * Math.min(nights, coupon.discount_value);
  }

  return {
    valid: true,
    discount_amount: discountAmount,
    coupon,
  };
}

export type ApplyCouponSuccess = { ok: true; usageId: number };
export type ApplyCouponFailure = {
  ok: false;
  status: 404 | 409 | 400;
  error: string;
};
export type ApplyCouponResult = ApplyCouponSuccess | ApplyCouponFailure;

export type ApplyCouponToBookingDeps = {
  /** Injected for unit tests — defaults to withDbTransaction. */
  runInTransaction?: typeof withDbTransaction;
};

/**
 * Aplicar cupom a uma reserva (PR-11c — single-use / usage_limit atomic).
 * Locks only the coupon row (`FOR UPDATE`), re-checks limits, then INSERT.
 * `total_uses` remains owned by existing AFTER INSERT trigger (no double increment).
 */
export async function applyCouponToBooking(
  couponId: number,
  bookingId: number,
  userId: number,
  originalAmount: number,
  discountAmount: number,
  ipAddress?: string,
  userAgent?: string,
  deps: ApplyCouponToBookingDeps = {},
): Promise<ApplyCouponResult> {
  const runTx = deps.runInTransaction ?? withDbTransaction;

  return runTx(async (client: PoolClient) => {
    const couponRes = await client.query(
      `SELECT id, code, usage_limit, usage_limit_per_user, total_uses, is_active
       FROM coupons
       WHERE id = $1
       FOR UPDATE`,
      [couponId],
    );

    if (!couponRes.rows.length) {
      return { ok: false, status: 404, error: 'Cupom não encontrado' };
    }

    const coupon = couponRes.rows[0] as {
      id: number;
      code: string;
      usage_limit: number | null;
      usage_limit_per_user: number | null;
      total_uses: number;
      is_active: boolean;
    };

    if (coupon.is_active === false) {
      return { ok: false, status: 400, error: 'Cupom não encontrado ou inativo' };
    }

    const totalUses = Number(coupon.total_uses) || 0;
    if (coupon.usage_limit != null && totalUses >= Number(coupon.usage_limit)) {
      return { ok: false, status: 409, error: 'Cupom esgotado' };
    }

    if (coupon.usage_limit_per_user != null) {
      const userUsage = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM coupon_usage
         WHERE coupon_id = $1 AND user_id = $2`,
        [couponId, userId],
      );
      const used = Number(userUsage.rows[0]?.count) || 0;
      if (used >= Number(coupon.usage_limit_per_user)) {
        return { ok: false, status: 409, error: 'Limite de uso por usuário atingido' };
      }
    }

    const inserted = await client.query(
      `INSERT INTO coupon_usage
       (coupon_id, booking_id, user_id, code_used, discount_applied,
        original_amount, final_amount, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        couponId,
        bookingId,
        userId,
        coupon.code,
        discountAmount,
        originalAmount,
        originalAmount - discountAmount,
        ipAddress || null,
        userAgent || null,
      ],
    );

    return { ok: true, usageId: Number(inserted.rows[0].id) };
  });
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

