/**
 * PR-05a — opaque 500 JSON shape (never leak error.message / SQL details).
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  jsonInternalError,
  INTERNAL_SERVER_ERROR_BODY,
} from '@/lib/api-error';

describe('jsonInternalError (PR-05a)', () => {
  let errorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('returns canonical opaque body and status 500', async () => {
    const res = jsonInternalError(new Error('relation "bookings" does not exist'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual(INTERNAL_SERVER_ERROR_BODY);
    expect(JSON.stringify(body)).not.toContain('relation');
    expect(JSON.stringify(body)).not.toContain('does not exist');
  });

  it('does not leak SQL constraint / unique violation text', async () => {
    const sql = new Error(
      'duplicate key value violates unique constraint "bookings_booking_code_key"',
    );
    const res = jsonInternalError(sql, 'bookings_post');
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: 'Internal server error',
    });
    expect(JSON.stringify(body)).not.toMatch(/constraint|duplicate|booking_code/i);
    expect(errorSpy).toHaveBeenCalled();
    const logged = String(errorSpy.mock.calls[0]?.[0] ?? '');
    expect(logged).toContain('bookings_post');
    expect(logged).toContain('duplicate key');
  });
});
