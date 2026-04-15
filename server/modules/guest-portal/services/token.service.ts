import crypto from 'node:crypto';
import { portalRepository, addDays } from '../db/portal.repository';

export class TokenService {
  constructor(private repository = portalRepository) {}

  async generateToken(bookingId: string) {
    const booking = await this.repository.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Reserva não encontrada');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const checkoutDate = this.pickDate(booking, ['check_out_date', 'checkout_date', 'departure_date', 'end_date']);
    const ttlDays = Number(process.env.PORTAL_TOKEN_EXPIRY_DAYS || 7);
    const expiresAt = checkoutDate ? addDays(checkoutDate, ttlDays) : addDays(new Date(), ttlDays);

    await this.repository.insertPortalToken({
      booking_id: bookingId,
      token,
      expires_at: expiresAt,
      is_active: true,
      active: true,
      last_accessed_at: null,
      access_count: 0,
    });

    const baseUrl = process.env.PORTAL_BASE_URL || 'http://localhost:3000/portal';
    return {
      token,
      portalUrl: `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`,
      expiresAt,
      booking,
    };
  }

  async validateToken(token: string) {
    if (!token) return null;

    const result = await this.repository.findValidToken(token);
    if (!result) return null;

    await this.repository.touchToken(token);
    return {
      booking: result.booking,
      guest: result.guest,
      token: result.token,
    };
  }

  async revokeToken(bookingId: string) {
    await this.repository.revokeToken(bookingId);
    return { success: true };
  }

  async revokeExpiredTokens() {
    const revokedCount = await this.repository.revokeExpiredTokens();
    return { success: true, revokedCount };
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

export const tokenService = new TokenService();

module.exports = { TokenService, tokenService };

