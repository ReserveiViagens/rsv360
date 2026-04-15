import { revenueRepository } from '../db/revenue.repository';
import type { AppliedRule, PricingRule } from '../db/schema';
import { pricingRulesService } from './pricing-rules.service';

type DynamicOptions = {
  channel?: string;
  nights?: number;
  basePrice?: number;
  hypotheticalRules?: PricingRule[];
  minPrice?: number;
  maxPrice?: number;
  occupancyRate?: number;
  events?: string[];
};

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function dateOnly(value: string | Date) {
  return new Date(value).toISOString().split('T')[0];
}

function daysBetween(start: string | Date, end: string | Date) {
  return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

function dateInRange(date: string, range: { start: string; end: string }) {
  return date >= dateOnly(range.start) && date <= dateOnly(range.end);
}

export class PricingEngineService {
  async calculateDynamicPrice(roomTypeId: number, date: string, options: DynamicOptions = {}) {
    const targetDate = dateOnly(date);
    const occupancyRate = options.occupancyRate ?? await revenueRepository.getOccupancyRate(targetDate, roomTypeId);
    const dayOfWeek = new Date(targetDate).getDay();
    const advanceDays = daysBetween(new Date(), targetDate);
    const basePrice = options.basePrice ?? await revenueRepository.getBasePriceForRoomType(roomTypeId);
    const rules = (options.hypotheticalRules || await pricingRulesService.getActiveRules(roomTypeId, options.channel))
      .filter((rule) => rule.is_active !== false)
      .sort((left, right) => left.priority - right.priority);

    let calculatedPrice = basePrice;
    const appliedRules: AppliedRule[] = [];

    for (const rule of rules) {
      if (rule.channel && rule.channel !== options.channel) {
        continue;
      }
      if (rule.valid_from && targetDate < dateOnly(rule.valid_from)) continue;
      if (rule.valid_until && targetDate > dateOnly(rule.valid_until)) continue;

      const conditions = rule.conditions || {};
      let matches = false;

      switch (rule.rule_type) {
        case 'OCCUPANCY':
          matches = (conditions.occupancy_min === undefined || occupancyRate >= conditions.occupancy_min)
            && (conditions.occupancy_max === undefined || occupancyRate <= conditions.occupancy_max);
          break;
        case 'DAY_OF_WEEK':
          matches = Array.isArray(conditions.days) && conditions.days.includes(dayOfWeek);
          break;
        case 'SEASONAL':
          matches = Array.isArray(conditions.date_ranges)
            ? conditions.date_ranges.some((range) => dateInRange(targetDate, range))
            : false;
          break;
        case 'ADVANCE':
        case 'LAST_MINUTE':
          matches = (conditions.min_advance_days === undefined || advanceDays >= conditions.min_advance_days)
            && (conditions.max_advance_days === undefined || advanceDays <= conditions.max_advance_days);
          break;
        case 'LENGTH_OF_STAY':
          matches = (conditions.min_nights === undefined || (options.nights ?? 0) >= conditions.min_nights)
            && (conditions.max_nights === undefined || (options.nights ?? 0) <= conditions.max_nights);
          break;
        case 'EVENT':
          matches = Boolean(conditions.event_name && options.events?.includes(conditions.event_name));
          break;
      }

      if (!matches) {
        continue;
      }

      const before = calculatedPrice;
      if (rule.adjustment_type === 'percentage') {
        calculatedPrice *= (1 + Number(rule.adjustment_value || 0) / 100);
      } else {
        calculatedPrice += Number(rule.adjustment_value || 0);
      }
      calculatedPrice = roundPrice(calculatedPrice);
      appliedRules.push({
        rule_id: rule.id,
        rule_name: rule.name,
        rule_type: rule.rule_type,
        adjustment: rule.adjustment_value,
        price_before: before,
        price_after: calculatedPrice,
      });
    }

    const minPrice = options.minPrice ?? Number(process.env.MIN_ROOM_PRICE || 50);
    const maxPrice = options.maxPrice ?? Number(process.env.MAX_ROOM_PRICE || 9999);
    calculatedPrice = Math.max(minPrice, Math.min(calculatedPrice, maxPrice));
    calculatedPrice = roundPrice(calculatedPrice);

    return {
      roomTypeId,
      date: targetDate,
      basePrice: roundPrice(basePrice),
      calculatedPrice,
      appliedRules,
      occupancyRate,
      dayOfWeek,
    };
  }

  async calculateStayPrice(roomTypeId: number, checkIn: string, checkOut: string, options: DynamicOptions = {}) {
    const nights = Math.max(daysBetween(checkIn, checkOut), 0);
    const nightlyPrices: Array<{ date: string; price: number; appliedRules: AppliedRule[] }> = [];
    const appliedRules = new Map<number, AppliedRule>();
    let totalPrice = 0;
    let basePriceTotal = 0;
    const currentDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    while (currentDate < endDate) {
      const result = await this.calculateDynamicPrice(roomTypeId, currentDate.toISOString(), {
        ...options,
        nights,
      });
      nightlyPrices.push({
        date: result.date,
        price: result.calculatedPrice,
        appliedRules: result.appliedRules,
      });
      totalPrice += result.calculatedPrice;
      basePriceTotal += result.basePrice;
      for (const rule of result.appliedRules) {
        appliedRules.set(rule.rule_id, rule);
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return {
      roomTypeId,
      checkIn: dateOnly(checkIn),
      checkOut: dateOnly(checkOut),
      nights,
      nightlyPrices,
      totalPrice: roundPrice(totalPrice),
      averageNightlyRate: nights ? roundPrice(totalPrice / nights) : 0,
      appliedRules: Array.from(appliedRules.values()),
      savings: roundPrice(basePriceTotal - totalPrice),
    };
  }

  async getOptimalPrice(roomTypeId: number, date: string) {
    const currentPrice = (await this.calculateDynamicPrice(roomTypeId, date)).calculatedPrice;
    const competitorRates = await revenueRepository.getCompetitorRatesForDate(date);
    const competitorAvg = competitorRates.length
      ? competitorRates.reduce((sum, rate) => sum + Number(rate.price || 0), 0) / competitorRates.length
      : currentPrice;

    let suggestedPrice = currentPrice;
    let reasoning = 'Preço alinhado com o mercado.';

    if (competitorAvg > 0 && currentPrice > competitorAvg * 1.2) {
      suggestedPrice = roundPrice(competitorAvg * 1.05);
      reasoning = `Preço ${Math.round(((currentPrice - competitorAvg) / competitorAvg) * 100)}% acima da média. Considere reduzir para aumentar ocupação.`;
    } else if (competitorAvg > 0 && currentPrice < competitorAvg * 0.8) {
      suggestedPrice = roundPrice(competitorAvg * 0.95);
      reasoning = `Preço ${Math.round(((competitorAvg - currentPrice) / competitorAvg) * 100)}% abaixo da média. Há espaço para aumentar.`;
    }

    return {
      currentPrice,
      competitorAvg: roundPrice(competitorAvg),
      suggestedPrice,
      reasoning,
    };
  }

  async simulatePrice(roomTypeId: number, date: string, hypotheticalRules: PricingRule[]) {
    return this.calculateDynamicPrice(roomTypeId, date, { hypotheticalRules });
  }
}

export const pricingEngineService = new PricingEngineService();
