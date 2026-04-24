import { revenueRepository } from '../db/revenue.repository';

function dateOnly(value: string | Date) {
  return new Date(value).toISOString().split('T')[0];
}

function monthIndex(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCMonth();
}

function dayOfWeek(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
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

export class ForecastService {
  async getSeasonalityFactors() {
    const bookings = await revenueRepository.getBookings();
    if (!bookings.length) {
      return [0.85, 0.9, 0.95, 0.88, 0.8, 0.75, 1.2, 0.85, 0.82, 0.9, 0.95, 1.35];
    }

    const monthlyTotals = Array.from({ length: 12 }, () => 0);
    const monthlyCounts = Array.from({ length: 12 }, () => 0);
    for (const booking of bookings) {
      const bookingAny = booking as any;
      const month = monthIndex(String(bookingAny.check_in_date || bookingAny.checkInDate || bookingAny.created_at || bookingAny.createdAt || new Date().toISOString()));
      monthlyTotals[month] += Number(bookingAny.amount || bookingAny.total_amount || bookingAny.price || 0);
      monthlyCounts[month] += 1;
    }
    const overall = monthlyTotals.reduce((sum, value) => sum + value, 0) / Math.max(monthlyCounts.reduce((sum, value) => sum + value, 0), 1);
    return monthlyTotals.map((value, index) => {
      const average = monthlyCounts[index] ? value / monthlyCounts[index] : overall;
      return overall ? Number((average / overall).toFixed(2)) : 1;
    });
  }

  async getDayOfWeekFactors() {
    const bookings = await revenueRepository.getBookings();
    if (!bookings.length) {
      return [0.9, 0.75, 0.72, 0.78, 0.85, 1.2, 1.25];
    }

    const totals = Array.from({ length: 7 }, () => 0);
    const counts = Array.from({ length: 7 }, () => 0);
    for (const booking of bookings) {
      const bookingAny = booking as any;
      const date = String(bookingAny.check_in_date || bookingAny.checkInDate || bookingAny.created_at || bookingAny.createdAt || new Date().toISOString());
      const index = dayOfWeek(date);
      totals[index] += Number(bookingAny.amount || bookingAny.total_amount || bookingAny.price || 0);
      counts[index] += 1;
    }
    const overall = totals.reduce((sum, value) => sum + value, 0) / Math.max(counts.reduce((sum, value) => sum + value, 0), 1);
    return totals.map((value, index) => {
      const average = counts[index] ? value / counts[index] : overall;
      return overall ? Number((average / overall).toFixed(2)) : 1;
    });
  }

  async generateForecast(startDate: string, endDate: string) {
    const bookings = await revenueRepository.getBookings();
    const seasonality = await this.getSeasonalityFactors();
    const dayFactors = await this.getDayOfWeekFactors();
    const dates = daysInRange(startDate, endDate);
    const generated = [];
    const totalRooms = Math.max(await revenueRepository.getTotalRooms(), 1);
    const confidence = bookings.length > 730 ? 0.85 : bookings.length > 365 ? 0.7 : bookings.length > 0 ? 0.5 : 0.3;

    for (const date of dates) {
      const historicalOccupancy = bookings.length
        ? await revenueRepository.getOccupancyRate(date)
        : 50;
      const seasonalityFactor = seasonality[monthIndex(date)] || 1;
      const dayOfWeekFactor = dayFactors[dayOfWeek(date)] || 1;
      const trendFactor = bookings.length ? 1 + Math.min((bookings.length % 10) / 100, 0.1) : 1;
      const predictedOccupancy = Math.max(0, Math.min(100, historicalOccupancy * seasonalityFactor * dayOfWeekFactor * trendFactor));
      const predictedDemand = Math.max(0, Math.round((predictedOccupancy / 100) * totalRooms));
      generated.push({
        date,
        predicted_occupancy: predictedOccupancy,
        predicted_demand: predictedDemand,
        confidence,
        historical_occupancy: historicalOccupancy,
        seasonality_factor: seasonalityFactor,
        day_of_week_factor: dayOfWeekFactor,
        trend_factor: trendFactor,
        generated_at: new Date().toISOString(),
      });
    }

    await revenueRepository.saveForecast(generated);
    return {
      daysForecasted: generated.length,
      avgPredictedOccupancy: generated.length ? generated.reduce((sum, item) => sum + item.predicted_occupancy, 0) / generated.length : 0,
      confidence,
    };
  }

  async getForecast(startDate: string, endDate: string) {
    return revenueRepository.getForecast(startDate, endDate);
  }

  async getBookingPace(targetDate: string) {
    const bookings = await revenueRepository.getBookings();
    const target = dateOnly(targetDate);
    const currentPace = bookings.filter((booking) => {
      const bookingAny = booking as any;
      return dateOnly(bookingAny.check_in_date || bookingAny.checkInDate || bookingAny.created_at || bookingAny.createdAt || target) === target;
    }).length;
    const historicalPace = bookings.filter((booking) => {
      const bookingAny = booking as any;
      const checkIn = new Date(bookingAny.check_in_date || bookingAny.checkInDate || bookingAny.created_at || bookingAny.createdAt || target);
      checkIn.setUTCFullYear(checkIn.getUTCFullYear() - 1);
      return dateOnly(checkIn) === target;
    }).length;
    const paceRatio = historicalPace > 0 ? currentPace / historicalPace : 1;

    return {
      currentPace,
      historicalPace,
      paceRatio,
      interpretation: paceRatio > 1.1 ? 'Demanda acima do esperado' : paceRatio < 0.9 ? 'Demanda abaixo do esperado' : 'Demanda dentro do esperado',
    };
  }
}

export const forecastService = new ForecastService();
