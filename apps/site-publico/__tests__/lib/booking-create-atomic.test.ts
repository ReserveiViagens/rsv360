/**
 * PR-11a — concurrent booking create under night advisory locks (simulated tx).
 */
import {
  bookingNightLockKeys,
  createBookingUnderPeriodLock,
  enumerateStayNights,
  lockBookingPeriodNights,
} from '@/lib/booking-create-atomic';

type FakeRow = {
  id: number;
  item_id: number;
  check_in: string;
  check_out: string;
  status: string;
  total_guests: number;
  created_at: Date;
};

function overlaps(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string,
): boolean {
  return (
    (aIn >= bIn && aIn < bOut) ||
    (aOut > bIn && aOut <= bOut) ||
    (aIn <= bIn && aOut >= bOut) ||
    (aIn >= bIn && aOut <= bOut)
  );
}

function createFakeTxEnv() {
  const bookings: FakeRow[] = [];
  let nextId = 1;
  const lockOwners = new Set<string>();
  const waiters = new Map<string, Array<() => void>>();

  function release(key: string) {
    lockOwners.delete(key);
    const q = waiters.get(key);
    if (q && q.length > 0) {
      const next = q.shift()!;
      if (q.length === 0) waiters.delete(key);
      else waiters.set(key, q);
      next();
    }
  }

  async function acquire(key: string) {
    if (!lockOwners.has(key)) {
      lockOwners.add(key);
      return () => release(key);
    }
    await new Promise<void>((resolve) => {
      const q = waiters.get(key) || [];
      q.push(resolve);
      waiters.set(key, q);
    });
    lockOwners.add(key);
    return () => release(key);
  }

  const runInTransaction = async <T>(
    fn: (client: {
      query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
    }) => Promise<T>,
  ): Promise<T> => {
    const releases: Array<() => void> = [];
    const client = {
      async query(sql: string, params: unknown[] = []) {
        if (sql.includes('pg_advisory_xact_lock')) {
          const key = `lock:${params[0]}:${params[1]}`;
          releases.push(await acquire(key));
          return { rows: [{ pg_advisory_xact_lock: true }] };
        }
        if (sql.includes('FROM bookings') && sql.includes('status IN')) {
          const itemId = Number(params[0]);
          const checkIn = String(params[1]);
          const checkOut = String(params[2]);
          const rows = bookings.filter(
            (b) =>
              b.item_id === itemId &&
              ['pending', 'confirmed', 'in_progress'].includes(b.status) &&
              overlaps(b.check_in, b.check_out, checkIn, checkOut),
          );
          return { rows };
        }
        if (sql.includes("status = 'pending'") && sql.includes('15 minutes')) {
          const itemId = Number(params[0]);
          const checkIn = String(params[1]);
          const checkOut = String(params[2]);
          const cutoff = Date.now() - 15 * 60 * 1000;
          const rows = bookings.filter(
            (b) =>
              b.item_id === itemId &&
              b.status === 'pending' &&
              b.created_at.getTime() > cutoff &&
              overlaps(b.check_in, b.check_out, checkIn, checkOut),
          );
          return { rows: rows.slice(0, 1) };
        }
        if (sql.includes('INSERT INTO bookings') || sql.trim().startsWith('INSERT')) {
          const row: FakeRow = {
            id: nextId++,
            item_id: Number(params[2]),
            check_in: String(params[4]),
            check_out: String(params[5]),
            status: 'pending',
            total_guests: Number(params[9]),
            created_at: new Date(),
          };
          bookings.push(row);
          return {
            rows: [
              {
                ...row,
                booking_code: String(params[0]),
                total: params[19],
                payment_status: 'pending',
                total_guests: row.total_guests,
              },
            ],
          };
        }
        if (sql.includes('website_content')) {
          return { rows: [] };
        }
        return { rows: [] };
      },
    };

    try {
      return await fn(client as never);
    } finally {
      for (const r of releases.reverse()) r();
    }
  };

  return { bookings, runInTransaction };
}

describe('booking-create-atomic (PR-11a)', () => {
  it('enumerateStayNights covers [in, out)', () => {
    expect(enumerateStayNights('2026-08-01', '2026-08-04')).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ]);
  });

  it('bookingNightLockKeys are stable and item-scoped', () => {
    const a = bookingNightLockKeys(10, '2026-08-01');
    const b = bookingNightLockKeys(10, '2026-08-01');
    const c = bookingNightLockKeys(11, '2026-08-01');
    expect(a).toEqual(b);
    expect(a[0] === c[0] && a[1] === c[1]).toBe(false);
  });

  it('lockBookingPeriodNights acquires sorted unique keys', async () => {
    const calls: Array<[number, number]> = [];
    const client = {
      query: async (_sql: string, params?: unknown[]) => {
        calls.push([Number(params?.[0]), Number(params?.[1])]);
        return { rows: [] };
      },
    };
    await lockBookingPeriodNights(client as never, 7, '2026-08-01', '2026-08-03');
    expect(calls.length).toBe(2);
    const sorted = [...calls].sort((x, y) =>
      x[0] !== y[0] ? x[0] - y[0] : x[1] - y[1],
    );
    expect(calls).toEqual(sorted);
  });

  it('concurrent identical POSTs → one ok, one 409', async () => {
    const { bookings, runInTransaction } = createFakeTxEnv();
    const insertSql = 'INSERT INTO bookings ... RETURNING *';
    const baseParams = (code: string) => [
      code,
      'hotel',
      42,
      'Hotel',
      '2026-09-10',
      '2026-09-12',
      2,
      0,
      0,
      2,
      'A',
      'a@x.com',
      null,
      null,
      null,
      100,
      0,
      0,
      0,
      100,
      'pix',
      null,
      '{}',
    ];

    const [r1, r2] = await Promise.all([
      createBookingUnderPeriodLock({
        itemId: 42,
        checkIn: '2026-09-10',
        checkOut: '2026-09-12',
        totalGuests: 2,
        insertSql,
        insertParams: baseParams('RSV-A'),
        runInTransaction,
      }),
      createBookingUnderPeriodLock({
        itemId: 42,
        checkIn: '2026-09-10',
        checkOut: '2026-09-12',
        totalGuests: 2,
        insertSql,
        insertParams: baseParams('RSV-B'),
        runInTransaction,
      }),
    ]);

    const oks = [r1, r2].filter((r) => r.ok);
    const fails = [r1, r2].filter((r) => !r.ok);
    expect(oks).toHaveLength(1);
    expect(fails).toHaveLength(1);
    expect(fails[0]).toMatchObject({ status: 409 });
    expect(bookings).toHaveLength(1);
  });

  it('partial overlap → one wins', async () => {
    const { bookings, runInTransaction } = createFakeTxEnv();
    const insertSql = 'INSERT INTO bookings ... RETURNING *';
    const params = (code: string, cin: string, cout: string) => [
      code,
      'hotel',
      55,
      'Hotel',
      cin,
      cout,
      1,
      0,
      0,
      1,
      'A',
      'a@x.com',
      null,
      null,
      null,
      100,
      0,
      0,
      0,
      100,
      'pix',
      null,
      '{}',
    ];

    const [r1, r2] = await Promise.all([
      createBookingUnderPeriodLock({
        itemId: 55,
        checkIn: '2026-10-01',
        checkOut: '2026-10-05',
        totalGuests: 1,
        insertSql,
        insertParams: params('RSV-1', '2026-10-01', '2026-10-05'),
        runInTransaction,
      }),
      createBookingUnderPeriodLock({
        itemId: 55,
        checkIn: '2026-10-03',
        checkOut: '2026-10-07',
        totalGuests: 1,
        insertSql,
        insertParams: params('RSV-2', '2026-10-03', '2026-10-07'),
        runInTransaction,
      }),
    ]);

    expect([r1, r2].filter((r) => r.ok)).toHaveLength(1);
    expect([r1, r2].filter((r) => !r.ok && r.status === 409)).toHaveLength(1);
    expect(bookings).toHaveLength(1);
  });

  it('different items → both 201', async () => {
    const { bookings, runInTransaction } = createFakeTxEnv();
    const insertSql = 'INSERT INTO bookings ... RETURNING *';
    const params = (code: string, itemId: number) => [
      code,
      'hotel',
      itemId,
      'Hotel',
      '2026-11-01',
      '2026-11-03',
      1,
      0,
      0,
      1,
      'A',
      'a@x.com',
      null,
      null,
      null,
      100,
      0,
      0,
      0,
      100,
      'pix',
      null,
      '{}',
    ];

    const [r1, r2] = await Promise.all([
      createBookingUnderPeriodLock({
        itemId: 100,
        checkIn: '2026-11-01',
        checkOut: '2026-11-03',
        totalGuests: 1,
        insertSql,
        insertParams: params('RSV-X', 100),
        runInTransaction,
      }),
      createBookingUnderPeriodLock({
        itemId: 200,
        checkIn: '2026-11-01',
        checkOut: '2026-11-03',
        totalGuests: 1,
        insertSql,
        insertParams: params('RSV-Y', 200),
        runInTransaction,
      }),
    ]);

    expect(r1.ok && r2.ok).toBe(true);
    expect(bookings).toHaveLength(2);
  });
});
