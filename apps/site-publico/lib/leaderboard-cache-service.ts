/**
 * ✅ TAREFA HIGH-4: Melhorar Ranking Público (Cache e Paginação)
 * Implementa cache Redis e paginação para o leaderboard
 */

import { queryDatabase } from './db';
import { cacheGetOrSet, invalidateCache } from './cache-integration';

export interface LeaderboardEntry {
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
}

export interface LeaderboardFilters {
  minScore?: number;
  minBookings?: number;
  tier?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedLeaderboard {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Obter leaderboard com cache e paginação
 */
export async function getCachedLeaderboard(
  filters: LeaderboardFilters = {},
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedLeaderboard> {
  const cacheKey = `rsv:leaderboard:${JSON.stringify(filters)}:page:${page}:size:${pageSize}`;
  
  return await cacheGetOrSet(cacheKey, async () => {
    const { entries, total } = await getLeaderboardWithPagination(filters, page, pageSize);
    
    return {
      entries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }, 300); // Cache por 5 minutos
}

/**
 * Obter leaderboard com paginação
 */
async function getLeaderboardWithPagination(
  filters: LeaderboardFilters,
  page: number,
  pageSize: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  // Construir query base
  let whereClause = 'WHERE hs.overall_score > 0';
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.minScore !== undefined) {
    whereClause += ` AND hs.overall_score >= $${paramIndex}`;
    params.push(filters.minScore);
    paramIndex++;
  }

  if (filters.minBookings !== undefined) {
    whereClause += ` AND (SELECT COUNT(*) FROM bookings WHERE host_id = hs.host_id AND status IN ('confirmed', 'completed')) >= $${paramIndex}`;
    params.push(filters.minBookings);
    paramIndex++;
  }

  if (filters.tier) {
    // Determinar score mínimo para tier
    const tierScores: Record<string, number> = {
      diamond: 90,
      platinum: 80,
      gold: 70,
      silver: 60,
      bronze: 50,
    };
    const minTierScore = tierScores[filters.tier] || 0;
    whereClause += ` AND hs.overall_score >= $${paramIndex}`;
    params.push(minTierScore);
    paramIndex++;
  }

  // Query para total
  const countQuery = `
    SELECT COUNT(DISTINCT hs.host_id) as total
    FROM host_scores hs
    ${whereClause}
  `;

  const totalResult = await queryDatabase(countQuery, params);
  const total = parseInt(totalResult[0]?.total || '0');

  // Query para dados paginados
  const dataQuery = `
    SELECT 
      ROW_NUMBER() OVER (ORDER BY hs.overall_score DESC) as position,
      hs.host_id,
      u.name as host_name,
      u.email as host_email,
      hs.overall_score,
      hs.quality_score,
      hs.performance_score,
      hs.guest_satisfaction_score,
      COUNT(DISTINCT hr.id) as total_ratings,
      COUNT(DISTINCT b.id) as total_bookings,
      COUNT(DISTINCT hba.id) as badge_count,
      CASE
        WHEN hs.overall_score >= 90 THEN 'diamond'
        WHEN hs.overall_score >= 80 THEN 'platinum'
        WHEN hs.overall_score >= 70 THEN 'gold'
        WHEN hs.overall_score >= 60 THEN 'silver'
        ELSE 'bronze'
      END as tier
    FROM host_scores hs
    LEFT JOIN users u ON hs.host_id = u.id
    LEFT JOIN host_ratings hr ON hs.host_id = hr.host_id
    LEFT JOIN bookings b ON hs.host_id = b.host_id AND b.status IN ('confirmed', 'completed')
    LEFT JOIN host_badge_assignments hba ON hs.host_id = hba.host_id AND hba.is_active = true
    ${whereClause}
    GROUP BY hs.host_id, u.name, u.email, hs.overall_score, hs.quality_score, 
             hs.performance_score, hs.guest_satisfaction_score
    ORDER BY hs.overall_score DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);
  const entries = await queryDatabase(dataQuery, params);

  return {
    entries: entries.map((entry: any, index: number) => ({
      position: offset + index + 1,
      host_id: entry.host_id,
      host_name: entry.host_name,
      host_email: entry.host_email,
      overall_score: parseFloat(entry.overall_score),
      quality_score: entry.quality_score ? parseFloat(entry.quality_score) : undefined,
      performance_score: entry.performance_score ? parseFloat(entry.performance_score) : undefined,
      guest_satisfaction_score: entry.guest_satisfaction_score ? parseFloat(entry.guest_satisfaction_score) : undefined,
      total_ratings: parseInt(entry.total_ratings || '0'),
      total_bookings: parseInt(entry.total_bookings || '0'),
      badge_count: parseInt(entry.badge_count || '0'),
      tier: entry.tier,
    })) as LeaderboardEntry[],
    total,
  };
}

/**
 * Invalidar cache do leaderboard
 */
export async function invalidateLeaderboardCache(): Promise<void> {
  await invalidateCache('rsv:leaderboard:*');
}

