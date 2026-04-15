import { revenueRepository } from '../db/revenue.repository';
import type { PricingRule, RuleCondition } from '../db/schema';

type RuleInput = Partial<PricingRule> & { conditions?: RuleCondition };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function isDateRangeValid(range?: { start: string; end: string }) {
  if (!range?.start || !range?.end) return false;
  return new Date(range.start).getTime() <= new Date(range.end).getTime();
}

export class PricingRulesService {
  async listRules(filters?: { is_active?: boolean; roomTypeId?: number; channel?: string; property_id?: number }) {
    return revenueRepository.listRules(filters);
  }

  async getRuleById(id: number) {
    return revenueRepository.getRuleById(Number(id));
  }

  validateRule(data: RuleInput) {
    const errors: string[] = [];
    const ruleType = data.rule_type || 'OCCUPANCY';
    const conditions = data.conditions || {};
    const adjustmentValue = Number(data.adjustment_value || 0);

    if ((data.adjustment_type || 'percentage') === 'percentage' && adjustmentValue < -100) {
      errors.push('Desconto percentual não pode ser menor que -100%');
    }

    if (ruleType === 'OCCUPANCY' && conditions.occupancy_min === undefined && conditions.occupancy_max === undefined) {
      errors.push('OCCUPANCY exige occupancy_min ou occupancy_max');
    }
    if (ruleType === 'DAY_OF_WEEK') {
      if (!Array.isArray(conditions.days) || !conditions.days.length || conditions.days.some((day) => day < 0 || day > 6)) {
        errors.push('DAY_OF_WEEK exige days[] entre 0 e 6');
      }
    }
    if (ruleType === 'SEASONAL') {
      if ((!Array.isArray(conditions.date_ranges) || !conditions.date_ranges.length) && !conditions.season_name) {
        errors.push('SEASONAL exige date_ranges[] ou season_name');
      }
      if (Array.isArray(conditions.date_ranges) && conditions.date_ranges.some((range) => !isDateRangeValid(range))) {
        errors.push('SEASONAL exige intervalos de data válidos');
      }
    }
    if (ruleType === 'ADVANCE' || ruleType === 'LAST_MINUTE') {
      if (conditions.min_advance_days === undefined && conditions.max_advance_days === undefined) {
        errors.push('ADVANCE exige min_advance_days ou max_advance_days');
      }
    }
    if (ruleType === 'LENGTH_OF_STAY') {
      if (conditions.min_nights === undefined) {
        errors.push('LENGTH_OF_STAY exige min_nights');
      }
    }
    if (ruleType === 'EVENT' && !conditions.event_name) {
      errors.push('EVENT exige event_name');
    }

    return { valid: errors.length === 0, errors };
  }

  async createRule(data: RuleInput) {
    const validation = this.validateRule(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }

    const rules = await this.listRules();
    const priority = data.priority ?? (rules.length ? Math.max(...rules.map((rule) => rule.priority)) + 1 : 1);
    return revenueRepository.createRule({
      ...clone(data),
      priority,
      is_active: data.is_active ?? true,
    });
  }

  async updateRule(id: number, updates: RuleInput) {
    const existing = await this.getRuleById(id);
    if (!existing) return null;
    const merged = {
      ...existing,
      ...clone(updates),
      conditions: { ...existing.conditions, ...(updates.conditions || {}) },
    };
    const validation = this.validateRule(merged);
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }
    return revenueRepository.updateRule(id, updates);
  }

  async deleteRule(id: number) {
    await revenueRepository.deleteRule(id);
    const remaining = await this.listRules();
    await revenueRepository.reorderRules(remaining.map((rule) => rule.id));
  }

  async reorderRules(ruleIds: number[]) {
    await revenueRepository.reorderRules(ruleIds);
  }

  async toggleRule(id: number, isActive: boolean) {
    return revenueRepository.toggleRule(id, isActive);
  }

  async getActiveRules(roomTypeId?: number, channel?: string) {
    return revenueRepository.getActiveRules(roomTypeId, channel);
  }

  async seedDefaults(propertyId?: number) {
    const defaults: RuleInput[] = [
      {
        name: 'Alta Temporada',
        description: 'Carnaval, Réveillon e Semana Santa',
        rule_type: 'SEASONAL',
        conditions: {
          season_name: 'alta',
          date_ranges: [
            { start: '2026-02-13', end: '2026-02-18' },
            { start: '2026-12-26', end: '2027-01-05' },
            { start: '2026-03-27', end: '2026-04-05' },
          ],
        },
        adjustment_type: 'percentage',
        adjustment_value: 25,
        priority: 1,
        is_active: true,
      },
      {
        name: 'Final de Semana',
        rule_type: 'DAY_OF_WEEK',
        conditions: { days: [5, 6] },
        adjustment_type: 'percentage',
        adjustment_value: 15,
        priority: 2,
        is_active: true,
      },
      {
        name: 'Ocupação Alta',
        rule_type: 'OCCUPANCY',
        conditions: { occupancy_min: 80 },
        adjustment_type: 'percentage',
        adjustment_value: 10,
        priority: 3,
        is_active: true,
      },
      {
        name: 'Ocupação Baixa',
        rule_type: 'OCCUPANCY',
        conditions: { occupancy_max: 30 },
        adjustment_type: 'percentage',
        adjustment_value: -15,
        priority: 4,
        is_active: true,
      },
      {
        name: 'Reserva Antecipada',
        rule_type: 'ADVANCE',
        conditions: { min_advance_days: 30 },
        adjustment_type: 'percentage',
        adjustment_value: -8,
        priority: 5,
        is_active: true,
      },
      {
        name: 'Last Minute',
        rule_type: 'ADVANCE',
        conditions: { max_advance_days: 3 },
        adjustment_type: 'percentage',
        adjustment_value: 12,
        priority: 6,
        is_active: true,
      },
      {
        name: 'Estadia Longa',
        rule_type: 'LENGTH_OF_STAY',
        conditions: { min_nights: 5 },
        adjustment_type: 'percentage',
        adjustment_value: -10,
        priority: 7,
        is_active: true,
      },
      {
        name: 'Super Estadia',
        rule_type: 'LENGTH_OF_STAY',
        conditions: { min_nights: 10 },
        adjustment_type: 'percentage',
        adjustment_value: -18,
        priority: 8,
        is_active: true,
      },
      {
        name: 'Meio de Semana',
        rule_type: 'DAY_OF_WEEK',
        conditions: { days: [2, 3] },
        adjustment_type: 'percentage',
        adjustment_value: -8,
        priority: 9,
        is_active: true,
      },
    ];

    const existing = await this.listRules();
    for (const rule of defaults) {
      const found = existing.find((item) => item.name === rule.name);
      if (!found) {
        await this.createRule({ ...rule, property_id: propertyId });
      }
    }
    return this.listRules();
  }
}

export const pricingRulesService = new PricingRulesService();
