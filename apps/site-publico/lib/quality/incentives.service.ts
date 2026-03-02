/**
 * ✅ DIA 2 - ARQUIVO 8: Incentives Service
 * 
 * @description Sistema de incentivos para hosts:
 * - Badges e conquistas
 * - Pontos de fidelidade
 * - Recompensas por performance
 * - Programas de bonificação
 * - Histórico de incentivos
 * 
 * @module quality
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { getHostBadges, calculateHostScore } from '../top-host-service';
import { z } from 'zod';

// ================================
// TYPES & SCHEMAS
// ================================

const IncentiveSchema = z.object({
  id: z.string().uuid(),
  hostId: z.number().int().positive(),
  type: z.enum(['badge', 'points', 'bonus', 'discount', 'feature_unlock']),
  title: z.string(),
  description: z.string(),
  value: z.number(), // Pontos, valor em R$, etc
  earnedAt: z.date(),
  expiresAt: z.date().nullable(),
  status: z.enum(['active', 'used', 'expired']),
  metadata: z.record(z.any()).optional(),
});

const IncentiveProgramSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['performance', 'milestone', 'seasonal', 'promotional']),
  criteria: z.record(z.any()),
  reward: z.object({
    type: z.enum(['badge', 'points', 'bonus', 'discount']),
    value: z.number(),
  }),
  active: z.boolean(),
  startDate: z.date(),
  endDate: z.date().nullable(),
});

type Incentive = z.infer<typeof IncentiveSchema>;
type IncentiveProgram = z.infer<typeof IncentiveProgramSchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'incentives:';

// Pontos por ação
const POINTS_PER_ACTION = {
  booking_completed: 10,
  review_received: 5,
  badge_earned: 20,
  property_verified: 50,
  month_perfect_rating: 100,
};

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Obter incentivos ativos de um host
 */
export async function getHostIncentives(
  hostId: number
): Promise<Incentive[]> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}host:${hostId}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar do banco (se tabela existir)
    // Otimizado: SELECT campos específicos ao invés de SELECT *
    const incentives = await queryDatabase(
      `SELECT id, host_id, incentive_type, incentive_value, incentive_description,
              criteria_met, awarded_at, expires_at, is_active
       FROM host_incentives
       WHERE host_id = $1
       AND is_active = true
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY awarded_at DESC
       LIMIT 100`,
      [hostId]
    ) || [];

    const mapped = incentives.map(mapIncentiveFromDB);

    // Cache
    await redisCache.set(cacheKey, JSON.stringify(mapped), CACHE_TTL);

    return mapped;
  } catch (error: any) {
    console.error('Erro ao buscar incentivos:', error);
    throw error;
  }
}

/**
 * Adicionar pontos ao host
 */
export async function addPoints(
  hostId: number,
  points: number,
  reason: string
): Promise<Incentive> {
  try {
    // Buscar pontos atuais
    const currentPoints = await getHostPoints(hostId);

    // Criar incentivo de pontos
    const incentive: Incentive = {
      id: `incentive-${Date.now()}`,
      hostId,
      type: 'points',
      title: `Pontos: ${reason}`,
      description: `${points} pontos adicionados`,
      value: points,
      earnedAt: new Date(),
      expiresAt: null,
      status: 'active',
      metadata: { reason },
    };

    // Salvar no banco (se tabela existir)
    await saveIncentive(incentive);

    // Atualizar total de pontos
    await updateHostPoints(hostId, currentPoints + points);

    // Invalidar cache
    await redisCache.del(`${CACHE_PREFIX}host:${hostId}`);
    await redisCache.del(`${CACHE_PREFIX}points:${hostId}`);

    return incentive;
  } catch (error: any) {
    console.error('Erro ao adicionar pontos:', error);
    throw error;
  }
}

/**
 * Obter total de pontos do host
 */
export async function getHostPoints(hostId: number): Promise<number> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}points:${hostId}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return parseInt(cached);
    }

    // Buscar do banco
    const result = await queryDatabase(
      `SELECT COALESCE(SUM(value), 0) as total_points
       FROM host_incentives
       WHERE host_id = $1
       AND type = 'points'
       AND status = 'active'`,
      [hostId]
    ) || [];

    const totalPoints = parseInt(result[0]?.total_points || '0');

    // Cache
    await redisCache.set(cacheKey, totalPoints.toString(), CACHE_TTL);

    return totalPoints;
  } catch (error: any) {
    console.error('Erro ao buscar pontos:', error);
    return 0;
  }
}

/**
 * Verificar e conceder incentivos baseados em performance
 */
export async function checkAndGrantIncentives(
  hostId: number
): Promise<Incentive[]> {
  try {
    const granted: Incentive[] = [];

    // 1. Verificar badges
    const badges = await getHostBadges(hostId);
    for (const badgeAssignment of badges) {
      // badgeAssignment tem a estrutura: HostBadgeAssignment & { badge: HostBadge }
      // A query SQL retorna badge_name diretamente, então podemos acessar assim:
      const badgeName = (badgeAssignment as any).badge_name || badgeAssignment.badge?.badge_name || 'Badge';
      const badgeId = badgeAssignment.badge_id || badgeAssignment.badge?.id;
      const badgeDescription = (badgeAssignment as any).badge_description || badgeAssignment.badge?.badge_description || '';
      
      // Verificar se badge já foi concedido como incentivo
      // Otimizado: SELECT apenas id para verificar existência
      const existing = await queryDatabase(
        `SELECT id FROM host_incentives
         WHERE host_id = $1
         AND incentive_type = 'badge'
         AND criteria_met->>'badgeId' = $2
         LIMIT 1`,
        [hostId, badgeId?.toString() || '']
      ) || [];

      if (existing.length === 0 && badgeId) {
        // Conceder badge como incentivo
        const incentive = await grantIncentive(hostId, {
          type: 'badge',
          title: `Badge: ${badgeName}`,
          description: badgeDescription,
          value: POINTS_PER_ACTION.badge_earned,
          metadata: { badgeId: badgeId },
        });
        granted.push(incentive);

        // Adicionar pontos por badge
        await addPoints(hostId, POINTS_PER_ACTION.badge_earned, `Badge: ${badgeName}`);
      }
    }

    // 2. Verificar score do host
    const score = await calculateHostScore(hostId);
    if (score.overall_score >= 95) {
      // Verificar se já concedeu incentivo de score perfeito este mês
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      // Otimizado: SELECT apenas id para verificar existência
      const existing = await queryDatabase(
        `SELECT id FROM host_incentives
         WHERE host_id = $1
         AND incentive_type = 'bonus'
         AND criteria_met->>'type' = 'perfect_score'
         AND awarded_at >= $2
         LIMIT 1`,
        [hostId, thisMonth.toISOString()]
      ) || [];

      if (existing.length === 0) {
        const incentive = await grantIncentive(hostId, {
          type: 'bonus',
          title: 'Score Perfeito do Mês',
          description: `Score de ${score.overall_score}% - Excelente trabalho!`,
          value: POINTS_PER_ACTION.month_perfect_rating,
          metadata: { type: 'perfect_score', score: score.overall_score },
        });
        granted.push(incentive);
      }
    }

    // 3. Verificar programas de incentivo ativos
    const programs = await getActiveIncentivePrograms();
    for (const program of programs) {
      if (await checkProgramCriteria(hostId, program)) {
        // Aplicar recompensa do programa usando função SQL
        try {
          await applyProgramReward(hostId, program);
          
          // Criar incentivo para tracking
          const incentive = await grantIncentive(hostId, {
            type: program.reward.type as Incentive['type'],
            title: program.name,
            description: program.description,
            value: program.reward.value,
            metadata: { programId: program.id },
          });
          granted.push(incentive);
        } catch (error: any) {
          console.error(`Erro ao aplicar recompensa do programa ${program.id}:`, error);
          // Continuar com outros programas mesmo se um falhar
        }
      }
    }

    return granted;
  } catch (error: any) {
    console.error('Erro ao verificar incentivos:', error);
    throw error;
  }
}

/**
 * Usar incentivo (pontos, desconto, etc)
 */
export async function useIncentive(
  incentiveId: string,
  hostId: number
): Promise<boolean> {
  try {
    // Buscar incentivo
    // Otimizado: SELECT apenas campos necessários
    const incentive = await queryDatabase(
      `SELECT id, host_id, incentive_type, incentive_value, expires_at, is_active
       FROM host_incentives
       WHERE id = $1 AND host_id = $2 AND is_active = true
       LIMIT 1`,
      [incentiveId, hostId]
    ) || [];

    if (incentive.length === 0) {
      throw new Error('Incentivo não encontrado ou já usado');
    }

    // Verificar se expirou
    if (incentive[0].expires_at && new Date(incentive[0].expires_at) < new Date()) {
      throw new Error('Incentivo expirado');
    }

    // Marcar como usado
    await queryDatabase(
      `UPDATE host_incentives
       SET status = 'used',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [incentiveId]
    );

    // Invalidar cache
    await redisCache.del(`${CACHE_PREFIX}host:${hostId}`);

    return true;
  } catch (error: any) {
    console.error('Erro ao usar incentivo:', error);
    throw error;
  }
}

/**
 * Obter histórico de incentivos
 */
export async function getIncentiveHistory(
  hostId: number,
  limit: number = 50,
  offset: number = 0
): Promise<Incentive[]> {
  try {
    // Otimizado: SELECT apenas campos necessários para histórico
    const result = await queryDatabase(
      `SELECT id, host_id, incentive_type, incentive_value, incentive_description,
              criteria_met, awarded_at, expires_at, is_active
       FROM host_incentives
       WHERE host_id = $1
       ORDER BY awarded_at DESC
       LIMIT $2 OFFSET $3`,
      [hostId, limit, offset]
    ) || [];

    return result.map(mapIncentiveFromDB);
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
}

// ================================
// PRIVATE FUNCTIONS
// ================================

/**
 * Calcular data de expiração baseada no tipo de incentivo
 */
function calculateExpirationDate(incentiveType: Incentive['type']): Date | null {
  const now = new Date();
  
  switch (incentiveType) {
    case 'points':
      // Pontos expiram em 1 ano
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    case 'discount':
      // Descontos expiram em 90 dias
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    case 'badge':
      // Badges não expiram
      return null;
    
    case 'priority_support':
      // Suporte prioritário expira em 30 dias
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    case 'feature_access':
      // Acesso a features expira em 60 dias
      return new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    
    case 'commission_reduction':
      // Redução de comissão expira em 180 dias
      return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    
    default:
      // Padrão: 90 dias
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  }
}

async function grantIncentive(
  hostId: number,
  data: {
    type: Incentive['type'];
    title: string;
    description: string;
    value: number;
    metadata?: Record<string, any>;
  }
): Promise<Incentive> {
  const incentive: Incentive = {
    id: `incentive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hostId,
    type: data.type,
    title: data.title,
    description: data.description,
    value: data.value,
    earnedAt: new Date(),
    expiresAt: calculateExpirationDate(data.type), // Expiração baseada no tipo de incentivo
    status: 'active',
    metadata: data.metadata,
  };

  await saveIncentive(incentive);
  await redisCache.del(`${CACHE_PREFIX}host:${hostId}`);

  return incentive;
}

async function saveIncentive(incentive: Incentive): Promise<void> {
  try {
    // A tabela host_incentives existe na migration 017
    // Para incentivos do tipo 'points', usar host_points também
    if (incentive.type === 'points' && incentive.value > 0) {
      // Usar função SQL add_host_points da migration 018
      await queryDatabase(
        `SELECT add_host_points($1, $2, $3::points_source_enum, $4, $5, $6, $7)`,
        [
          incentive.hostId,
          incentive.value,
          'promotion', // source
          null, // source_id
          incentive.description || incentive.title,
          incentive.expiresAt ? Math.ceil((incentive.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
          JSON.stringify({ 
            incentiveId: incentive.id,
            type: incentive.type,
            metadata: incentive.metadata 
          })
        ]
      );
    }
    
    // Salvar na tabela host_incentives (se existir)
    try {
      await queryDatabase(
        `INSERT INTO host_incentives 
         (host_id, incentive_type, incentive_value, incentive_description, 
          criteria_met, awarded_at, expires_at, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          incentive.hostId,
          incentive.type,
          incentive.value,
          incentive.description || incentive.title,
          JSON.stringify(incentive.metadata || {}),
          incentive.earnedAt,
          incentive.expiresAt,
          incentive.status === 'active'
        ]
      );
    } catch (tableError: any) {
      // Se tabela não existir, apenas log (não é crítico)
      console.log('Tabela host_incentives não disponível, usando apenas host_points');
    }
  } catch (error: any) {
    console.error('Erro ao salvar incentivo:', error);
    throw new Error(`Falha ao salvar incentivo: ${error.message}`);
  }
}

async function updateHostPoints(
  hostId: number, 
  points: number, 
  source: string = 'manual_adjustment', 
  sourceId?: number
): Promise<void> {
  try {
    // Usar função SQL add_host_points da migration 018
    if (points > 0) {
      await queryDatabase(
        `SELECT add_host_points($1, $2, $3::points_source_enum, $4, $5, $6, $7)`,
        [
          hostId,
          points,
          source,
          sourceId || null,
          `Pontos ganhos via ${source}`,
          null, // expires_in_days (pode ser configurável)
          JSON.stringify({ source, sourceId })
        ]
      );
    } else if (points < 0) {
      // Gastar pontos usando função spend_host_points
      await queryDatabase(
        `SELECT spend_host_points($1, $2, $3::points_source_enum, $4, $5, $6)`,
        [
          hostId,
          Math.abs(points),
          source,
          sourceId || null,
          `Pontos gastos via ${source}`,
          JSON.stringify({ source, sourceId })
        ]
      );
    }
    
    // Atualizar cache com total atualizado
    const totalResult = await queryDatabase(
      `SELECT calculate_host_total_points($1) as total`,
      [hostId]
    );
    
    if (totalResult && totalResult.length > 0) {
      const totalPoints = totalResult[0].total;
      await redisCache.set(
        `${CACHE_PREFIX}points:${hostId}`, 
        totalPoints.toString(), 
        CACHE_TTL
      );
    }
  } catch (error: any) {
    console.error('Erro ao atualizar pontos:', error);
    throw new Error(`Falha ao atualizar pontos: ${error.message}`);
  }
}

async function getActiveIncentivePrograms(): Promise<IncentiveProgram[]> {
  try {
    // Usar view active_incentive_programs da migration 019
    // Otimizado: View já retorna apenas campos necessários
    const programs = await queryDatabase(
      `SELECT id, name, description, type, reward_value, criteria, 
              priority, sort_order, start_date, end_date, is_active
       FROM active_incentive_programs
       ORDER BY priority DESC, sort_order ASC
       LIMIT 50`
    ) || [];
    
    return programs.map(mapProgramFromDB);
  } catch (error: any) {
    console.error('Erro ao buscar programas:', error);
    return [];
  }
}

function mapProgramFromDB(row: any): IncentiveProgram {
  // Parse reward JSONB
  let rewardValue = 0;
  let rewardType: IncentiveProgram['reward']['type'] = 'points';
  
  if (row.reward) {
    const reward = typeof row.reward === 'string' ? JSON.parse(row.reward || '{}') : row.reward;
    rewardValue = reward.points || reward.value || 0;
    rewardType = mapRewardType(row.program_type);
  }
  
  return {
    id: row.id.toString(),
    name: row.program_name,
    description: row.program_description || '',
    type: mapProgramType(row.program_type),
    criteria: typeof row.criteria === 'string' ? JSON.parse(row.criteria || '{}') : (row.criteria || {}),
    reward: {
      type: rewardType,
      value: rewardValue
    },
    active: row.is_active !== false,
    startDate: row.starts_at ? new Date(row.starts_at) : new Date(),
    endDate: row.ends_at ? new Date(row.ends_at) : null
  };
}

function mapProgramType(dbType: string): IncentiveProgram['type'] {
  const typeMap: Record<string, IncentiveProgram['type']> = {
    'points': 'performance',
    'discount': 'promotional',
    'badge': 'milestone',
    'feature': 'performance',
    'commission': 'promotional',
    'priority': 'performance',
    'cash_bonus': 'promotional',
    'visibility': 'promotional'
  };
  return typeMap[dbType] || 'performance';
}

function mapRewardType(dbType: string): IncentiveProgram['reward']['type'] {
  const rewardMap: Record<string, IncentiveProgram['reward']['type']> = {
    'points': 'points',
    'discount': 'discount',
    'badge': 'badge',
    'cash_bonus': 'bonus'
  };
  return rewardMap[dbType] || 'points';
}

async function checkProgramCriteria(
  hostId: number,
  program: IncentiveProgram
): Promise<boolean> {
  try {
    // Usar função SQL check_program_eligibility da migration 019
    // program.id pode ser UUID ou program_key, precisamos buscar o program_key
    let programKey: string;
    
    if (program.id.includes('-')) {
      // É UUID, buscar program_key do banco
      const keyResult = await queryDatabase(
        `SELECT program_key FROM incentive_programs WHERE id::text = $1`,
        [program.id]
      );
      if (!keyResult || keyResult.length === 0) {
        return false;
      }
      programKey = keyResult[0].program_key;
    } else {
      // Assumir que é o program_key diretamente
      programKey = program.id;
    }
    
    const result = await queryDatabase(
      `SELECT check_program_eligibility($1, $2) as eligible`,
      [hostId, programKey]
    );
    
    return result && result.length > 0 ? result[0].eligible : false;
  } catch (error: any) {
    console.error('Erro ao verificar critérios do programa:', error);
    // Se a função SQL não existir ainda, retornar false
    return false;
  }
}

async function getProgramKeyById(programId: string): Promise<string | null> {
  try {
    const result = await queryDatabase(
      `SELECT program_key FROM incentive_programs WHERE id::text = $1`,
      [programId]
    );
    return result && result.length > 0 ? result[0].program_key : null;
  } catch (error: any) {
    console.error('Erro ao buscar program_key:', error);
    return null;
  }
}

async function applyProgramReward(
  hostId: number,
  program: IncentiveProgram
): Promise<void> {
  try {
    // Buscar program_id (BIGINT) do banco usando program_key ou id
    let programId: number | null = null;
    
    if (program.id.includes('-')) {
      // É UUID, buscar ID numérico
      const result = await queryDatabase(
        `SELECT id FROM incentive_programs WHERE id::text = $1`,
        [program.id]
      );
      programId = result && result.length > 0 ? result[0].id : null;
    } else {
      // Assumir que é o ID numérico
      programId = parseInt(program.id);
    }
    
    if (!programId || isNaN(programId)) {
      throw new Error(`Programa não encontrado: ${program.id}`);
    }
    
    // Usar função SQL apply_program_reward da migration 019
    await queryDatabase(
      `SELECT apply_program_reward($1, $2) as success`,
      [hostId, programId]
    );
    
    // Invalidar cache
    await redisCache.del(`${CACHE_PREFIX}host:${hostId}`);
    await redisCache.del(`${CACHE_PREFIX}programs`);
  } catch (error: any) {
    console.error('Erro ao aplicar recompensa do programa:', error);
    throw new Error(`Falha ao aplicar recompensa: ${error.message}`);
  }
}

function mapIncentiveFromDB(row: any): Incentive {
  return {
    id: row.id,
    hostId: row.host_id,
    type: row.type,
    title: row.title,
    description: row.description,
    value: parseFloat(row.value || '0'),
    earnedAt: new Date(row.earned_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    status: row.status || 'active',
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : (row.metadata || {}),
  };
}

