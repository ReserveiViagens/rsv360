/**
 * PR-11b — CAS on booking status transitions (lost-update safe).
 */
import {
  updateBookingStatus,
  validateStatusTransition,
} from '@/lib/booking-status-service';

describe('PR-11b — validateStatusTransition', () => {
  it('pending → confirmed allowed', () => {
    expect(validateStatusTransition('pending', 'confirmed').allowed).toBe(true);
  });

  it('confirmed → pending rejected', () => {
    expect(validateStatusTransition('confirmed', 'pending').allowed).toBe(false);
  });
});

describe('PR-11b — updateBookingStatus CAS', () => {
  it('applies UPDATE only when status matches expected', async () => {
    const calls: Array<{ sql: string; params?: unknown[] }> = [];
    const queryFn = async (sql: string, params?: unknown[]) => {
      calls.push({ sql, params });
      if (sql.includes('SELECT id, status')) {
        return [{ id: 1, status: 'pending', booking_code: 'RSV-1' }];
      }
      if (sql.includes('UPDATE bookings') && sql.includes('RETURNING')) {
        expect(params).toEqual(['confirmed', 1, 'pending']);
        return [{ id: 1, status: 'confirmed', booking_code: 'RSV-1' }];
      }
      return [];
    };
    const logStatusChangeFn = jest.fn(async () => undefined);

    const result = await updateBookingStatus(
      1,
      'confirmed',
      undefined,
      'op@example.com',
      'test',
      { queryFn: queryFn as never, logStatusChangeFn },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.booking.status).toBe('confirmed');
    }
    expect(logStatusChangeFn).toHaveBeenCalledWith(
      1,
      'pending',
      'confirmed',
      undefined,
      'op@example.com',
      'test',
    );
  });

  it('returns conflict when concurrent UPDATE wins first (0 rows)', async () => {
    const queryFn = async (sql: string) => {
      if (sql.includes('SELECT id, status')) {
        return [{ id: 1, status: 'pending', booking_code: 'RSV-1' }];
      }
      if (sql.includes('UPDATE bookings') && sql.includes('RETURNING')) {
        return []; // CAS miss
      }
      return [];
    };

    const result = await updateBookingStatus(1, 'confirmed', undefined, undefined, 'race', {
      queryFn: queryFn as never,
      logStatusChangeFn: jest.fn(async () => undefined),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.conflict).toBe(true);
    }
  });

  it('rejects illegal transition before CAS UPDATE', async () => {
    const queryFn = jest.fn(async (sql: string) => {
      if (sql.includes('SELECT id, status')) {
        return [{ id: 1, status: 'cancelled', booking_code: 'RSV-1' }];
      }
      return [];
    });

    const result = await updateBookingStatus(1, 'confirmed', undefined, undefined, 'bad', {
      queryFn: queryFn as never,
      logStatusChangeFn: jest.fn(async () => undefined),
    });

    expect(result.success).toBe(false);
    expect(queryFn.mock.calls.some((c) => String(c[0]).includes('UPDATE'))).toBe(false);
  });

  it('2× concurrent confirm → exactly one CAS win', async () => {
    let status = 'pending';
    let casWins = 0;

    const queryFn = async (sql: string, params?: unknown[]) => {
      if (sql.includes('SELECT id, status')) {
        return [{ id: 42, status, booking_code: 'RSV-42' }];
      }
      if (sql.includes('UPDATE bookings') && sql.includes('RETURNING')) {
        const expected = params?.[2];
        if (status !== expected) {
          return [];
        }
        status = String(params?.[0]);
        casWins += 1;
        return [{ id: 42, status, booking_code: 'RSV-42' }];
      }
      return [];
    };

    const [a, b] = await Promise.all([
      updateBookingStatus(42, 'confirmed', undefined, 'a', 'race-a', {
        queryFn: queryFn as never,
        logStatusChangeFn: jest.fn(async () => undefined),
      }),
      updateBookingStatus(42, 'cancelled', undefined, 'b', 'race-b', {
        queryFn: queryFn as never,
        logStatusChangeFn: jest.fn(async () => undefined),
      }),
    ]);

    const wins = [a, b].filter((r) => r.success);
    const losses = [a, b].filter((r) => !r.success);
    expect(wins).toHaveLength(1);
    expect(losses).toHaveLength(1);
    expect(losses[0].success).toBe(false);
    if (!losses[0].success) {
      expect(losses[0].conflict).toBe(true);
    }
    expect(casWins).toBe(1);
  });
});
