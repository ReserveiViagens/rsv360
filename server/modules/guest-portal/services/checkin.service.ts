import { portalRepository, toDateOnly } from '../db/portal.repository';

export class CheckInService {
  constructor(private repository = portalRepository) {}

  async performOnlineCheckIn(bookingId: string, guestData: Record<string, any> = {}) {
    const booking = await this.repository.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Reserva não encontrada');
    }

    if (booking.status !== 'confirmed') {
      throw new Error('Reserva não está confirmada');
    }

    const status = this.getCheckInStatusFromBooking(booking);
    if (!status.canCheckIn) {
      throw new Error('Check-in disponível apenas no dia da reserva ou véspera');
    }

    const guest = await this.repository.upsertGuestForBooking(bookingId, guestData, booking);
    const updatedBooking = await this.repository.updateBookingStatus(bookingId, {
      status: 'checked_in',
      checked_in_at: new Date(),
      checkedInAt: new Date(),
    });

    return {
      success: true,
      booking: Object.keys(updatedBooking).length > 0 ? updatedBooking : { ...booking, status: 'checked_in' },
      guest,
    };
  }

  async getCheckInStatus(bookingId: string) {
    const booking = await this.repository.getBookingById(bookingId);
    if (!booking) {
      return { canCheckIn: false, reason: 'Reserva não encontrada', booking: null };
    }

    const status = this.getCheckInStatusFromBooking(booking);
    return {
      ...status,
      booking,
    };
  }

  private getCheckInStatusFromBooking(booking: Record<string, any>) {
    const status = booking.status;
    if (status !== 'confirmed') {
      return {
        canCheckIn: false,
        reason: 'Reserva não está confirmada',
      };
    }

    const checkInDate = this.pickDate(booking, ['check_in_date', 'checkin_date', 'arrival_date', 'start_date']);
    if (!checkInDate) {
      return {
        canCheckIn: true,
        reason: 'Check-in liberado',
      };
    }

    const today = toDateOnly(new Date());
    const tomorrow = today ? new Date(today.getTime()) : new Date();
    if (tomorrow) {
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    }

    const bookingDay = toDateOnly(checkInDate);
    const canCheckIn = Boolean(
      bookingDay &&
      today &&
      (bookingDay.getTime() === today.getTime() || bookingDay.getTime() === tomorrow.getTime())
    );

    return {
      canCheckIn,
      reason: canCheckIn
        ? 'Check-in liberado'
        : 'Check-in disponível apenas no dia da reserva ou véspera',
    };
  }

  private pickDate(row: Record<string, any>, candidates: string[]) {
    for (const candidate of candidates) {
      if (row?.[candidate]) {
        const date = new Date(row[candidate]);
        if (!Number.isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return null;
  }
}

export const checkInService = new CheckInService();

module.exports = { CheckInService, checkInService };

