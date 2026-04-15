import { eq, and, desc, sql, between, gte, lte, asc } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { pricingCompetitors, pricingOtaRates, pricingAlerts, pricingHistory } from '../db/schema';
import { Competitor, NewCompetitor, OtaRate, PricingAlert, CompetitorComparison, RateParityReport } from '../types';

export class CompetitorService {
  async listCompetitors(opts?: {
    accommodationId?: string;
    platform?: string;
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
        whereConditions.push(eq(pricingCompetitors.accommodationId, opts.accommodationId));
      }
      if (opts?.platform) {
        whereConditions.push(eq(pricingCompetitors.platform, opts.platform as any));
      }
      if (opts?.isActive !== undefined) {
        whereConditions.push(eq(pricingCompetitors.isActive, opts.isActive));
      }

      const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [competitors, totalResult] = await Promise.all([
        db
          .select()
          .from(pricingCompetitors)
          .where(where)
          .orderBy(desc(pricingCompetitors.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(pricingCompetitors)
          .where(where)
      ]);

      const total = totalResult[0].count;
      const totalPages = Math.ceil(total / limit);

      return { competitors, total, page, limit, totalPages };
    } catch (error) {
      console.error('Error listing competitors:', error);
      throw error;
    }
  }

  async getCompetitorById(id: string): Promise<Competitor | null> {
    try {
      const result = await db
        .select()
        .from(pricingCompetitors)
        .where(eq(pricingCompetitors.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error getting competitor by ID:', error);
      throw error;
    }
  }

  async createCompetitor(data: NewCompetitor): Promise<Competitor> {
    try {
      const result = await db
        .insert(pricingCompetitors)
        .values(data)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating competitor:', error);
      throw error;
    }
  }

  async updateCompetitor(id: string, data: Partial<Competitor>): Promise<Competitor> {
    try {
      const result = await db
        .update(pricingCompetitors)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingCompetitors.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error(`Competitor with ID ${id} not found`);
      }

      return result[0];
    } catch (error) {
      console.error('Error updating competitor:', error);
      throw error;
    }
  }

  async deleteCompetitor(id: string): Promise<void> {
    try {
      await this.updateCompetitor(id, { isActive: false });
    } catch (error) {
      console.error('Error deleting competitor:', error);
      throw error;
    }
  }

  async getCompetitorRates(
    competitorId: string,
    opts?: { startDate?: string; endDate?: string; page?: number; limit?: number }
  ) {
    try {
      const page = opts?.page || 1;
      const limit = opts?.limit || 50;
      const offset = (page - 1) * limit;

      let whereConditions = [eq(pricingOtaRates.competitorId, competitorId)];

      if (opts?.startDate) {
        whereConditions.push(gte(pricingOtaRates.checkInDate, new Date(opts.startDate)));
      }
      if (opts?.endDate) {
        whereConditions.push(lte(pricingOtaRates.checkOutDate, new Date(opts.endDate)));
      }

      const where = and(...whereConditions);

      const [rates, totalResult] = await Promise.all([
        db
          .select()
          .from(pricingOtaRates)
          .where(where)
          .orderBy(desc(pricingOtaRates.scrapedAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(pricingOtaRates)
          .where(where)
      ]);

      const total = totalResult[0].count;
      const totalPages = Math.ceil(total / limit);

      return { rates, total, page, limit, totalPages };
    } catch (error) {
      console.error('Error getting competitor rates:', error);
      throw error;
    }
  }

  async getCompetitorComparison(
    accommodationId: string,
    checkInDate: string,
    checkOutDate: string
  ): Promise<CompetitorComparison> {
    try {
      // Get our current price from history (most recent for the date range)
      const ourPriceResult = await db
        .select({ price: sql<number>`avg(price)` })
        .from(pricingHistory)
        .where(and(
          eq(pricingHistory.accommodationId, accommodationId),
          gte(pricingHistory.date, new Date(checkInDate)),
          lte(pricingHistory.date, new Date(checkOutDate))
        ));

      const ourPrice = ourPriceResult[0]?.price || 0;

      // Get competitors for this accommodation
      const competitors = await db
        .select()
        .from(pricingCompetitors)
        .where(and(
          eq(pricingCompetitors.accommodationId, accommodationId),
          eq(pricingCompetitors.isActive, true)
        ));

      const competitorPrices = [];

      for (const competitor of competitors) {
        // Get most recent rate for this competitor in the date range
        const rateResult = await db
          .select()
          .from(pricingOtaRates)
          .where(and(
            eq(pricingOtaRates.competitorId, competitor.id),
            gte(pricingOtaRates.checkInDate, new Date(checkInDate)),
            lte(pricingOtaRates.checkOutDate, new Date(checkOutDate))
          ))
          .orderBy(desc(pricingOtaRates.scrapedAt))
          .limit(1);

        if (rateResult[0]) {
          const competitorPrice = rateResult[0].price;
          competitorPrices.push({
            name: competitor.competitorName,
            platform: competitor.platform,
            price: competitorPrice,
            difference: competitorPrice - ourPrice,
            percentDiff: ourPrice > 0 ? ((competitorPrice - ourPrice) / ourPrice) * 100 : 0
          });
        }
      }

      const prices = competitorPrices.map(c => c.price);
      const cheapest = competitorPrices.find(c => c.price === Math.min(...prices));
      const mostExpensive = competitorPrices.find(c => c.price === Math.max(...prices));
      const average = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      return {
        ourPrice,
        competitors: competitorPrices,
        cheapest: cheapest || { name: '', platform: 'none', price: 0 },
        mostExpensive: mostExpensive || { name: '', platform: 'none', price: 0 },
        average
      };
    } catch (error) {
      console.error('Error getting competitor comparison:', error);
      throw error;
    }
  }

  async getRateParityReport(
    accommodationId: string,
    opts?: { platform?: string }
  ): Promise<RateParityReport> {
    try {
      // Get our prices for next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const ourPrices = await db
        .select()
        .from(pricingHistory)
        .where(and(
          eq(pricingHistory.accommodationId, accommodationId),
          gte(pricingHistory.date, startDate),
          lte(pricingHistory.date, endDate)
        ))
        .orderBy(asc(pricingHistory.date));

      const violations = [];

      for (const ourPriceRecord of ourPrices) {
        // Get competitors for this accommodation
        const competitors = await db
          .select()
          .from(pricingCompetitors)
          .where(and(
            eq(pricingCompetitors.accommodationId, accommodationId),
            eq(pricingCompetitors.isActive, true),
            opts?.platform ? eq(pricingCompetitors.platform, opts.platform as any) : undefined
          ));

        for (const competitor of competitors) {
          // Get competitor rate for this date
          const competitorRate = await db
            .select()
            .from(pricingOtaRates)
            .where(and(
              eq(pricingOtaRates.competitorId, competitor.id),
              gte(pricingOtaRates.checkInDate, ourPriceRecord.date),
              lte(pricingOtaRates.checkOutDate, ourPriceRecord.date)
            ))
            .orderBy(desc(pricingOtaRates.scrapedAt))
            .limit(1);

          if (competitorRate[0]) {
            const otaPrice = competitorRate[0].price;
            const ourPrice = ourPriceRecord.price;
            const diff = ((otaPrice - ourPrice) / ourPrice) * 100;

            // Check for parity violation (default 5% threshold)
            if (Math.abs(diff) > 5) {
              violations.push({
                date: ourPriceRecord.date.toISOString().split('T')[0],
                platform: competitor.platform,
                ourPrice,
                otaPrice,
                diff
              });
            }
          }
        }
      }

      const totalViolations = violations.length;
      const totalPossibleComparisons = ourPrices.length * (await this.listCompetitors({ accommodationId })).total;
      const complianceRate = totalPossibleComparisons > 0 ? ((totalPossibleComparisons - totalViolations) / totalPossibleComparisons) * 100 : 100;

      return {
        violations,
        totalViolations,
        complianceRate
      };
    } catch (error) {
      console.error('Error getting rate parity report:', error);
      throw error;
    }
  }
}

export const competitorService = new CompetitorService();