/**
 * ✅ ITEM 37: SERVIÇO DE REGRAS DE PRECIFICAÇÃO
 * Gestão completa de regras de precificação dinâmica
 */

import { queryDatabase } from './db';

export interface PricingRule {
  id: number;
  item_id: number;
  rule_name: string;
  rule_type: 'seasonal' | 'day_of_week' | 'stay_duration' | 'advance_booking' | 'last_minute' | 'custom';
  is_active: boolean;
  priority: number;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface RuleApplication {
  id: number;
  rule_id: number;
  booking_id?: number;
  item_id: number;
  base_price: number;
  price_after_rule: number;
  multiplier_applied?: number;
  discount_applied?: number;
  applied_at: string;
}

/**
 * Criar regra de precificação
 */
export async function createPricingRule(
  itemId: number,
  ruleName: string,
  ruleType: PricingRule['rule_type'],
  config: any,
  priority: number = 0,
  isActive: boolean = true
): Promise<PricingRule> {
  const result = await queryDatabase(
    `INSERT INTO pricing_rules 
     (item_id, rule_name, rule_type, config, priority, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [itemId, ruleName, ruleType, JSON.stringify(config), priority, isActive]
  );

  return result[0] as PricingRule;
}

/**
 * Listar regras de um item
 */
export async function getPricingRules(
  itemId: number,
  activeOnly: boolean = false
): Promise<PricingRule[]> {
  let query = `SELECT * FROM pricing_rules WHERE item_id = $1`;
  const params: any[] = [itemId];

  if (activeOnly) {
    query += ` AND is_active = true`;
  }

  query += ` ORDER BY priority DESC, created_at DESC`;

  return await queryDatabase(query, params) as PricingRule[];
}

/**
 * Obter regra específica
 */
export async function getPricingRule(ruleId: number): Promise<PricingRule | null> {
  const rules = await queryDatabase(
    `SELECT * FROM pricing_rules WHERE id = $1`,
    [ruleId]
  );

  return rules.length > 0 ? (rules[0] as PricingRule) : null;
}

/**
 * Atualizar regra
 */
export async function updatePricingRule(
  ruleId: number,
  updates: Partial<PricingRule>
): Promise<PricingRule | null> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.keys(updates).forEach((key) => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      if (key === 'config') {
        updatesList.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        updatesList.push(`${key} = $${paramIndex}`);
        values.push(updates[key as keyof PricingRule]);
      }
      paramIndex++;
    }
  });

  if (updatesList.length === 0) {
    return await getPricingRule(ruleId);
  }

  values.push(ruleId);

  const result = await queryDatabase(
    `UPDATE pricing_rules 
     SET ${updatesList.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.length > 0 ? (result[0] as PricingRule) : null;
}

/**
 * Deletar regra
 */
export async function deletePricingRule(ruleId: number): Promise<boolean> {
  await queryDatabase(
    `DELETE FROM pricing_rules WHERE id = $1`,
    [ruleId]
  );
  return true;
}

/**
 * Aplicar regras a um preço
 */
export async function applyPricingRules(
  itemId: number,
  basePrice: number,
  checkIn: string,
  checkOut: string,
  nights: number
): Promise<{ finalPrice: number; appliedRules: any[] }> {
  const rules = await getPricingRules(itemId, true);
  let finalPrice = basePrice;
  const appliedRules: any[] = [];

  // Ordenar por prioridade
  rules.sort((a, b) => b.priority - a.priority);

  for (const rule of rules) {
    let applied = false;
    let priceChange = 0;
    let multiplier = 1.0;
    let discount = 0;

    switch (rule.rule_type) {
      case 'seasonal':
        const checkInDate = new Date(checkIn);
        const startDate = new Date(rule.config.start_date);
        const endDate = new Date(rule.config.end_date);
        
        if (checkInDate >= startDate && checkInDate <= endDate) {
          multiplier = rule.config.multiplier || 1.0;
          finalPrice *= multiplier;
          applied = true;
        }
        break;

      case 'day_of_week':
        const days = rule.config.days || [];
        const checkInDay = new Date(checkIn).getDay();
        
        if (days.includes(checkInDay)) {
          multiplier = rule.config.multiplier || 1.0;
          finalPrice *= multiplier;
          applied = true;
        }
        break;

      case 'stay_duration':
        if (nights >= (rule.config.min_nights || 0)) {
          discount = rule.config.discount || 0;
          finalPrice *= (1 - discount / 100);
          applied = true;
        }
        break;

      case 'advance_booking':
        const daysUntil = Math.ceil(
          (new Date(checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntil >= (rule.config.days_before || 0)) {
          discount = rule.config.discount || 0;
          finalPrice *= (1 - discount / 100);
          applied = true;
        }
        break;

      case 'last_minute':
        const daysUntilCheckIn = Math.ceil(
          (new Date(checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilCheckIn <= (rule.config.days_before || 0)) {
          discount = rule.config.discount || 0;
          finalPrice *= (1 - discount / 100);
          applied = true;
        }
        break;

      case 'custom':
        // Regras customizadas podem ter lógica específica
        if (rule.config.apply && typeof rule.config.apply === 'function') {
          // Nota: Em produção, isso precisaria ser uma função segura
          // Por enquanto, apenas aplicar multiplicador/desconto se configurado
          if (rule.config.multiplier) {
            multiplier = rule.config.multiplier;
            finalPrice *= multiplier;
            applied = true;
          }
          if (rule.config.discount) {
            discount = rule.config.discount;
            finalPrice *= (1 - discount / 100);
            applied = true;
          }
        }
        break;
    }

    if (applied) {
      appliedRules.push({
        rule_id: rule.id,
        rule_name: rule.rule_name,
        rule_type: rule.rule_type,
        multiplier: multiplier !== 1.0 ? multiplier : undefined,
        discount: discount > 0 ? discount : undefined,
        price_before: basePrice,
        price_after: finalPrice,
      });
    }
  }

  return {
    finalPrice: Math.round(finalPrice * 100) / 100,
    appliedRules,
  };
}

/**
 * Registrar aplicação de regra
 */
export async function recordRuleApplication(
  ruleId: number,
  itemId: number,
  basePrice: number,
  priceAfterRule: number,
  bookingId?: number,
  multiplierApplied?: number,
  discountApplied?: number
): Promise<RuleApplication> {
  const result = await queryDatabase(
    `INSERT INTO pricing_rule_applications 
     (rule_id, item_id, booking_id, base_price, price_after_rule, multiplier_applied, discount_applied)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      ruleId,
      itemId,
      bookingId || null,
      basePrice,
      priceAfterRule,
      multiplierApplied || null,
      discountApplied || null,
    ]
  );

  return result[0] as RuleApplication;
}

/**
 * Obter histórico de aplicações de regras
 */
export async function getRuleApplications(
  itemId?: number,
  ruleId?: number,
  limit: number = 100
): Promise<RuleApplication[]> {
  let query = `SELECT * FROM pricing_rule_applications WHERE 1=1`;
  const params: any[] = [];

  if (itemId) {
    params.push(itemId);
    query += ` AND item_id = $${params.length}`;
  }

  if (ruleId) {
    params.push(ruleId);
    query += ` AND rule_id = $${params.length}`;
  }

  query += ` ORDER BY applied_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  return await queryDatabase(query, params) as RuleApplication[];
}

