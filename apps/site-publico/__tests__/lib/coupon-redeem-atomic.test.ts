/**
 * PR-11c — atomic coupon redemption (FOR UPDATE on coupon row + re-check + INSERT).
 */
import { applyCouponToBooking } from '@/lib/coupons-service';

type CouponRow = {
  id: number;
  code: string;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  total_uses: number;
  is_active: boolean;
};

type UsageRow = {
  id: number;
  coupon_id: number;
  booking_id: number;
  user_id: number;
  discount_applied: number;
};

function createFakeCouponDb(initialCoupons: CouponRow[]) {
  const coupons = new Map<number, CouponRow>(
    initialCoupons.map((c) => [c.id, { ...c }]),
  );
  const usages: UsageRow[] = [];
  let nextUsageId = 1;

  const locks = new Map<number, Promise<void>>();

  async function withCouponLock<T>(couponId: number, fn: () => Promise<T>): Promise<T> {
    const prev = locks.get(couponId) || Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    locks.set(
      couponId,
      prev.then(() => gate),
    );
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  const runInTransaction = async <T>(
    fn: (client: {
      query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
    }) => Promise<T>,
  ): Promise<T> => {
    // Coupon id is only known inside fn; serialize via FOR UPDATE handler.
    let heldCouponId: number | null = null;
    let releaseLock: (() => void) | null = null;

    const client = {
      async query(sql: string, params: unknown[] = []) {
        if (sql.includes('FROM coupons') && sql.includes('FOR UPDATE')) {
          const couponId = Number(params[0]);
          heldCouponId = couponId;
          const prev = locks.get(couponId) || Promise.resolve();
          let release!: () => void;
          const gate = new Promise<void>((r) => {
            release = r;
          });
          locks.set(
            couponId,
            prev.then(() => gate),
          );
          await prev;
          releaseLock = release;
          const row = coupons.get(couponId);
          return { rows: row ? [{ ...row }] : [] };
        }

        if (sql.includes('COUNT(*)') && sql.includes('FROM coupon_usage')) {
          const couponId = Number(params[0]);
          const userId = Number(params[1]);
          const count = usages.filter(
            (u) => u.coupon_id === couponId && u.user_id === userId,
          ).length;
          return { rows: [{ count }] };
        }

        if (sql.includes('INSERT INTO coupon_usage')) {
          const couponId = Number(params[0]);
          const bookingId = Number(params[1]);
          const userId = Number(params[2]);
          const discount = Number(params[4]);
          const id = nextUsageId++;
          usages.push({
            id,
            coupon_id: couponId,
            booking_id: bookingId,
            user_id: userId,
            discount_applied: discount,
          });
          // Simulate AFTER INSERT trigger update_coupon_stats
          const c = coupons.get(couponId);
          if (c) {
            c.total_uses += 1;
          }
          return { rows: [{ id }] };
        }

        return { rows: [] };
      },
    };

    try {
      return await fn(client);
    } finally {
      if (releaseLock) releaseLock();
      else if (heldCouponId != null) {
        // no-op
      }
    }
  };

  return {
    runInTransaction,
    coupons,
    usages,
    withCouponLock,
  };
}

describe('PR-11c — applyCouponToBooking atomic', () => {
  it('usage_limit=1 → 1 redeem succeeds', async () => {
    const db = createFakeCouponDb([
      {
        id: 1,
        code: 'ONCE',
        usage_limit: 1,
        usage_limit_per_user: 10,
        total_uses: 0,
        is_active: true,
      },
    ]);

    const result = await applyCouponToBooking(
      1,
      100,
      7,
      200,
      20,
      undefined,
      undefined,
      { runInTransaction: db.runInTransaction as never },
    );

    expect(result).toEqual({ ok: true, usageId: 1 });
    expect(db.coupons.get(1)!.total_uses).toBe(1);
    expect(db.usages).toHaveLength(1);
  });

  it('usage_limit=1 → 2 concurrent redeems → 1 ok + 1 esgotado', async () => {
    const db = createFakeCouponDb([
      {
        id: 1,
        code: 'ONCE',
        usage_limit: 1,
        usage_limit_per_user: 10,
        total_uses: 0,
        is_active: true,
      },
    ]);

    const [a, b] = await Promise.all([
      applyCouponToBooking(1, 101, 1, 100, 10, undefined, undefined, {
        runInTransaction: db.runInTransaction as never,
      }),
      applyCouponToBooking(1, 102, 2, 100, 10, undefined, undefined, {
        runInTransaction: db.runInTransaction as never,
      }),
    ]);

    const oks = [a, b].filter((r) => r.ok);
    const fails = [a, b].filter((r) => !r.ok);
    expect(oks).toHaveLength(1);
    expect(fails).toHaveLength(1);
    if (!fails[0].ok) {
      expect(fails[0].status).toBe(409);
      expect(fails[0].error).toMatch(/esgotado/i);
    }
    expect(db.usages).toHaveLength(1);
    expect(db.coupons.get(1)!.total_uses).toBe(1);
  });

  it('usage_limit=2 → 3 concurrent → 2 ok + 1 fail', async () => {
    const db = createFakeCouponDb([
      {
        id: 2,
        code: 'TWICE',
        usage_limit: 2,
        usage_limit_per_user: 10,
        total_uses: 0,
        is_active: true,
      },
    ]);

    const results = await Promise.all([
      applyCouponToBooking(2, 201, 1, 100, 5, undefined, undefined, {
        runInTransaction: db.runInTransaction as never,
      }),
      applyCouponToBooking(2, 202, 2, 100, 5, undefined, undefined, {
        runInTransaction: db.runInTransaction as never,
      }),
      applyCouponToBooking(2, 203, 3, 100, 5, undefined, undefined, {
        runInTransaction: db.runInTransaction as never,
      }),
    ]);

    expect(results.filter((r) => r.ok)).toHaveLength(2);
    expect(results.filter((r) => !r.ok)).toHaveLength(1);
    expect(db.usages).toHaveLength(2);
    expect(db.coupons.get(2)!.total_uses).toBe(2);
  });

  it('2 different coupons in parallel → both succeed', async () => {
    const db = createFakeCouponDb([
      {
        id: 10,
        code: 'A',
        usage_limit: 1,
        usage_limit_per_user: 5,
        total_uses: 0,
        is_active: true,
      },
      {
        id: 11,
        code: 'B',
        usage_limit: 1,
        usage_limit_per_user: 5,
        total_uses: 0,
        is_active: true,
      },
    ]);

    const [a, b] = await Promise.all([
      applyCouponToBooking(10, 301, 1, 100, 10, undefined, undefined, {
        runInTransaction: db.runInTransaction as never,
      }),
      applyCouponToBooking(11, 302, 1, 100, 10, undefined, undefined, {
        runInTransaction: db.runInTransaction as never,
      }),
    ]);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(db.usages).toHaveLength(2);
  });

  it('usage_limit_per_user=1 blocks second redeem for same user', async () => {
    const db = createFakeCouponDb([
      {
        id: 3,
        code: 'PERUSER',
        usage_limit: 100,
        usage_limit_per_user: 1,
        total_uses: 0,
        is_active: true,
      },
    ]);

    const first = await applyCouponToBooking(3, 401, 9, 100, 10, undefined, undefined, {
      runInTransaction: db.runInTransaction as never,
    });
    const second = await applyCouponToBooking(3, 402, 9, 100, 10, undefined, undefined, {
      runInTransaction: db.runInTransaction as never,
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.status).toBe(409);
      expect(second.error).toMatch(/usuário/i);
    }
  });

  it('missing coupon → 404', async () => {
    const db = createFakeCouponDb([]);
    const result = await applyCouponToBooking(999, 1, 1, 100, 10, undefined, undefined, {
      runInTransaction: db.runInTransaction as never,
    });
    expect(result).toEqual({
      ok: false,
      status: 404,
      error: 'Cupom não encontrado',
    });
  });
});
