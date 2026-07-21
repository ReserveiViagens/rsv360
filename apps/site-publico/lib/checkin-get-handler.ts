/**
 * PR-03b — GET/POST /api/checkin with injectable deps.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authorizeCheckinLookup,
  filterCheckinsForCaller,
  isCheckinStaff,
  parseCheckinLookupParams,
  type CheckinAuthUser,
} from '@/lib/checkin-access';

export type QueryFn = (sql: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
export type GetAuthUserFn = (request: NextRequest) => Promise<CheckinAuthUser | null>;

export async function handleGetCheckins(
  request: NextRequest,
  deps: { queryDatabase: QueryFn; getAuthUser: GetAuthUserFn },
): Promise<NextResponse> {
  try {
    const parsed = parseCheckinLookupParams(request.nextUrl.searchParams);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    const user = await deps.getAuthUser(request);
    const authz = authorizeCheckinLookup(user);
    if (!authz.ok || !user) {
      return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
    }

    let query = `SELECT c.*, b.customer_email
      FROM checkins c
      LEFT JOIN bookings b ON b.id = c.booking_id
      WHERE 1=1`;
    const params: unknown[] = [];
    let i = 1;

    if (parsed.bookingId != null) {
      query += ` AND c.booking_id = $${i++}`;
      params.push(parsed.bookingId);
    } else if (parsed.propertyId != null) {
      query += ` AND c.property_id = $${i++}`;
      params.push(parsed.propertyId);
    } else if (parsed.userId != null) {
      // Non-staff may only query own user_id
      if (!isCheckinStaff(user) && parsed.userId !== user.id) {
        return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
      }
      query += ` AND c.user_id = $${i++}`;
      params.push(parsed.userId);
    }

    query += ' ORDER BY c.created_at DESC LIMIT 50';
    const rows = await deps.queryDatabase(query, params);
    const owned = filterCheckinsForCaller(rows, user);
    if (owned.length === 0) {
      return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      checkins: owned.map(({ customer_email: _e, ...rest }) => rest),
    });
  } catch (error) {
    console.error('Erro ao buscar check-ins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function handlePostCheckin(
  request: NextRequest,
  deps: { queryDatabase: QueryFn; getAuthUser: GetAuthUserFn },
): Promise<NextResponse> {
  try {
    const user = await deps.getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const bookingId = Number(body.booking_id);
    const propertyId = Number(body.property_id);
    if (!Number.isFinite(bookingId) || !Number.isFinite(propertyId)) {
      return NextResponse.json({ error: 'booking_id e property_id obrigatórios' }, { status: 400 });
    }

    if (!isCheckinStaff(user)) {
      const bookings = await deps.queryDatabase(
        `SELECT id, customer_email, user_id FROM bookings WHERE id = $1 LIMIT 1`,
        [bookingId],
      );
      const b = bookings[0];
      if (!b) {
        return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
      }
      const owns =
        Number(b.user_id) === user.id ||
        String(b.customer_email || '').toLowerCase() === user.email.toLowerCase();
      if (!owns) {
        return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
      }
    }

    const existing = await deps.queryDatabase(
      `SELECT id FROM checkins WHERE booking_id = $1 LIMIT 1`,
      [bookingId],
    );

    let checkinId: number;
    if (existing.length > 0) {
      const updated = await deps.queryDatabase(
        `UPDATE checkins
         SET scheduled_checkin_date = $1,
             scheduled_checkin_time = $2,
             status = 'in_progress',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id`,
        [body.scheduled_checkin_date, body.scheduled_checkin_time, existing[0].id],
      );
      checkinId = Number(updated[0].id);
    } else {
      const inserted = await deps.queryDatabase(
        `INSERT INTO checkins (
          booking_id, property_id, user_id,
          scheduled_checkin_date, scheduled_checkin_time, status
        ) VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING id`,
        [
          bookingId,
          propertyId,
          user.id,
          body.scheduled_checkin_date,
          body.scheduled_checkin_time,
        ],
      );
      checkinId = Number(inserted[0].id);
    }

    return NextResponse.json({ checkin_id: checkinId, status: 'created' });
  } catch (error) {
    console.error('Erro ao criar check-in:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
