/**
 * ✅ ITEM 73: SERVIÇO DE FIDELIDADE - BACKEND
 */

import { queryDatabase } from './db';

export interface LoyaltyPoints {
  user_id: number;
  current_points: number;
  lifetime_points: number;
  points_redeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export interface LoyaltyTransaction {
  user_id: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus' | 'refund';
  points: number;
  reference_type?: string;
  reference_id?: number;
  description?: string;
  expires_at?: string;
}

export interface LoyaltyReward {
  id?: number;
  name: string;
  description?: string;
  points_required: number;
  reward_type: 'discount' | 'free_night' | 'upgrade' | 'cashback' | 'gift' | 'voucher';
  reward_value?: number;
  is_active?: boolean;
  stock_quantity?: number;
  valid_from?: string;
  valid_until?: string;
}

/**
 * Obter ou criar pontos de fidelidade para usuário
 */
export async function getOrCreateLoyaltyPoints(userId: number): Promise<LoyaltyPoints> {
  let points = await queryDatabase(
    `SELECT * FROM loyalty_points WHERE user_id = $1`,
    [userId]
  );

  if (points.length === 0) {
    const result = await queryDatabase(
      `INSERT INTO loyalty_points (user_id, tier)
       VALUES ($1, 'bronze')
       RETURNING *`,
      [userId]
    );
    points = result;
  }

  return points[0];
}

/**
 * Calcular pontos baseado em reserva
 */
export function calculatePointsFromBooking(amount: number): number {
  // 1 ponto para cada R$ 1,00 gasto
  return Math.floor(amount);
}

/**
 * Adicionar pontos
 */
export async function addLoyaltyPoints(
  userId: number,
  points: number,
  transaction: Omit<LoyaltyTransaction, 'user_id' | 'points'>
): Promise<void> {
  const loyaltyPoints = await getOrCreateLoyaltyPoints(userId);

  const pointsBefore = loyaltyPoints.current_points;
  const pointsAfter = pointsBefore + points;

  // Criar transação
  await queryDatabase(
    `INSERT INTO loyalty_transactions 
     (user_id, loyalty_points_id, transaction_type, points, points_before, points_after,
      reference_type, reference_id, description, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      userId,
      loyaltyPoints.id,
      transaction.transaction_type || 'earned',
      points,
      pointsBefore,
      pointsAfter,
      transaction.reference_type || null,
      transaction.reference_id || null,
      transaction.description || null,
      transaction.expires_at || null,
    ]
  );

  // Atualizar tier se necessário
  await updateUserTier(userId, pointsAfter);
}

/**
 * Usar pontos
 */
export async function redeemLoyaltyPoints(
  userId: number,
  points: number,
  transaction: Omit<LoyaltyTransaction, 'user_id' | 'points'>
): Promise<void> {
  const loyaltyPoints = await getOrCreateLoyaltyPoints(userId);

  if (loyaltyPoints.current_points < points) {
    throw new Error('Pontos insuficientes');
  }

  const pointsBefore = loyaltyPoints.current_points;
  const pointsAfter = pointsBefore - points;

  await queryDatabase(
    `INSERT INTO loyalty_transactions 
     (user_id, loyalty_points_id, transaction_type, points, points_before, points_after,
      reference_type, reference_id, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      userId,
      loyaltyPoints.id,
      transaction.transaction_type || 'redeemed',
      -points, // Negativo para uso
      pointsBefore,
      pointsAfter,
      transaction.reference_type || null,
      transaction.reference_id || null,
      transaction.description || null,
    ]
  );
}

/**
 * Atualizar tier do usuário
 */
async function updateUserTier(userId: number, currentPoints: number): Promise<void> {
  const tiers = [
    { name: 'bronze', min: 0 },
    { name: 'silver', min: 1000 },
    { name: 'gold', min: 5000 },
    { name: 'platinum', min: 10000 },
    { name: 'diamond', min: 25000 },
  ];

  let newTier = 'bronze';
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (currentPoints >= tiers[i].min) {
      newTier = tiers[i].name;
      break;
    }
  }

  await queryDatabase(
    `UPDATE loyalty_points 
     SET tier = $1, tier_points_required = $2
     WHERE user_id = $3 AND tier != $1`,
    [newTier, tiers.find(t => t.name === newTier)?.min || 0, userId]
  );
}

/**
 * Listar recompensas disponíveis
 */
export async function listAvailableRewards(
  userId?: number,
  filters: {
    min_points?: number;
    max_points?: number;
    reward_type?: string;
  } = {}
): Promise<LoyaltyReward[]> {
  let query = `
    SELECT * FROM loyalty_rewards 
    WHERE is_active = true
      AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
      AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
      AND (stock_quantity IS NULL OR stock_quantity > 0)
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.min_points) {
    query += ` AND points_required >= $${paramIndex}`;
    params.push(filters.min_points);
    paramIndex++;
  }

  if (filters.max_points) {
    query += ` AND points_required <= $${paramIndex}`;
    params.push(filters.max_points);
    paramIndex++;
  }

  if (filters.reward_type) {
    query += ` AND reward_type = $${paramIndex}`;
    params.push(filters.reward_type);
    paramIndex++;
  }

  // Filtrar por pontos do usuário se fornecido
  if (userId) {
    const userPoints = await getOrCreateLoyaltyPoints(userId);
    query += ` AND points_required <= $${paramIndex}`;
    params.push(userPoints.current_points);
    paramIndex++;
  }

  query += ` ORDER BY points_required ASC`;

  return await queryDatabase(query, params);
}

/**
 * Resgatar recompensa
 */
export async function redeemReward(
  userId: number,
  rewardId: number,
  bookingId?: number
): Promise<number> {
  // Verificar recompensa
  const rewards = await queryDatabase(
    `SELECT * FROM loyalty_rewards WHERE id = $1 AND is_active = true`,
    [rewardId]
  );

  if (rewards.length === 0) {
    throw new Error('Recompensa não encontrada ou inativa');
  }

  const reward = rewards[0];

  // Verificar estoque
  if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
    throw new Error('Recompensa esgotada');
  }

  // Verificar pontos do usuário
  const userPoints = await getOrCreateLoyaltyPoints(userId);
  if (userPoints.current_points < reward.points_required) {
    throw new Error('Pontos insuficientes');
  }

  // Usar pontos
  await redeemLoyaltyPoints(userId, reward.points_required, {
    transaction_type: 'redeemed',
    reference_type: 'reward',
    reference_id: rewardId,
    description: `Resgate: ${reward.name}`,
  });

  // Criar resgate
  const result = await queryDatabase(
    `INSERT INTO loyalty_redemptions 
     (user_id, loyalty_points_id, reward_id, booking_id, points_used, reward_value, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'approved')
     RETURNING id`,
    [
      userId,
      userPoints.id,
      rewardId,
      bookingId || null,
      reward.points_required,
      reward.reward_value || null,
    ]
  );

  // Atualizar estoque
  if (reward.stock_quantity !== null) {
    await queryDatabase(
      `UPDATE loyalty_rewards 
       SET stock_quantity = stock_quantity - 1
       WHERE id = $1`,
      [rewardId]
    );
  }

  return result[0].id;
}

/**
 * Obter histórico de transações
 */
export async function getLoyaltyHistory(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  return await queryDatabase(
    `SELECT * FROM loyalty_transactions 
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
}

/**
 * Obter histórico de resgates
 */
export async function getRedemptionHistory(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  return await queryDatabase(
    `SELECT r.*, rw.name as reward_name, rw.reward_type
     FROM loyalty_redemptions r
     JOIN loyalty_rewards rw ON r.reward_id = rw.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
}

