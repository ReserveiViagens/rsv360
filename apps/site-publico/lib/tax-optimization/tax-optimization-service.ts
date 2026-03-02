/**
 * Serviço de Tributação Otimizada
 * Cálculos, simulações e alertas de thresholds
 */

import { queryDatabase } from '../db';
import type { TaxDeduction, TaxSimulation, TaxRegime } from './types';

const SIMPLES_RATES: Record<string, number> = {
  commerce: 6,
  industry: 8,
  services: 15,
  mixed: 12,
};

const THRESHOLD_ANNUAL = 240000;
const THRESHOLD_PROPERTIES = 3;

/**
 * Listar deduções
 */
export async function listDeductions(filters?: {
  period_start?: string;
  period_end?: string;
  approved?: boolean;
}): Promise<TaxDeduction[]> {
  let sql = 'SELECT * FROM tax_deductions WHERE 1=1';
  const params: unknown[] = [];
  let i = 1;

  if (filters?.period_start) {
    sql += ` AND period_start >= $${i++}`;
    params.push(filters.period_start);
  }
  if (filters?.period_end) {
    sql += ` AND period_end <= $${i++}`;
    params.push(filters.period_end);
  }
  if (filters?.approved != null) {
    sql += ` AND approved_by_user = $${i++}`;
    params.push(filters.approved);
  }

  sql += ' ORDER BY created_at DESC';
  const rows = await queryDatabase(sql, params);
  return rows.map(mapDeduction);
}

/**
 * Criar dedução
 */
export async function createDeduction(data: {
  description: string;
  amount: number;
  category?: string;
  ai_confidence?: number;
  approved_by_user?: boolean;
  period_start?: string;
  period_end?: string;
}): Promise<TaxDeduction> {
  const rows = await queryDatabase(
    `INSERT INTO tax_deductions 
     (description, amount, category, ai_confidence, approved_by_user, period_start, period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.description,
      data.amount,
      data.category || null,
      data.ai_confidence ?? null,
      data.approved_by_user ?? false,
      data.period_start || null,
      data.period_end || null,
    ]
  );
  return mapDeduction(rows[0]);
}

/**
 * Atualizar dedução (aprovar categoria, etc.)
 */
export async function updateDeduction(
  id: number,
  data: Partial<{ category: string; approved_by_user: boolean }>
): Promise<TaxDeduction | null> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (data.category !== undefined) {
    updates.push(`category = $${i++}`);
    params.push(data.category);
  }
  if (data.approved_by_user !== undefined) {
    updates.push(`approved_by_user = $${i++}`);
    params.push(data.approved_by_user);
  }

  if (updates.length === 0) return null;
  params.push(id);
  const rows = await queryDatabase(
    `UPDATE tax_deductions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
    params
  );
  if (rows.length === 0) return null;
  return mapDeduction(rows[0]);
}

/**
 * Calcular total de deduções em período
 */
export async function getDeductionsTotal(
  periodStart: string,
  periodEnd: string
): Promise<number> {
  const rows = await queryDatabase(
    `SELECT COALESCE(SUM(amount), 0) as total FROM tax_deductions WHERE approved_by_user = true
     AND ((period_start IS NULL AND period_end IS NULL) OR (period_start <= $2 AND period_end >= $1))`,
    [periodStart, periodEnd]
  );
  return parseFloat(rows[0]?.total ?? 0);
}

/**
 * Simular tributação
 */
export async function simulateTax(
  grossRevenue: number,
  regime: TaxRegime = 'simples',
  serviceType: keyof typeof SIMPLES_RATES = 'services',
  periodStart?: string,
  periodEnd?: string
): Promise<TaxSimulation> {
  let deductions = 0;
  if (periodStart && periodEnd) {
    deductions = await getDeductionsTotal(periodStart, periodEnd);
  }

  const taxableBase = Math.max(0, grossRevenue - deductions);
  const rate = regime === 'simples' ? SIMPLES_RATES[serviceType] ?? 15 : 15;
  const taxAmount = (taxableBase * rate) / 100;

  return {
    gross_revenue: grossRevenue,
    deductions,
    taxable_base: taxableBase,
    regime,
    rate_pct: rate,
    tax_amount: taxAmount,
    perse_applicable: true,
  };
}

/**
 * Verificar thresholds para IBS/CBS 2027
 */
export async function checkThresholds(): Promise<{
  annual_revenue_ok: boolean;
  properties_ok: boolean;
  message?: string;
}> {
  try {
    const yearStart = `${new Date().getFullYear()}-01-01`;
    const yearEnd = `${new Date().getFullYear()}-12-31`;

    const revenueRows = await queryDatabase(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM marketplace_split_transactions 
       WHERE status = 'completed' AND created_at BETWEEN $1 AND $2`,
      [yearStart, yearEnd]
    );

    const revenue = parseFloat(revenueRows[0]?.total ?? 0);

    const propRows = await queryDatabase(
      `SELECT COUNT(DISTINCT property_id) as count FROM marketplace_receivers WHERE property_id IS NOT NULL`
    );
    const propCount = parseInt(propRows[0]?.count ?? 0);

    const revenueOk = revenue <= THRESHOLD_ANNUAL;
    const propertiesOk = propCount <= THRESHOLD_PROPERTIES;

    let message: string | undefined;
    if (!revenueOk || !propertiesOk) {
      message = `Atenção: ${!revenueOk ? `Receita > R$ ${THRESHOLD_ANNUAL.toLocaleString()}/ano` : ''} ${!propertiesOk ? `ou > ${THRESHOLD_PROPERTIES} imóveis` : ''}. Pode exigir migração IBS/CBS em 2027.`;
    }

    return {
      annual_revenue_ok: revenueOk,
      properties_ok: propertiesOk,
      message,
    };
  } catch {
    return {
      annual_revenue_ok: true,
      properties_ok: true,
      message: 'Tabelas de split não encontradas. Execute a migration 011.',
    };
  }
}

function mapDeduction(row: Record<string, unknown>): TaxDeduction {
  return {
    id: Number(row.id),
    description: String(row.description),
    amount: parseFloat(String(row.amount ?? 0)),
    category: row.category as string,
    ai_confidence: row.ai_confidence != null ? parseFloat(String(row.ai_confidence)) : undefined,
    approved_by_user: Boolean(row.approved_by_user),
    period_start: row.period_start as string,
    period_end: row.period_end as string,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
