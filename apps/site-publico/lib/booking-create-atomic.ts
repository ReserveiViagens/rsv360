/**
 * PR-11a — atomic booking create under per-item+night advisory locks (no DDL).
 * Overlapping stays share at least one night key → serialized; different items do not.
 */

import { createHash } from 'crypto';
import type { PoolClient } from 'pg';
import { withDbTransaction } from './db';
import {
  checkAvailability,
  isPeriodBlocked,
  type AvailabilityCheck,
} from './availability-service';

export type BookingAtomicConflict =
  | { ok: false; status: 409; error: string; details?: Record<string, unknown> }
  | { ok: false; status: 423; error: string; details?: Record<string, unknown> };

export type BookingAtomicSuccess = { ok: true; booking: Record<string, unknown> };

export type BookingAtomicResult = BookingAtomicSuccess | BookingAtomicConflict;

/** Nights in [checkIn, checkOut) as YYYY-MM-DD (UTC date parts). */
export function enumerateStayNights(checkIn: string, checkOut: string): string[] {
  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return [];
  }
  const nights: string[] = [];
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    nights.push(d.toISOString().slice(0, 10));
  }
  return nights;
}

/** Two int4 keys for pg_advisory_xact_lock(key1, key2) — scoped to item + night. */
export function bookingNightLockKeys(itemId: number, nightYmd: string): [number, number] {
  const digest = createHash('sha256')
    .update(`rsv360:booking-lock:v1:${itemId}:${nightYmd}`)
    .digest();
  return [digest.readInt32BE(0), digest.readInt32BE(4)];
}

/**
 * Acquire transaction-scoped advisory locks for every night of the stay, in sorted
 * key order to avoid deadlocks between overlapping ranges.
 */
export async function lockBookingPeriodNights(
  client: PoolClient,
  itemId: number,
  checkIn: string,
  checkOut: string,
): Promise<void> {
  const nights = enumerateStayNights(checkIn, checkOut);
  const pairs = nights
    .map((n) => bookingNightLockKeys(itemId, n))
    .sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));

  // Dedupe identical keys (same night twice)
  const seen = new Set<string>();
  for (const [k1, k2] of pairs) {
    const id = `${k1}:${k2}`;
    if (seen.has(id)) continue;
    seen.add(id);
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [k1, k2]);
  }
}

export type CreateBookingUnderPeriodLockInput = {
  itemId: number;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  insertSql: string;
  insertParams: unknown[];
  /** Injected for unit tests — defaults to real pool transaction. */
  runInTransaction?: typeof withDbTransaction;
  checkAvailabilityFn?: typeof checkAvailability;
  isPeriodBlockedFn?: typeof isPeriodBlocked;
};

/**
 * Lock nights → re-check availability + soft block → INSERT.
 * Side-effects (email, PIX QR, webhooks) stay outside this function.
 */
export async function createBookingUnderPeriodLock(
  input: CreateBookingUnderPeriodLockInput,
): Promise<BookingAtomicResult> {
  const runTx = input.runInTransaction ?? withDbTransaction;
  const checkAvail = input.checkAvailabilityFn ?? checkAvailability;
  const checkBlocked = input.isPeriodBlockedFn ?? isPeriodBlocked;

  return runTx(async (client) => {
    await lockBookingPeriodNights(client, input.itemId, input.checkIn, input.checkOut);

    // Re-check inside the same connection after locks (still uses pool queries for
    // availability helpers today; lock serializes writers for this item+nights).
    // Prefer client-bound queries when helpers support executor — for 11-a we
    // re-run via wrappers that use client.query for the conflict SELECT.
    const availability = await checkAvailabilityOnClient(
      client,
      input.itemId,
      input.checkIn,
      input.checkOut,
      input.totalGuests,
      checkAvail,
    );

    if (!availability.available) {
      return {
        ok: false,
        status: 409,
        error: availability.reason || 'Item não disponível para as datas selecionadas',
        details: {
          conflictingBookings: availability.conflictingBookings,
          conflictingBookingIds: availability.conflictingBookingIds,
          capacityAvailable: availability.capacityAvailable,
          maxCapacity: availability.maxCapacity,
          requestedGuests: availability.requestedGuests,
        },
      };
    }

    const blockStatus = await isPeriodBlockedOnClient(
      client,
      input.itemId,
      input.checkIn,
      input.checkOut,
      checkBlocked,
    );

    if (blockStatus.blocked) {
      return {
        ok: false,
        status: 423,
        error:
          blockStatus.reason ||
          'Período temporariamente bloqueado. Tente novamente em alguns instantes.',
        details: { blockedBy: blockStatus.bookingId },
      };
    }

    const inserted = await client.query(input.insertSql, input.insertParams);
    const booking = inserted.rows[0] as Record<string, unknown> | undefined;
    if (!booking) {
      throw new Error('INSERT bookings não retornou linha');
    }
    return { ok: true, booking };
  });
}

const OVERLAP_SQL = `
  SELECT id, booking_code, check_in, check_out, status, total_guests
  FROM bookings
  WHERE item_id = $1
    AND status IN ('pending', 'confirmed', 'in_progress')
    AND (
      (check_in >= $2 AND check_in < $3)
      OR (check_out > $2 AND check_out <= $3)
      OR (check_in <= $2 AND check_out >= $3)
      OR (check_in >= $2 AND check_out <= $3)
    )
  ORDER BY check_in ASC
`;

async function checkAvailabilityOnClient(
  client: PoolClient,
  itemId: number,
  checkIn: string,
  checkOut: string,
  requestedGuests: number,
  _fallback: typeof checkAvailability,
): Promise<AvailabilityCheck> {
  const conflicts = await client.query(OVERLAP_SQL, [itemId, checkIn, checkOut]);
  if (conflicts.rows.length > 0) {
    return {
      available: false,
      conflictingBookings: conflicts.rows.length,
      conflictingBookingIds: conflicts.rows.map((r: { id: number }) => r.id),
      reason: `Conflito com ${conflicts.rows.length} reserva(s) existente(s)`,
    };
  }

  // Capacity: best-effort inside tx (same semantics as availability-service)
  if (requestedGuests > 0) {
    try {
      const capacityInfo = await client.query(
        `SELECT max_guests, max_capacity FROM website_content
         WHERE id = $1 AND type = 'hotel' LIMIT 1`,
        [itemId],
      );
      const maxCapacity =
        capacityInfo.rows[0]?.max_guests || capacityInfo.rows[0]?.max_capacity;
      if (maxCapacity) {
        const occ = await client.query(
          `SELECT COALESCE(SUM(total_guests), 0) as total FROM bookings
           WHERE item_id = $1 AND status IN ('pending', 'confirmed', 'in_progress')
             AND (
               (check_in >= $2 AND check_in < $3)
               OR (check_out > $2 AND check_out <= $3)
               OR (check_in <= $2 AND check_out >= $3)
               OR (check_in >= $2 AND check_out <= $3)
             )`,
          [itemId, checkIn, checkOut],
        );
        const current = parseInt(String(occ.rows[0]?.total || '0'), 10);
        if (current + requestedGuests > maxCapacity) {
          return {
            available: false,
            conflictingBookings: 0,
            conflictingBookingIds: [],
            reason: `Capacidade máxima excedida (${maxCapacity} hóspedes)`,
            capacityAvailable: false,
            maxCapacity,
            requestedGuests,
          };
        }
      }
    } catch {
      // ignore capacity table issues — match availability-service behavior
    }
  }

  return {
    available: true,
    conflictingBookings: 0,
    conflictingBookingIds: [],
    capacityAvailable: true,
    requestedGuests,
  };
}

async function isPeriodBlockedOnClient(
  client: PoolClient,
  itemId: number,
  checkIn: string,
  checkOut: string,
  _fallback: typeof isPeriodBlocked,
): Promise<{ blocked: boolean; bookingId?: number; reason?: string }> {
  try {
    const recentPending = await client.query(
      `SELECT id, booking_code, created_at
       FROM bookings
       WHERE item_id = $1
         AND status = 'pending'
         AND created_at > NOW() - INTERVAL '15 minutes'
         AND (
           (check_in >= $2 AND check_in < $3)
           OR (check_out > $2 AND check_out <= $3)
           OR (check_in <= $2 AND check_out >= $3)
           OR (check_in >= $2 AND check_out <= $3)
         )
       ORDER BY created_at DESC
       LIMIT 1`,
      [itemId, checkIn, checkOut],
    );
    if (recentPending.rows.length > 0) {
      return {
        blocked: true,
        bookingId: recentPending.rows[0].id,
        reason: 'Período temporariamente bloqueado por reserva em processo',
      };
    }
    return { blocked: false };
  } catch {
    // Fail-closed inside atomic path (stricter than public isPeriodBlocked fail-open)
    return {
      blocked: true,
      reason: 'Não foi possível verificar bloqueio temporário',
    };
  }
}
