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

export class RateCalendarService {
  async generateRateCalendar(startDate: string, endDate: string, roomTypeId?: number) {
    const dates = daysInRange(startDate, endDate);
    const entries = [];
    for (const date of dates) {
      const calculated = await pricingEngineService.calculateDynamicPrice(roomTypeId || 1, date, {
        basePrice: roomTypeId ? await revenueRepository.getBasePriceForRoomType(roomTypeId) : undefined,
      });
      const entry = await revenueRepository.upsertRateEntry({
        room_type_id: roomTypeId || 1,
        date,
        base_price: calculated.basePrice,
        calculated_price: calculated.calculatedPrice,
        manual_override: false,
        final_price: calculated.calculatedPrice,
        applied_rules: calculated.appliedRules,
        occupancy_rate: calculated.occupancyRate,
      });
      entries.push(entry);
    }

    const prices = entries.map((entry: any) => Number(entry.final_price || 0));
    const daysGenerated = entries.length;
    return {
      daysGenerated,
      avgPrice: daysGenerated ? prices.reduce((sum, price) => sum + price, 0) / daysGenerated : 0,
      minPrice: daysGenerated ? Math.min(...prices) : 0,
      maxPrice: daysGenerated ? Math.max(...prices) : 0,
    };
  }

  async getRateCalendar(startDate: string, endDate: string, roomTypeId?: number) {
    const entries = await revenueRepository.getRateCalendar(startDate, endDate, roomTypeId);
    if (entries.length > 0) {
      return entries;
    }
    await this.generateRateCalendar(startDate, endDate, roomTypeId);
    return revenueRepository.getRateCalendar(startDate, endDate, roomTypeId);
  }

  async overridePrice(roomTypeId: number, date: string, price: number) {
    return revenueRepository.overridePrice(roomTypeId, date, price);
  }

  async removeOverride(roomTypeId: number, date: string) {
    return revenueRepository.removeOverride(roomTypeId, date);
  }

  async bulkOverridePrices(updates: Array<{ roomTypeId: number; date: string; price: number }>) {
    let updated = 0;
    for (const update of updates) {
      await this.overridePrice(update.roomTypeId, update.date, update.price);
      updated += 1;
    }
    return { updated };
  }

  async getCalendarSummary(month: number, year: number, roomTypeId?: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
    const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0];
    const entries = await this.getRateCalendar(startDate, endDate, roomTypeId);
    const prices = entries.map((entry: any) => Number(entry.final_price || 0));
    const overrides = entries.filter((entry: any) => entry.manual_override).length;
    const occupancyValues = entries.map((entry: any) => Number(entry.occupancy_rate || 0)).filter((value) => value > 0);
    return {
      avgPrice: prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      daysWithOverride: overrides,
      occupancyAvg: occupancyValues.length ? occupancyValues.reduce((sum, value) => sum + value, 0) / occupancyValues.length : 0,
    };
  }
}

export const rateCalendarService = new RateCalendarService();
