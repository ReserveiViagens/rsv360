import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { CheckInService } from './services/checkin.service';
import { TokenService } from './services/token.service';

class InMemoryRepository {
  booking = {
    id: 'booking_1',
    status: 'confirmed',
    check_in_date: new Date(),
    check_out_date: new Date(Date.now() + 86400000),
    guest_name: 'Hóspede Teste',
    guest_email: 'hospede@rsv360.com',
  };

  tokenRow: any = null;

  async getBookingById(bookingId: string) {
    return bookingId === this.booking.id ? this.booking : null;
  }

  async insertPortalToken(data: Record<string, any>) {
    this.tokenRow = { id: 'token_1', ...data };
    return this.tokenRow;
  }

  async findValidToken(token: string) {
    return token === this.tokenRow?.token
      ? { token: this.tokenRow, booking: this.booking, guest: { name: this.booking.guest_name, email: this.booking.guest_email } }
      : null;
  }

  async touchToken() {
    return null;
  }

  async revokeToken() {
    return { success: true };
  }

  async revokeExpiredTokens() {
    return 0;
  }

  async upsertGuestForBooking(_bookingId: string, guestData: Record<string, any>) {
    return { ...guestData };
  }

  async updateBookingStatus(_bookingId: string, updates: Record<string, any>) {
    return { ...this.booking, ...updates };
  }
}

export async function runSmokeTests() {
  const repository = new InMemoryRepository();
  const tokenService = new TokenService(repository as any);
  const checkInService = new CheckInService(repository as any);

  const tokenResult = await tokenService.generateToken('booking_1');
  assert.equal(typeof tokenResult.token, 'string');
  assert.equal(tokenResult.token.length > 0, true);
  assert.equal(crypto.createHash('sha256').update(tokenResult.token).digest('hex').length > 0, true);

  const invalidToken = await tokenService.validateToken('invalid-token');
  assert.equal(invalidToken, null);

  const rejectedRepository = new InMemoryRepository();
  rejectedRepository.booking = { ...rejectedRepository.booking, status: 'pending' };
  const rejectedCheckInService = new CheckInService(rejectedRepository as any);

  await assert.rejects(
    () => rejectedCheckInService.performOnlineCheckIn('booking_1', {}),
    /Reserva não está confirmada/
  );

  return {
    tokenGenerated: true,
    invalidTokenRejected: true,
    checkInRejected: true,
  };
}

if (require.main === module) {
  runSmokeTests()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runSmokeTests };

