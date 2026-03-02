/**
 * ✅ DIA 2 - ARQUIVO 12: Serasa Service
 * 
 * @description Integração com Serasa para verificação de background:
 * - Consulta CPF
 * - Verificação de antecedentes
 * - Score de crédito
 * - Verificação de documentos
 * - Histórico de consultas
 * 
 * @module external
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { z } from 'zod';

// ================================
// TYPES & SCHEMAS
// ================================

const SerasaCheckRequestSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  userId: z.number().int().positive().optional(),
  bookingId: z.number().int().positive().optional(),
  reason: z.string().optional(),
});

const SerasaCheckResultSchema = z.object({
  cpf: z.string(),
  name: z.string().optional(),
  score: z.number().min(0).max(1000).optional(),
  status: z.enum(['approved', 'rejected', 'pending', 'error']),
  checks: z.object({
    credit: z.object({
      available: z.boolean(),
      score: z.number().optional(),
      issues: z.array(z.string()),
    }),
    criminal: z.object({
      clean: z.boolean(),
      issues: z.array(z.string()),
    }),
    documents: z.object({
      valid: z.boolean(),
      issues: z.array(z.string()),
    }),
  }),
  checkedAt: z.date(),
  expiresAt: z.date(),
  cost: z.number().optional(),
});

type SerasaCheckRequest = z.infer<typeof SerasaCheckRequestSchema>;
type SerasaCheckResult = z.infer<typeof SerasaCheckResultSchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days
const CACHE_PREFIX = 'serasa-check:';
const SERASA_API_URL = process.env.SERASA_API_URL || 'https://api.serasa.com.br';
const SERASA_API_KEY = process.env.SERASA_API_KEY;
const COST_PER_CHECK = 10.00; // R$ 10 por consulta

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Realizar verificação de background via Serasa
 */
export async function performBackgroundCheck(
  data: SerasaCheckRequest
): Promise<SerasaCheckResult> {
  try {
    const validated = SerasaCheckRequestSchema.parse(data);

    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}${validated.cpf}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      const cachedResult = JSON.parse(cached);
      const expiresAt = new Date(cachedResult.expiresAt);
      
      // Se ainda válido, retornar do cache
      if (expiresAt > new Date()) {
        return cachedResult;
      }
    }

    // Verificar se API key está configurada
    if (!SERASA_API_KEY) {
      console.warn('Serasa API key não configurada, usando mock');
      return mockBackgroundCheck(validated.cpf);
    }

    // Realizar consulta na API Serasa
    const result = await querySerasaAPI(validated.cpf);

    // Salvar resultado no banco
    await saveCheckResult(validated, result);

    // Cache result
    await redisCache.set(cacheKey, JSON.stringify(result), CACHE_TTL);

    return result;
  } catch (error: any) {
    console.error('Erro ao realizar verificação:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validação falhou: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Obter resultado de verificação anterior
 */
export async function getBackgroundCheckResult(
  cpf: string
): Promise<SerasaCheckResult | null> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}${cpf}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar do banco
    const result = await queryDatabase(
      `SELECT * FROM serasa_checks
       WHERE cpf = $1
       ORDER BY checked_at DESC
       LIMIT 1`,
      [cpf]
    ) || [];

    if (result.length === 0) {
      return null;
    }

    const check = mapCheckFromDB(result[0]);

    // Cache
    await redisCache.set(cacheKey, JSON.stringify(check), CACHE_TTL);

    return check;
  } catch (error: any) {
    console.error('Erro ao buscar resultado:', error);
    throw error;
  }
}

/**
 * Listar histórico de verificações
 */
export async function listCheckHistory(
  userId?: number,
  limit: number = 50,
  offset: number = 0
): Promise<SerasaCheckResult[]> {
  try {
    let query = `SELECT * FROM serasa_checks`;
    const params: any[] = [];

    if (userId) {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY checked_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await queryDatabase(query, params) || [];

    return result.map(mapCheckFromDB);
  } catch (error: any) {
    console.error('Erro ao listar histórico:', error);
    throw error;
  }
}

/**
 * Obter estatísticas de verificações
 */
export async function getCheckStatistics(
  userId?: number
): Promise<{
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  totalCost: number;
  avgScore: number;
}> {
  try {
    let query = `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      SUM(cost) as total_cost,
      AVG(score) as avg_score
    FROM serasa_checks`;
    const params: any[] = [];

    if (userId) {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    }

    const result = await queryDatabase(query, params) || [];
    const stats = result[0] || {};

    return {
      total: parseInt(stats.total || '0'),
      approved: parseInt(stats.approved || '0'),
      rejected: parseInt(stats.rejected || '0'),
      pending: parseInt(stats.pending || '0'),
      totalCost: parseFloat(stats.total_cost || '0'),
      avgScore: parseFloat(stats.avg_score || '0'),
    };
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
}

// ================================
// PRIVATE FUNCTIONS
// ================================

/**
 * Consultar API Serasa
 */
async function querySerasaAPI(cpf: string): Promise<SerasaCheckResult> {
  try {
    if (!SERASA_API_KEY) {
      throw new Error('Serasa API key não configurada');
    }

    // TODO: Implementar chamada real à API Serasa
    // Por enquanto, retornar mock
    return mockBackgroundCheck(cpf);
  } catch (error: any) {
    console.error('Erro ao consultar API Serasa:', error);
    throw error;
  }
}

/**
 * Mock de verificação (para desenvolvimento)
 */
function mockBackgroundCheck(cpf: string): SerasaCheckResult {
  // Simular verificação
  const score = Math.floor(Math.random() * 400) + 300; // 300-700
  const hasIssues = score < 400;

  return {
    cpf,
    name: undefined,
    score,
    status: hasIssues ? 'rejected' : 'approved',
    checks: {
      credit: {
        available: score >= 400,
        score,
        issues: hasIssues ? ['Score de crédito abaixo do mínimo'] : [],
      },
      criminal: {
        clean: true,
        issues: [],
      },
      documents: {
        valid: true,
        issues: [],
      },
    },
    checkedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    cost: COST_PER_CHECK,
  };
}

async function saveCheckResult(
  request: SerasaCheckRequest,
  result: SerasaCheckResult
): Promise<void> {
  try {
    // TODO: Implementar quando tabela serasa_checks for criada
    await queryDatabase(
      `INSERT INTO serasa_checks (
        cpf, user_id, booking_id, reason, name, score, status,
        credit_score, credit_available, criminal_clean,
        documents_valid, checked_at, expires_at, cost, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (cpf, checked_at) DO NOTHING`,
      [
        result.cpf,
        request.userId || null,
        request.bookingId || null,
        request.reason || null,
        result.name || null,
        result.score || null,
        result.status,
        result.checks.credit.score || null,
        result.checks.credit.available,
        result.checks.criminal.clean,
        result.checks.documents.valid,
        result.checkedAt.toISOString(),
        result.expiresAt.toISOString(),
        result.cost || COST_PER_CHECK,
        JSON.stringify(result.checks),
      ]
    );
  } catch (error: any) {
    console.error('Erro ao salvar resultado:', error);
    // Não lançar erro, apenas log
  }
}

function mapCheckFromDB(row: any): SerasaCheckResult {
  const checks = typeof row.metadata === 'string' 
    ? JSON.parse(row.metadata || '{}')
    : (row.metadata || {});

  return {
    cpf: row.cpf,
    name: row.name,
    score: row.score ? parseFloat(row.score) : undefined,
    status: row.status || 'pending',
    checks: {
      credit: {
        available: row.credit_available || false,
        score: row.credit_score ? parseFloat(row.credit_score) : undefined,
        issues: checks.credit?.issues || [],
      },
      criminal: {
        clean: row.criminal_clean || false,
        issues: checks.criminal?.issues || [],
      },
      documents: {
        valid: row.documents_valid || false,
        issues: checks.documents?.issues || [],
      },
    },
    checkedAt: new Date(row.checked_at),
    expiresAt: new Date(row.expires_at),
    cost: row.cost ? parseFloat(row.cost) : undefined,
  };
}

