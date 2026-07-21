/**
 * PR-05a — bookings POST must not leak SQL / constraint error.message on 500.
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { calculatePricing } from '@/lib/pricing-service';
import { POST } from '@/app/api/bookings/route';
import { INTERNAL_SERVER_ERROR_BODY } from '@/lib/api-error';

jest.mock('@/lib/db', () => ({
  queryDatabase: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/lib/email', () => ({
  sendBookingConfirmation: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/lib/availability-service', () => ({
  checkAvailability: jest.fn().mockResolvedValue({ available: true }),
  isPeriodBlocked: jest.fn().mockResolvedValue({ blocked: false }),
  blockPeriod: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/lib/pricing-service', () => ({
  calculatePricing: jest.fn(),
  validateStayRules: jest.fn().mockResolvedValue({ valid: true }),
}));
jest.mock('@/lib/webhook-service', () => ({
  triggerWebhook: jest.fn().mockResolvedValue(true),
  WEBHOOK_EVENTS: {},
}));
jest.mock('@/lib/checkin-service', () => ({
  createCheckinRequest: jest.fn().mockResolvedValue({
    id: 1,
    check_in_code: 'CHK-001',
  }),
}));
jest.mock('@/lib/checkin-notifications', () => ({
  sendCheckinCreatedNotification: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/lib/booking-status-service', () => ({
  logStatusChange: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/api-auth', () => ({
  optionalAuth: jest.fn().mockResolvedValue(null),
}));

describe('POST /api/bookings — PR-05a error shape', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  it('returns opaque 500 when pricing/SQL path throws constraint text', async () => {
    (calculatePricing as unknown as jest.Mock).mockRejectedValue(
      new Error(
        'duplicate key value violates unique constraint "bookings_booking_code_key"',
      ),
    );

    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_type: 'hotel',
        item_id: 1,
        item_name: 'Hotel Test',
        check_in: '2026-08-01',
        check_out: '2026-08-05',
        adults: 2,
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '11999999999',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(INTERNAL_SERVER_ERROR_BODY);
    expect(JSON.stringify(data)).not.toMatch(
      /constraint|duplicate|booking_code|violates/i,
    );
  });
});
