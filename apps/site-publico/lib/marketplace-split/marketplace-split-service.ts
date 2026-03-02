/**
 * Serviço de Split de Pagamento Marketplace
 * Lógica comercial para divisão entre plataforma e parceiros (proprietários, imobiliárias, parques)
 */

import { queryDatabase } from '../db';
import type {
  MarketplaceReceiver,
  SplitConfigRule,
  SplitRequest,
  SplitResult,
  SplitAllocation,
  ServiceType,
} from './types';

const DEFAULT_RULES: Record<ServiceType, { platform: number; partner: number }> = {
  rent: { platform: 20, partner: 80 },
  ticket: { platform: 15, partner: 85 },
  package: { platform: 18, partner: 82 },
};

/**
 * Listar recebedores
 */
export async function listReceivers(
  filters?: { type?: string; property_id?: number; status?: string }
): Promise<MarketplaceReceiver[]> {
  let sql = 'SELECT * FROM marketplace_receivers WHERE 1=1';
  const params: unknown[] = [];
  let i = 1;

  if (filters?.type) {
    sql += ` AND type = $${i++}`;
    params.push(filters.type);
  }
  if (filters?.property_id != null) {
    sql += ` AND property_id = $${i++}`;
    params.push(filters.property_id);
  }
  if (filters?.status) {
    sql += ` AND status = $${i++}`;
    params.push(filters.status);
  }

  sql += ' ORDER BY created_at DESC';
  const rows = await queryDatabase(sql, params);
  return rows.map(mapReceiver);
}

/**
 * Obter recebedor por ID
 */
export async function getReceiver(id: number): Promise<MarketplaceReceiver | null> {
  const rows = await queryDatabase(
    'SELECT * FROM marketplace_receivers WHERE id = $1',
    [id]
  );
  if (rows.length === 0) return null;
  return mapReceiver(rows[0]);
}

/**
 * Criar recebedor
 */
export async function createReceiver(data: {
  type: string;
  name?: string;
  document?: string;
  bank_account?: Record<string, unknown>;
  default_split_pct?: number;
  property_id?: number;
  external_id?: string;
}): Promise<MarketplaceReceiver> {
  const rows = await queryDatabase(
    `INSERT INTO marketplace_receivers 
     (type, name, document, bank_account, default_split_pct, property_id, external_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.type,
      data.name || null,
      data.document || null,
      data.bank_account ? JSON.stringify(data.bank_account) : null,
      data.default_split_pct ?? 80,
      data.property_id || null,
      data.external_id || null,
    ]
  );
  return mapReceiver(rows[0]);
}

/**
 * Atualizar recebedor
 */
export async function updateReceiver(
  id: number,
  data: Partial<{
    name: string;
    document: string;
    bank_account: Record<string, unknown>;
    default_split_pct: number;
    status: string;
  }>
): Promise<MarketplaceReceiver | null> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${i++}`);
    params.push(data.name);
  }
  if (data.document !== undefined) {
    updates.push(`document = $${i++}`);
    params.push(data.document);
  }
  if (data.bank_account !== undefined) {
    updates.push(`bank_account = $${i++}`);
    params.push(JSON.stringify(data.bank_account));
  }
  if (data.default_split_pct !== undefined) {
    updates.push(`default_split_pct = $${i++}`);
    params.push(data.default_split_pct);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${i++}`);
    params.push(data.status);
  }

  if (updates.length === 0) return getReceiver(id);

  params.push(id);
  const rows = await queryDatabase(
    `UPDATE marketplace_receivers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
    params
  );
  if (rows.length === 0) return null;
  return mapReceiver(rows[0]);
}

/**
 * Obter regras de split
 */
export async function getSplitRules(): Promise<SplitConfigRule[]> {
  const rows = await queryDatabase(
    'SELECT * FROM split_config_rules ORDER BY service_type'
  );
  return rows.map(mapRule);
}

/**
 * Obter regra por tipo de serviço
 */
export async function getRuleByServiceType(
  serviceType: ServiceType
): Promise<SplitConfigRule | null> {
  const rows = await queryDatabase(
    'SELECT * FROM split_config_rules WHERE service_type = $1',
    [serviceType]
  );
  if (rows.length === 0) return null;
  return mapRule(rows[0]);
}

/**
 * Atualizar regra de split (override manual)
 */
export async function updateSplitRule(
  id: number,
  data: { platform_pct: number; partner_pct: number }
): Promise<SplitConfigRule | null> {
  const rows = await queryDatabase(
    `UPDATE split_config_rules 
     SET platform_pct = $1, partner_pct = $2, updated_at = NOW() 
     WHERE id = $3 RETURNING *`,
    [data.platform_pct, data.partner_pct, id]
  );
  if (rows.length === 0) return null;
  return mapRule(rows[0]);
}

/**
 * Calcular split para uma transação
 */
export async function calculateSplit(request: SplitRequest): Promise<SplitResult> {
  let platformPct = request.platform_pct;
  let partnerPct: number;

  if (platformPct != null) {
    partnerPct = 100 - platformPct;
  } else {
    const rule = await getRuleByServiceType(request.service_type);
    if (rule) {
      platformPct = rule.platform_pct;
      partnerPct = rule.partner_pct;
    } else {
      const def = DEFAULT_RULES[request.service_type];
      platformPct = def.platform;
      partnerPct = def.partner;
    }
  }

  const platformAmount = Math.round((request.total_amount * platformPct) / 100 * 100) / 100;
  const partnerAmount = request.total_amount - platformAmount;

  const allocations: SplitAllocation[] = [];
  if (request.receiver_id && partnerAmount > 0) {
    allocations.push({
      receiver_id: request.receiver_id,
      amount: partnerAmount,
      percentage: partnerPct,
    });
  } else if (request.allocations && request.allocations.length > 0) {
    for (const a of request.allocations) {
      allocations.push({
        receiver_id: a.receiver_id,
        amount: a.amount,
        percentage: a.percentage,
      });
    }
  }

  return {
    platform_amount: platformAmount,
    platform_pct: platformPct,
    allocations,
    total_partner_amount: allocations.reduce((s, a) => s + a.amount, 0),
  };
}

/**
 * Registrar transação de split
 */
export async function recordSplitTransaction(data: {
  booking_id?: number;
  payment_id?: string;
  total_amount: number;
  platform_amount: number;
  receiver_id?: number;
  receiver_amount?: number;
  service_type?: string;
  gateway_response?: Record<string, unknown>;
  status?: string;
}): Promise<number> {
  const rows = await queryDatabase(
    `INSERT INTO marketplace_split_transactions 
     (booking_id, payment_id, total_amount, platform_amount, receiver_id, receiver_amount, service_type, gateway_response, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      data.booking_id || null,
      data.payment_id || null,
      data.total_amount,
      data.platform_amount,
      data.receiver_id || null,
      data.receiver_amount || null,
      data.service_type || null,
      data.gateway_response ? JSON.stringify(data.gateway_response) : null,
      data.status || 'pending',
    ]
  );
  return rows[0]?.id ?? 0;
}

function mapReceiver(row: Record<string, unknown>): MarketplaceReceiver {
  return {
    id: Number(row.id),
    type: row.type as MarketplaceReceiver['type'],
    name: row.name as string,
    document: row.document as string,
    bank_account: row.bank_account as MarketplaceReceiver['bank_account'],
    default_split_pct: parseFloat(String(row.default_split_pct ?? 80)),
    property_id: row.property_id != null ? Number(row.property_id) : undefined,
    external_id: row.external_id as string,
    status: String(row.status ?? 'active'),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapRule(row: Record<string, unknown>): SplitConfigRule {
  return {
    id: Number(row.id),
    service_type: row.service_type as SplitConfigRule['service_type'],
    platform_pct: parseFloat(String(row.platform_pct)),
    partner_pct: parseFloat(String(row.partner_pct)),
    ai_suggested: Boolean(row.ai_suggested),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
