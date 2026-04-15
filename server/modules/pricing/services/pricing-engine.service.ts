import { eq, and, desc, sql, between, gte, lte, asc } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { pricingRules, pricingSeasons, pricingAdjustments, pricingHistory } from '../db/schema';
import { PricingRule, NewPricingRule, PricingSeason, NewPricingSeason, PriceCalculation } from '../types';

export class PricingEngineService {
  async calculatePrice(
    accommodationId: string,
    date: Date,
    opts?: { occupancyRate?: number; demandScore?: number; competitorAvgPrice?: number }
  ): Promise<PriceCalculation> {
    try {
      // Get active pricing rules for accommodation, ordered by priority
      const rules = await db
        .select()
        .from(pricingRules)
        .where(and(eq(pricingRules.accommodationId, accommodationId), eq(pricingRules.isActive, true)))
        .orderBy(desc(pricingRules.priority));

      if (rules.length === 0) {
        throw new Error(`No active pricing rules found for accommodation ${accommodationId}`);
      }

      const rule = rules[0]; // Use highest priority rule
      let finalPrice = rule.basePrice;
      const adjustments: Array<{ reason: string; type: string; value: number }> = [];

      // Apply seasonal adjustments
      const seasons = await db
        .select()
        .from(pricingSeasons)
        .where(
          and(
            eq(pricingSeasons.isActive, true),
            lte(pricingSeasons.startDate, date),
            gte(pricingSeasons.endDate, date)
          )
        );

      for (const season of seasons) {
        if (!season.appliesToAccommodations ||
            (Array.isArray(season.appliesToAccommodations) && season.appliesToAccommodations.includes(accommodationId))) {
          finalPrice *= season.priceMultiplier;
          finalPrice += (season.fixedAdjustment || 0);
          adjustments.push({
            reason: `season_${season.type}`,
            type: 'multiplier',
            value: season.priceMultiplier
          });
        }
      }

      // Apply occupancy threshold adjustments
      if (opts?.occupancyRate && rule.occupancyThresholds) {
        const thresholds = rule.occupancyThresholds as any;
        if (opts.occupancyRate < (thresholds.low?.below || 30)) {
          finalPrice *= (1 + (thresholds.low?.adjustment || -10) / 100);
          adjustments.push({
            reason: 'occupancy_low',
            type: 'percentage',
            value: thresholds.low?.adjustment || -10
          });
        } else if (opts.occupancyRate > (thresholds.high?.above || 80)) {
          finalPrice *= (1 + (thresholds.high?.adjustment || 20) / 100);
          adjustments.push({
            reason: 'occupancy_high',
            type: 'percentage',
            value: thresholds.high?.adjustment || 20
          });
        }
      }

      // Apply demand multipliers
      if (rule.demandMultipliers) {
        const multipliers = rule.demandMultipliers as any;
        const dayOfWeek = date.getDay();
        let multiplier = 1.0;

        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          multiplier = multipliers.weekend || 1.0;
        } else {
          multiplier = multipliers.weekday || 1.0;
        }

        // Check if it's a holiday (simplified - in production would use holiday API)
        const isHoliday = this.isHoliday(date);
        if (isHoliday) {
          multiplier = multipliers.holiday || multiplier;
        }

        finalPrice *= multiplier;
        adjustments.push({
          reason: 'demand_multiplier',
          type: 'multiplier',
          value: multiplier
        });
      }

      // Apply lead time rules
      if (rule.leadTimeRules) {
        const leadTimeRules = rule.leadTimeRules as any;
        const daysUntilBooking = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilBooking <= (leadTimeRules.lastMinute?.daysBelow || 3)) {
          finalPrice *= (1 + (leadTimeRules.lastMinute?.discount || -20) / 100);
          adjustments.push({
            reason: 'last_minute',
            type: 'percentage',
            value: leadTimeRules.lastMinute?.discount || -20
          });
        } else if (daysUntilBooking >= (leadTimeRules.earlyBird?.daysAbove || 60)) {
          finalPrice *= (1 + (leadTimeRules.earlyBird?.discount || -10) / 100);
          adjustments.push({
            reason: 'early_bird',
            type: 'percentage',
            value: leadTimeRules.earlyBird?.discount || -10
          });
        }
      }

      // Clamp to min/max prices
      finalPrice = Math.max(rule.minPrice, Math.min(rule.maxPrice, finalPrice));

      // Record adjustment
      await db.insert(pricingAdjustments).values({
        ruleId: rule.id,
        accommodationId,
        type: 'percentage',
        reason: 'calculated_price',
        originalPrice: rule.basePrice,
        adjustedPrice: finalPrice,
        adjustmentValue: ((finalPrice - rule.basePrice) / rule.basePrice) * 100,
        appliedAt: new Date(),
        appliedBy: 'system',
        metadata: {
          occupancyRate: opts?.occupancyRate,
          demandScore: opts?.demandScore,
          competitorAvgPrice: opts?.competitorAvgPrice,
          adjustments
        }
      });

      // Record in history
      await db.insert(pricingHistory).values({
        accommodationId,
        date,
        price: finalPrice,
        basePrice: rule.basePrice,
        strategy: rule.strategy,
        occupancyRate: opts?.occupancyRate,
        demandScore: opts?.demandScore,
        competitorAvgPrice: opts?.competitorAvgPrice,
        metadata: { adjustments }
      });

      return {
        basePrice: rule.basePrice,
        finalPrice,
        adjustments,
        strategy: rule.strategy
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  }

  async listRules(opts?: {
    accommodationId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number
  }) {
    try {
      const page = opts?.page || 1;
      const limit = opts?.limit || 50;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      if (opts?.accommodationId) {
        whereConditions.push(eq(pricingRules.accommodationId, opts.accommodationId));
      }
      if (opts?.isActive !== undefined) {
        whereConditions.push(eq(pricingRules.isActive, opts.isActive));
      }

      const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [rules, totalResult] = await Promise.all([
        db
          .select()
          .from(pricingRules)
          .where(where)
          .orderBy(desc(pricingRules.priority), desc(pricingRules.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(pricingRules)
          .where(where)
      ]);

      const total = totalResult[0].count;
      const totalPages = Math.ceil(total / limit);

      return { rules, total, page, limit, totalPages };
    } catch (error) {
      console.error('Error listing rules:', error);
      throw error;
    }
  }

  async getRuleById(id: string): Promise<PricingRule | null> {
    try {
      const result = await db
        .select()
        .from(pricingRules)
        .where(eq(pricingRules.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error getting rule by ID:', error);
      throw error;
    }
  }

  async createRule(data: NewPricingRule): Promise<PricingRule> {
    try {
      const result = await db
        .insert(pricingRules)
        .values(data)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    }
  }

  async updateRule(id: string, data: Partial<PricingRule>): Promise<PricingRule> {
    try {
      const result = await db
        .update(pricingRules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingRules.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error(`Pricing rule with ID ${id} not found`);
      }

      return result[0];
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      await this.updateRule(id, { isActive: false });
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  }

  async listSeasons(opts?: {
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number
  }) {
    try {
      const page = opts?.page || 1;
      const limit = opts?.limit || 50;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      if (opts?.type) {
        whereConditions.push(eq(pricingSeasons.type, opts.type as any));
      }
      if (opts?.isActive !== undefined) {
        whereConditions.push(eq(pricingSeasons.isActive, opts.isActive));
      }

      const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [seasons, totalResult] = await Promise.all([
        db
          .select()
          .from(pricingSeasons)
          .where(where)
          .orderBy(desc(pricingSeasons.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(pricingSeasons)
          .where(where)
      ]);

      const total = totalResult[0].count;
      const totalPages = Math.ceil(total / limit);

      return { seasons, total, page, limit, totalPages };
    } catch (error) {
      console.error('Error listing seasons:', error);
      throw error;
    }
  }

  async createSeason(data: NewPricingSeason): Promise<PricingSeason> {
    try {
      if (data.startDate >= data.endDate) {
        throw new Error('Start date must be before end date');
      }

      const result = await db
        .insert(pricingSeasons)
        .values(data)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating season:', error);
      throw error;
    }
  }

  async updateSeason(id: string, data: Partial<PricingSeason>): Promise<PricingSeason> {
    try {
      const result = await db
        .update(pricingSeasons)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingSeasons.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error(`Pricing season with ID ${id} not found`);
      }

      return result[0];
    } catch (error) {
      console.error('Error updating season:', error);
      throw error;
    }
  }

  async deleteSeason(id: string): Promise<void> {
    try {
      await this.updateSeason(id, { isActive: false });
    } catch (error) {
      console.error('Error deleting season:', error);
      throw error;
    }
  }

  async getPriceHistory(
    accommodationId: string,
    opts?: { startDate?: string; endDate?: string; limit?: number }
  ) {
    try {
      const limit = opts?.limit || 100;
      let whereConditions = [eq(pricingHistory.accommodationId, accommodationId)];

      if (opts?.startDate) {
        whereConditions.push(gte(pricingHistory.date, new Date(opts.startDate)));
      }
      if (opts?.endDate) {
        whereConditions.push(lte(pricingHistory.date, new Date(opts.endDate)));
      }

      const where = and(...whereConditions);

      const [history, totalResult] = await Promise.all([
        db
          .select()
          .from(pricingHistory)
          .where(where)
          .orderBy(asc(pricingHistory.date))
          .limit(limit),
        db
          .select({ count: sql<number>`count(*)` })
          .from(pricingHistory)
          .where(where)
      ]);

      return { history, total: totalResult[0].count };
    } catch (error) {
      console.error('Error getting price history:', error);
      throw error;
    }
  }

  async bulkCalculatePrices(
    accommodationId: string,
    startDate: Date,
    endDate: Date,
    opts?: { occupancyRate?: number; demandScore?: number; competitorAvgPrice?: number }
  ): Promise<Array<{ date: string; price: PriceCalculation }>> {
    try {
      const results = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const price = await this.calculatePrice(accommodationId, new Date(currentDate), opts);
        results.push({
          date: currentDate.toISOString().split('T')[0],
          price
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return results;
    } catch (error) {
      console.error('Error bulk calculating prices:', error);
      throw error;
    }
  }

  private isHoliday(date: Date): boolean {
    // Simplified holiday check - in production would use a proper holiday API
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Brazilian holidays (simplified)
    const holidays = [
      [1, 1],   // New Year
      [4, 21],  // Tiradentes
      [5, 1],   // Labor Day
      [9, 7],   // Independence
      [10, 12], // Nossa Senhora
      [11, 2],  // All Souls
      [11, 15], // Republic
      [12, 25], // Christmas
    ];

    return holidays.some(([hMonth, hDay]) => month === hMonth && day === hDay);
  }
}

export const pricingEngineService = new PricingEngineService();