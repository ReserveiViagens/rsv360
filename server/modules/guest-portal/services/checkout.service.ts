import { portalRepository } from '../db/portal.repository';
import { feedbackService, FeedbackService } from './feedback.service';
import { tokenService, TokenService } from './token.service';

export class CheckOutService {
  constructor(
    private repository = portalRepository,
    private feedback = feedbackService,
    private tokens = tokenService
  ) {}

  async performOnlineCheckOut(bookingId: string, data: Record<string, any> = {}) {
    const booking = await this.repository.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Reserva não encontrada');
    }

    if (booking.status !== 'checked_in') {
      throw new Error('Reserva não está em check-in');
    }

    const updatedBooking = await this.repository.updateBookingStatus(bookingId, {
      status: 'checked_out',
      checked_out_at: new Date(),
      checkedOutAt: new Date(),
    });

    let feedback = null;
    if (data.feedback) {
      feedback = await this.feedback.submitFeedback(bookingId, data.feedback);
    }

    await this.tokens.revokeToken(bookingId);

    return {
      success: true,
      booking: Object.keys(updatedBooking).length > 0 ? updatedBooking : { ...booking, status: 'checked_out' },
      feedback,
    };
  }
}

export const checkOutService = new CheckOutService();

module.exports = { CheckOutService, checkOutService };

