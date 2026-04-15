import { revenueRepository } from '../db/revenue.repository';
import { pricingEngineService } from './pricing-engine.service';

function dateOnly(value: string | Date) {
  return new Date(value).toISOString().split('T')[0];
}

function daysInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(dateOnly(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

export class CompetitorService {
  async listCompetitorRates(filters?: { competitor_name?: string; date?: string; source?: string; property_id?: number }) {
    return revenueRepository.listCompetitorRates(filters);
  }

  async getCompetitorRateById(id: number) {
    const rates = await revenueRepository.listCompetitorRates();
    return rates.find((rate) => Number(rate.id) === Number(id)) || null;
  }

  async createCompetitorRate(data: { competitor_name: string; date: string; price: number; currency?: string; source?: 'manual' | 'scraping' | 'api'; room_type_equivalent?: string; notes?: string; url?: string; property_id?: number }) {
    return revenueRepository.createCompetitorRate(data);
  }

  async updateCompetitorRate(id: number, updates: any) {
    return revenueRepository.updateCompetitorRate(id, updates);
  }

  async deleteCompetitorRate(id: number) {
    await revenueRepository.deleteCompetitorRate(id);
  }

  async getCompetitorRatesForDate(date: string) {
    return revenueRepository.getCompetitorRatesForDate(date);
  }

  async bulkImport(entries: Array<{ competitor_name: string; date: string; price: number; currency?: string; source?: 'manual' | 'scraping' | 'api'; room_type_equivalent?: string; notes?: string; url?: string; property_id?: number }>) {
    let imported = 0;
    for (const entry of entries) {
      await this.createCompetitorRate(entry);
      imported += 1;
    }
    return { imported };
  }

  async getComparisonReport(startDate: string, endDate: string, roomTypeId = 1) {
    const dates = daysInRange(startDate, endDate);
    const myPrices: number[] = [];
    const competitorAvgs: number[] = [];
    const overpriced: Array<{ date: string; mine: number; competitors: number }> = [];
    const underpriced: Array<{ date: string; mine: number; competitors: number }> = [];

    for (const date of dates) {
      const myPrice = (await pricingEngineService.calculateDynamicPrice(roomTypeId, date)).calculatedPrice;
      const competitorRates = await revenueRepository.getCompetitorRatesForDate(date);
      const competitorAvg = competitorRates.length
        ? competitorRates.reduce((sum, rate) => sum + Number(rate.price || 0), 0) / competitorRates.length
        : myPrice;

      myPrices.push(myPrice);
      competitorAvgs.push(competitorAvg);

      if (competitorAvg > 0 && myPrice > competitorAvg * 1.2) {
        overpriced.push({ date, mine: myPrice, competitors: competitorAvg });
      } else if (competitorAvg > 0 && myPrice < competitorAvg * 0.8) {
        underpriced.push({ date, mine: myPrice, competitors: competitorAvg });
      }
    }

    const parityIndex = competitorAvgs.length
      ? myPrices.reduce((sum, price, index) => sum + (competitorAvgs[index] ? price / competitorAvgs[index] : 1), 0) / competitorAvgs.length
      : 1;

    const recommendation = overpriced.length
      ? 'Considere reduzir preços em datas acima de 20% da concorrência.'
      : underpriced.length
        ? 'Há espaço para aumentar preços em datas abaixo de 20% da concorrência.'
        : 'Preços dentro da faixa competitiva.';

    return {
      dates,
      myPrices,
      competitorAvgs,
      parityIndex,
      overpriced,
      underpriced,
      recommendation,
    };
  }

  async getCompetitorSummary() {
    const rates = await revenueRepository.listCompetitorRates();
    const grouped = new Map<string, { name: string; prices: number[]; lastCapturedAt: string; datesCovered: Set<string> }>();

    for (const rate of rates) {
      const entry = grouped.get(rate.competitor_name) || {
        name: rate.competitor_name,
        prices: [],
        lastCapturedAt: rate.captured_at,
        datesCovered: new Set<string>(),
      };
      entry.prices.push(rate.price);
      entry.lastCapturedAt = entry.lastCapturedAt > rate.captured_at ? entry.lastCapturedAt : rate.captured_at;
      entry.datesCovered.add(rate.date);
      grouped.set(rate.competitor_name, entry);
    }

    return Array.from(grouped.values()).map((entry) => ({
      name: entry.name,
      averagePrice: entry.prices.length ? entry.prices.reduce((sum, price) => sum + price, 0) / entry.prices.length : 0,
      lastCapturedAt: entry.lastCapturedAt,
      datesCovered: entry.datesCovered.size,
    }));
  }
}

export const competitorService = new CompetitorService();
