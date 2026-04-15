import { revenueRepository } from '../db/revenue.repository';

function dateOnly(value: string | Date) {
  return new Date(value).toISOString().split('T')[0];
}

function daysBetween(startDate: string, endDate: string) {
  return Math.max(Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1, 1);
}

function safeChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export class RevenueKpisService {
  async getRevenueKPIs(startDate: string, endDate: string) {
    const periodDays = daysBetween(startDate, endDate);
    const totalRooms = await revenueRepository.getTotalRooms();
    const roomsAvailable = totalRooms * periodDays;
    const totalRevenue = await revenueRepository.getTotalRevenue(startDate, endDate);
    const roomsSold = await revenueRepository.getRoomsSold(startDate, endDate);
    const adr = roomsSold ? totalRevenue / roomsSold : 0;
    const occupancyRate = roomsAvailable ? (roomsSold / roomsAvailable) * 100 : 0;
    const revpar = roomsAvailable ? totalRevenue / roomsAvailable : 0;
    const alos = await revenueRepository.getAverageLengthOfStay(startDate, endDate);
    const leadTimes = await revenueRepository.getBookingLeadTimes(startDate, endDate);
    const bookingLeadTime = leadTimes.length ? leadTimes.reduce((sum, value) => sum + value, 0) / leadTimes.length : 0;
    const cancellationCount = await revenueRepository.getCancellationCount(startDate, endDate);
    const cancellationRate = (roomsSold + cancellationCount) ? (cancellationCount / (roomsSold + cancellationCount)) * 100 : 0;

    const currentStart = new Date(startDate);
    const previousEndDate = new Date(currentStart.getTime() - 86400000);
    const previousStartDate = new Date(previousEndDate.getTime() - ((periodDays - 1) * 86400000));
    const previousStart = dateOnly(previousStartDate);
    const previousEnd = dateOnly(previousEndDate);
    const previousRevenue = await revenueRepository.getTotalRevenue(previousStart, previousEnd);
    const previousRoomsSold = await revenueRepository.getRoomsSold(previousStart, previousEnd);
    const previousRoomsAvailable = totalRooms * daysBetween(previousStart, previousEnd);
    const previousAdr = previousRoomsSold ? previousRevenue / previousRoomsSold : 0;
    const previousOccupancyRate = previousRoomsAvailable ? (previousRoomsSold / previousRoomsAvailable) * 100 : 0;
    const previousRevpar = previousRoomsAvailable ? previousRevenue / previousRoomsAvailable : 0;

    return {
      period: { start: startDate, end: endDate },
      adr,
      revpar,
      occupancy_rate: occupancyRate,
      total_revenue: totalRevenue,
      rooms_sold: roomsSold,
      rooms_available: roomsAvailable,
      goppar: roomsAvailable ? totalRevenue / roomsAvailable : 0,
      alos,
      booking_lead_time: bookingLeadTime,
      cancellation_rate: cancellationRate,
      previous_period: {
        adr: previousAdr,
        revpar: previousRevpar,
        occupancy_rate: previousOccupancyRate,
        total_revenue: previousRevenue,
      },
      adr_change: safeChange(adr, previousAdr),
      revpar_change: safeChange(revpar, previousRevpar),
      occupancy_change: safeChange(occupancyRate, previousOccupancyRate),
      revenue_change: safeChange(totalRevenue, previousRevenue),
    };
  }

  async getRevenueByRoomType(startDate: string, endDate: string) {
    return revenueRepository.getRevenueByRoomType(startDate, endDate);
  }

  async getRevenueByChannel(startDate: string, endDate: string) {
    return revenueRepository.getRevenueByChannel(startDate, endDate);
  }

  async getMonthlyTrend(months = 12) {
    const result = [];
    const today = new Date();
    for (let offset = months - 1; offset >= 0; offset -= 1) {
      const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offset, 1));
      const start = date.toISOString().split('T')[0];
      const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).toISOString().split('T')[0];
      const kpis = await this.getRevenueKPIs(start, end);
      result.push({
        month: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
        revenue: kpis.total_revenue,
        occupancy: kpis.occupancy_rate,
        adr: kpis.adr,
        revpar: kpis.revpar,
      });
    }
    return result;
  }

  async getDailyRevenue(startDate: string, endDate: string) {
    return revenueRepository.getRevenueRange(startDate, endDate);
  }
}

export const revenueKpisService = new RevenueKpisService();
