/**
 * ✅ ITENS 39-42: SERVIÇO DO PROGRAMA TOP HOST
 * Sistema completo de ratings, badges e métricas de qualidade
 */

import { queryDatabase } from './db';
import { cacheQuality, invalidateQualityCache } from './cache-integration';

export interface HostRating {
  id: number;
  host_id: number;
  item_id?: number;
  rating_type: 'response_time' | 'cleanliness' | 'communication' | 'accuracy' | 'check_in' | 'value' | 'overall';
  rating_value: number;
  review_count: number;
  last_updated: string;
  created_at: string;
}

export interface HostBadge {
  id: number;
  badge_key: string;
  badge_name: string;
  badge_description?: string;
  badge_icon?: string;
  badge_category: 'quality' | 'performance' | 'achievement' | 'special';
  criteria: any;
  is_active: boolean;
  created_at: string;
}

export interface HostBadgeAssignment {
  id: number;
  host_id: number;
  badge_id: number;
  item_id?: number;
  earned_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface QualityMetric {
  id: number;
  host_id: number;
  item_id?: number;
  metric_type: 'response_rate' | 'response_time' | 'cancellation_rate' | 'occupancy_rate' | 'revenue' | 'guest_satisfaction';
  metric_value: number;
  metric_unit?: string;
  period_start: string;
  period_end: string;
  calculated_at: string;
}

export interface HostScore {
  id: number;
  host_id: number;
  item_id?: number;
  overall_score: number;
  quality_score?: number;
  performance_score?: number;
  guest_satisfaction_score?: number;
  calculated_at: string;
}

/**
 * ✅ ITEM 39: RATINGS OPERACIONAIS
 */
export async function updateHostRating(
  hostId: number,
  ratingType: HostRating['rating_type'],
  ratingValue: number,
  itemId?: number
): Promise<HostRating> {
  // Invalidar cache antes de atualizar
  await invalidateQualityCache(hostId);
  // Buscar rating existente
  const existing = await queryDatabase(
    `SELECT * FROM host_ratings 
     WHERE host_id = $1 AND rating_type = $2 ${itemId ? 'AND item_id = $3' : 'AND item_id IS NULL'}`,
    itemId ? [hostId, ratingType, itemId] : [hostId, ratingType]
  );

  if (existing.length > 0) {
    // Atualizar rating (média ponderada)
    const current = existing[0] as HostRating;
    const newReviewCount = current.review_count + 1;
    const newRating = (current.rating_value * current.review_count + ratingValue) / newReviewCount;

    const result = await queryDatabase(
      `UPDATE host_ratings 
       SET rating_value = $1, review_count = $2, last_updated = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [newRating, newReviewCount, current.id]
    );

    return result[0] as HostRating;
  } else {
    // Criar novo rating
    const result = await queryDatabase(
      `INSERT INTO host_ratings (host_id, item_id, rating_type, rating_value, review_count)
       VALUES ($1, $2, $3, $4, 1)
       RETURNING *`,
      [hostId, itemId || null, ratingType, ratingValue]
    );

    return result[0] as HostRating;
  }
}

/**
 * Obter ratings de um host
 */
export async function getHostRatings(
  hostId: number,
  itemId?: number
): Promise<HostRating[]> {
  const cacheKey = `rsv:quality:ratings:${hostId}:${itemId || 'all'}`;
  
  return cacheQuality(hostId, async () => {
    let query = `SELECT * FROM host_ratings WHERE host_id = $1`;
    const params: any[] = [hostId];

    if (itemId) {
      query += ` AND item_id = $2`;
      params.push(itemId);
    } else {
      query += ` AND item_id IS NULL`;
    }

    query += ` ORDER BY rating_type`;

    return await queryDatabase(query, params) as HostRating[];
  });
}

/**
 * ✅ ITEM 39: CALCULAR SCORE GERAL
 */
export async function calculateHostScore(
  hostId: number,
  itemId?: number
): Promise<HostScore> {
  return cacheQuality(hostId, async () => {
    const ratings = await getHostRatings(hostId, itemId);

    if (ratings.length === 0) {
      // Criar score inicial
      const result = await queryDatabase(
        `INSERT INTO host_scores (host_id, item_id, overall_score, quality_score, performance_score, guest_satisfaction_score)
         VALUES ($1, $2, 0, 0, 0, 0)
         RETURNING *`,
        [hostId, itemId || null]
      );
      return result[0] as HostScore;
    }

    // Calcular scores
    const overallRating = ratings.find((r) => r.rating_type === 'overall');
    const qualityRatings = ratings.filter((r) =>
      ['cleanliness', 'accuracy', 'value'].includes(r.rating_type)
    );
    const performanceRatings = ratings.filter((r) =>
      ['response_time', 'communication', 'check_in'].includes(r.rating_type)
    );

    const qualityScore =
      qualityRatings.length > 0
        ? (qualityRatings.reduce((sum, r) => sum + r.rating_value, 0) / qualityRatings.length) * 20
        : 0;

    const performanceScore =
      performanceRatings.length > 0
        ? (performanceRatings.reduce((sum, r) => sum + r.rating_value, 0) / performanceRatings.length) * 20
        : 0;

    const guestSatisfactionScore = overallRating ? overallRating.rating_value * 20 : 0;

    const overallScore = (qualityScore + performanceScore + guestSatisfactionScore) / 3;

    // Salvar ou atualizar score
    const existing = await queryDatabase(
      `SELECT * FROM host_scores 
       WHERE host_id = $1 ${itemId ? 'AND item_id = $2' : 'AND item_id IS NULL'}`,
      itemId ? [hostId, itemId] : [hostId]
    );

    let result;
    if (existing.length > 0) {
      result = await queryDatabase(
        `UPDATE host_scores 
         SET overall_score = $1, quality_score = $2, performance_score = $3, guest_satisfaction_score = $4, calculated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [overallScore, qualityScore, performanceScore, guestSatisfactionScore, existing[0].id]
      );
    } else {
      result = await queryDatabase(
        `INSERT INTO host_scores (host_id, item_id, overall_score, quality_score, performance_score, guest_satisfaction_score)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [hostId, itemId || null, overallScore, qualityScore, performanceScore, guestSatisfactionScore]
      );
    }

    return result[0] as HostScore;
  });
}

/**
 * ✅ ITEM 40: BADGES
 */
export async function createBadge(
  badgeKey: string,
  badgeName: string,
  badgeDescription: string,
  badgeCategory: HostBadge['badge_category'],
  criteria: any,
  badgeIcon?: string
): Promise<HostBadge> {
  const result = await queryDatabase(
    `INSERT INTO host_badges (badge_key, badge_name, badge_description, badge_icon, badge_category, criteria)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [badgeKey, badgeName, badgeDescription, badgeIcon || null, badgeCategory, JSON.stringify(criteria)]
  );

  return result[0] as HostBadge;
}

/**
 * Listar badges disponíveis
 */
export async function listBadges(activeOnly: boolean = true): Promise<HostBadge[]> {
  let query = `SELECT * FROM host_badges`;
  const params: any[] = [];

  if (activeOnly) {
    query += ` WHERE is_active = true`;
  }

  query += ` ORDER BY badge_category, badge_name`;

  return await queryDatabase(query, params) as HostBadge[];
}

/**
 * Obter badges de um host
 */
export async function getHostBadges(
  hostId: number,
  itemId?: number,
  activeOnly: boolean = true
): Promise<Array<HostBadgeAssignment & { badge: HostBadge }>> {
  let query = `
    SELECT 
      hba.*,
      hb.badge_key,
      hb.badge_name,
      hb.badge_description,
      hb.badge_icon,
      hb.badge_category,
      hb.criteria
    FROM host_badge_assignments hba
    JOIN host_badges hb ON hba.badge_id = hb.id
    WHERE hba.host_id = $1
  `;
  const params: any[] = [hostId];

  if (itemId) {
    query += ` AND hba.item_id = $${params.length + 1}`;
    params.push(itemId);
  } else {
    query += ` AND hba.item_id IS NULL`;
  }

  if (activeOnly) {
    query += ` AND hba.is_active = true`;
    query += ` AND (hba.expires_at IS NULL OR hba.expires_at > CURRENT_TIMESTAMP)`;
  }

  query += ` ORDER BY hba.earned_at DESC`;

  const assignments = await queryDatabase(query, params);

  return assignments.map((a: any) => ({
    id: a.id,
    host_id: a.host_id,
    badge_id: a.badge_id,
    item_id: a.item_id,
    earned_at: a.earned_at,
    expires_at: a.expires_at,
    is_active: a.is_active,
    badge: {
      id: a.badge_id,
      badge_key: a.badge_key,
      badge_name: a.badge_name,
      badge_description: a.badge_description,
      badge_icon: a.badge_icon,
      badge_category: a.badge_category,
      criteria: a.criteria,
      is_active: true,
      created_at: '',
    },
  }));
}

/**
 * Atribuir badge a um host
 */
export async function assignBadgeToHost(
  hostId: number,
  badgeId: number,
  itemId?: number,
  expiresAt?: Date
): Promise<HostBadgeAssignment> {
  const result = await queryDatabase(
    `INSERT INTO host_badge_assignments (host_id, badge_id, item_id, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (host_id, badge_id, item_id) DO UPDATE SET
       is_active = true,
       earned_at = CURRENT_TIMESTAMP,
       expires_at = EXCLUDED.expires_at
     RETURNING *`,
    [hostId, badgeId, itemId || null, expiresAt ? expiresAt.toISOString() : null]
  );

  return result[0] as HostBadgeAssignment;
}

/**
 * Verificar e atribuir badges automaticamente
 */
export async function checkAndAssignBadges(hostId: number, itemId?: number): Promise<HostBadgeAssignment[]> {
  const badges = await listBadges(true);
  const ratings = await getHostRatings(hostId, itemId);
  const score = await calculateHostScore(hostId, itemId);
  const metrics = await getQualityMetrics(hostId, itemId);

  const assigned: HostBadgeAssignment[] = [];

  for (const badge of badges) {
    const criteria = badge.criteria;
    let shouldAssign = false;

    // Verificar critérios
    if (criteria.min_overall_score && score.overall_score >= criteria.min_overall_score) {
      shouldAssign = true;
    }

    if (criteria.min_rating && ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length;
      if (avgRating >= criteria.min_rating) {
        shouldAssign = true;
      }
    }

    if (criteria.min_review_count) {
      const totalReviews = ratings.reduce((sum, r) => sum + r.review_count, 0);
      if (totalReviews >= criteria.min_review_count) {
        shouldAssign = true;
      }
    }

    if (criteria.response_time_hours) {
      const responseTimeMetric = metrics.find((m) => m.metric_type === 'response_time');
      if (responseTimeMetric && responseTimeMetric.metric_value <= criteria.response_time_hours) {
        shouldAssign = true;
      }
    }

    if (shouldAssign) {
      const assignment = await assignBadgeToHost(hostId, badge.id, itemId);
      assigned.push(assignment);
    }
  }

  return assigned;
}

/**
 * ✅ ITEM 41: MÉTRICAS DE QUALIDADE
 */
export async function recordQualityMetric(
  hostId: number,
  metricType: QualityMetric['metric_type'],
  metricValue: number,
  periodStart: Date,
  periodEnd: Date,
  itemId?: number,
  metricUnit?: string
): Promise<QualityMetric> {
  const result = await queryDatabase(
    `INSERT INTO quality_metrics 
     (host_id, item_id, metric_type, metric_value, metric_unit, period_start, period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      hostId,
      itemId || null,
      metricType,
      metricValue,
      metricUnit || null,
      periodStart.toISOString().split('T')[0],
      periodEnd.toISOString().split('T')[0],
    ]
  );

  return result[0] as QualityMetric;
}

/**
 * Obter métricas de qualidade
 */
export async function getQualityMetrics(
  hostId: number,
  itemId?: number,
  metricType?: QualityMetric['metric_type'],
  limit: number = 100
): Promise<QualityMetric[]> {
  let query = `SELECT * FROM quality_metrics WHERE host_id = $1`;
  const params: any[] = [hostId];

  if (itemId) {
    query += ` AND item_id = $${params.length + 1}`;
    params.push(itemId);
  } else {
    query += ` AND item_id IS NULL`;
  }

  if (metricType) {
    query += ` AND metric_type = $${params.length + 1}`;
    params.push(metricType);
  }

  query += ` ORDER BY calculated_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  return await queryDatabase(query, params) as QualityMetric[];
}

/**
 * Obter dashboard de métricas
 */
export async function getHostDashboard(
  hostId: number,
  itemId?: number
): Promise<{
  scores: HostScore;
  ratings: HostRating[];
  badges: Array<HostBadgeAssignment & { badge: HostBadge }>;
  metrics: QualityMetric[];
}> {
  const scores = await calculateHostScore(hostId, itemId);
  const ratings = await getHostRatings(hostId, itemId);
  const badges = await getHostBadges(hostId, itemId, true);
  const metrics = await getQualityMetrics(hostId, itemId, undefined, 50);

  return {
    scores,
    ratings,
    badges,
    metrics,
  };
}

/**
 * ✅ ITEM 42: OBTER TOP HOSTS (LEADERBOARD)
 */
export async function getTopHosts(
  limit: number = 50,
  minBookings: number = 5,
  minScore?: number
): Promise<Array<{
  position: number;
  host_id: number;
  host_name?: string;
  host_email?: string;
  overall_score: number;
  quality_score?: number;
  performance_score?: number;
  guest_satisfaction_score?: number;
  total_ratings: number;
  total_bookings: number;
  badge_count: number;
  tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
}>> {
  let query = `
    SELECT 
      hs.host_id,
      u.name as host_name,
      u.email as host_email,
      hs.overall_score,
      hs.quality_score,
      hs.performance_score,
      hs.guest_satisfaction_score,
      COUNT(DISTINCT hr.id) as total_ratings,
      COUNT(DISTINCT b.id) as total_bookings,
      COUNT(DISTINCT hba.id) as badge_count
    FROM host_scores hs
    LEFT JOIN users u ON hs.host_id = u.id
    LEFT JOIN host_ratings hr ON hs.host_id = hr.host_id
    LEFT JOIN bookings b ON hs.host_id = b.host_id AND b.status IN ('confirmed', 'completed')
    LEFT JOIN host_badge_assignments hba ON hs.host_id = hba.host_id AND hba.is_active = true
    WHERE hs.overall_score > 0
  `;
  const params: any[] = [];

  if (minBookings > 0) {
    query += ` AND (SELECT COUNT(*) FROM bookings WHERE host_id = hs.host_id AND status IN ('confirmed', 'completed')) >= $${params.length + 1}`;
    params.push(minBookings);
  }

  if (minScore !== undefined) {
    query += ` AND hs.overall_score >= $${params.length + 1}`;
    params.push(minScore);
  }

  query += `
    GROUP BY hs.host_id, u.name, u.email, hs.overall_score, 
             hs.quality_score, hs.performance_score, hs.guest_satisfaction_score
    ORDER BY hs.overall_score DESC, total_ratings DESC, total_bookings DESC
    LIMIT $${params.length + 1}
  `;
  params.push(limit);

  const results = await queryDatabase(query, params);

  return results.map((host: any, index: number) => {
    const overallScore = parseFloat(host.overall_score || 0);
    let tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
    
    if (overallScore >= 4.8) tier = 'diamond';
    else if (overallScore >= 4.5) tier = 'platinum';
    else if (overallScore >= 4.0) tier = 'gold';
    else if (overallScore >= 3.5) tier = 'silver';
    else tier = 'bronze';

    return {
      position: index + 1,
      host_id: host.host_id,
      host_name: host.host_name,
      host_email: host.host_email,
      overall_score: overallScore,
      quality_score: host.quality_score ? parseFloat(host.quality_score) : undefined,
      performance_score: host.performance_score ? parseFloat(host.performance_score) : undefined,
      guest_satisfaction_score: host.guest_satisfaction_score ? parseFloat(host.guest_satisfaction_score) : undefined,
      total_ratings: parseInt(host.total_ratings || '0'),
      total_bookings: parseInt(host.total_bookings || '0'),
      badge_count: parseInt(host.badge_count || '0'),
      tier,
    };
  });
}

/**
 * ✅ Determinar nível do host (regular, top, superhost)
 */
export async function determineHostLevel(hostId: number, itemId?: number): Promise<'regular' | 'top' | 'superhost'> {
  const score = await calculateHostScore(hostId, itemId);
  const ratings = await getHostRatings(hostId, itemId);
  const metrics = await getQualityMetrics(hostId, itemId, 'response_time', 1);
  
  // Buscar taxa de aceitação e cancelamento
  const bookings = await queryDatabase(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
     FROM bookings
     WHERE host_id = $1 ${itemId ? 'AND property_id = $2' : ''}
     AND created_at >= CURRENT_DATE - INTERVAL '1 year'`,
    itemId ? [hostId, itemId] : [hostId]
  );

  const totalBookings = parseInt(bookings[0]?.total || '0');
  const confirmedBookings = parseInt(bookings[0]?.confirmed || '0');
  const cancelledBookings = parseInt(bookings[0]?.cancelled || '0');
  
  const acceptanceRate = totalBookings > 0 ? confirmedBookings / totalBookings : 0;
  const cancellationRate = totalBookings > 0 ? cancelledBookings / totalBookings : 0;
  
  const avgResponseTime = metrics.length > 0 ? metrics[0].metric_value : 24; // horas
  const overallRating = score.overall_score / 20; // Converter de 0-100 para 0-5

  // Critérios SuperHost:
  // - Rating >= 4.8
  // - Acceptance rate >= 90%
  // - Cancellation rate < 1%
  // - Response time < 1 hora
  // - 10+ reservas completas
  if (
    overallRating >= 4.8 &&
    acceptanceRate >= 0.90 &&
    cancellationRate < 0.01 &&
    avgResponseTime < 1 &&
    totalBookings >= 10
  ) {
    return 'superhost';
  }

  // Critérios Top Host:
  // - Rating >= 4.5
  // - Acceptance rate >= 80%
  // - 5+ reservas completas
  if (
    overallRating >= 4.5 &&
    acceptanceRate >= 0.80 &&
    totalBookings >= 5
  ) {
    return 'top';
  }

  return 'regular';
}

