/**
 * PR-03 — GET /api/bookings handler with injectable deps (testable without jest.mock db).
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authorizeBookingLookup,
  filterBookingsForCaller,
  parseBookingLookupParams,
  type BookingLookupUser,
} from '@/lib/bookings-access';

export type QueryDatabaseFn = (
  sql: string,
  params?: unknown[],
) => Promise<Record<string, unknown>[]>;

export type GetAuthUserFn = (
  request: NextRequest,
) => Promise<BookingLookupUser | null>;

const SELECT_WITH_PAYMENT = `SELECT 
          b.*,
          p.id as payment_id,
          p.gateway_transaction_id,
          p.pix_qr_code,
          p.pix_expires_at
        FROM bookings b
        LEFT JOIN payments p ON p.booking_id = b.id`;

function formatBooking(booking: Record<string, unknown>) {
  return {
    id: booking.id,
    booking_code: booking.booking_code,
    booking_type: booking.booking_type,
    item_id: booking.item_id,
    item_name: booking.item_name,
    check_in: booking.check_in,
    check_out: booking.check_out,
    adults: booking.adults,
    children: booking.children,
    infants: booking.infants,
    total_guests: booking.total_guests,
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    customer_phone: booking.customer_phone,
    subtotal: parseFloat(String(booking.subtotal ?? 0)),
    discount: parseFloat(String(booking.discount ?? 0)),
    taxes: parseFloat(String(booking.taxes ?? 0)),
    service_fee: parseFloat(String(booking.service_fee ?? 0)),
    total: parseFloat(String(booking.total ?? 0)),
    payment_method: booking.payment_method,
    payment_status: booking.payment_status,
    status: booking.status,
    special_requests: booking.special_requests,
    created_at: booking.created_at,
    confirmed_at: booking.confirmed_at,
    payment_info: booking.pix_qr_code
      ? {
          qr_code: booking.pix_qr_code,
          expires_at: booking.pix_expires_at,
        }
      : null,
  };
}

export async function handleGetBookings(
  request: NextRequest,
  deps: {
    queryDatabase: QueryDatabaseFn;
    getAuthUser: GetAuthUserFn;
  },
): Promise<NextResponse> {
  try {
    const parsed = parseBookingLookupParams(request.nextUrl.searchParams);
    if (!parsed.ok) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status },
      );
    }

    const user = await deps.getAuthUser(request);
    const authz = authorizeBookingLookup({ user, lookup: parsed.lookup });
    if (!authz.ok) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma reserva encontrada' },
        { status: authz.status },
      );
    }

    const { lookup } = parsed;
    let bookings: Record<string, unknown>[];

    if (lookup.mode === 'id') {
      bookings = await deps.queryDatabase(
        `${SELECT_WITH_PAYMENT}
        WHERE b.id = $1
        ORDER BY b.created_at DESC`,
        [parseInt(lookup.value, 10)],
      );
    } else if (lookup.mode === 'code') {
      bookings = await deps.queryDatabase(
        `${SELECT_WITH_PAYMENT}
        WHERE b.booking_code = $1
        ORDER BY b.created_at DESC`,
        [lookup.value],
      );
    } else {
      bookings = await deps.queryDatabase(
        `${SELECT_WITH_PAYMENT}
        WHERE b.customer_email = $1
        ORDER BY b.created_at DESC
        LIMIT 50`,
        [lookup.value],
      );
    }

    const owned = filterBookingsForCaller(bookings, user);
    if (owned.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma reserva encontrada' },
        { status: 404 },
      );
    }

    const formattedBookings = owned.map(formatBooking);
    const single =
      lookup.mode === 'id' || lookup.mode === 'code'
        ? formattedBookings[0]
        : formattedBookings;

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      data: single,
      count: formattedBookings.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar reservas';
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
