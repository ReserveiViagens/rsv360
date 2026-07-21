/**
 * PR-03 — BOLA/IDOR on GET /api/bookings (all lookup modes).
 * No jest.mock('@/lib/db') — injectable deps.
 */

import { describe, it, expect, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import {
  authorizeBookingLookup,
  isHighEntropyBookingCode,
  parseBookingLookupParams,
} from '@/lib/bookings-access';
import { handleGetBookings } from '@/lib/bookings-get-handler';

const bookingA = {
  id: 101,
  booking_code: 'RSV-20260720-123456-7890',
  booking_type: 'hotel',
  item_id: 1,
  item_name: 'Hotel A',
  check_in: '2026-08-01',
  check_out: '2026-08-05',
  adults: 2,
  children: 0,
  infants: 0,
  total_guests: 2,
  customer_name: 'Alice',
  customer_email: 'alice@example.com',
  customer_phone: '62999990001',
  subtotal: '1000',
  discount: '0',
  taxes: '0',
  service_fee: '0',
  total: '1000',
  payment_method: 'pix',
  payment_status: 'pending',
  status: 'confirmed',
  special_requests: null,
  created_at: '2026-07-01',
  confirmed_at: '2026-07-01',
  pix_qr_code: 'PIX-SECRET-A',
  pix_expires_at: '2026-07-02',
};

const bookingB = {
  ...bookingA,
  id: 202,
  booking_code: 'RSV-20260720-654321-4321',
  customer_name: 'Bob',
  customer_email: 'bob@example.com',
  customer_phone: '62999990002',
  pix_qr_code: 'PIX-SECRET-B',
};

const HIGH_ENTROPY_CODE =
  'tok_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

function req(url: string, auth?: { email: string; role: string }) {
  const headers = new Headers();
  if (auth) {
    headers.set('authorization', 'Bearer test-token');
  }
  return new NextRequest(url, { headers });
}

describe('bookings-access — classificação de code', () => {
  it('RSV-YYYYMMDD-######-#### é adivinhável (não token público)', () => {
    expect(isHighEntropyBookingCode('RSV-20260720-123456-7890')).toBe(false);
  });

  it('código curto / RSV-Date.now() é adivinhável', () => {
    expect(isHighEntropyBookingCode('RSV-1720000000000')).toBe(false);
  });

  it('UUID/token longo seriam "alta entropia" no classificador — mas NÃO abrem anônimo', () => {
    expect(
      isHighEntropyBookingCode('550e8400-e29b-41d4-a716-446655440000'),
    ).toBe(true);
    expect(isHighEntropyBookingCode(HIGH_ENTROPY_CODE)).toBe(true);
    // authorize still denies anonymous regardless of entropy
    expect(
      authorizeBookingLookup({
        user: null,
        lookup: { mode: 'code', value: HIGH_ENTROPY_CODE },
      }),
    ).toEqual({ ok: false, status: 404 });
  });
});

describe('bookings-access — parse + pollution', () => {
  it('rejeita parâmetro duplicado (pollution)', () => {
    const sp = new URLSearchParams();
    sp.append('id', '1');
    sp.append('id', '2');
    const r = parseBookingLookupParams(sp);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('rejeita multi-modo (id+email)', () => {
    const sp = new URLSearchParams({ id: '1', email: 'a@b.com' });
    const r = parseBookingLookupParams(sp);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('rejeita id não numérico', () => {
    const r = parseBookingLookupParams(new URLSearchParams({ id: '1;drop' }));
    expect(r.ok).toBe(false);
  });

  it('aceita booking_id como modo id', () => {
    const r = parseBookingLookupParams(
      new URLSearchParams({ booking_id: '42' }),
    );
    expect(r).toEqual({ ok: true, lookup: { mode: 'id', value: '42' } });
  });
});

describe('bookings-access — authorize pré-DB', () => {
  it('anônimo: id/email/code (fraco ou alta entropia) → 404', () => {
    expect(
      authorizeBookingLookup({
        user: null,
        lookup: { mode: 'id', value: '1' },
      }),
    ).toEqual({ ok: false, status: 404 });
    expect(
      authorizeBookingLookup({
        user: null,
        lookup: { mode: 'email', value: 'alice@example.com' },
      }),
    ).toEqual({ ok: false, status: 404 });
    expect(
      authorizeBookingLookup({
        user: null,
        lookup: { mode: 'code', value: 'RSV-20260720-123456-7890' },
      }),
    ).toEqual({ ok: false, status: 404 });
    expect(
      authorizeBookingLookup({
        user: null,
        lookup: { mode: 'code', value: HIGH_ENTROPY_CODE },
      }),
    ).toEqual({ ok: false, status: 404 });
  });

  it('customer A não consulta email de B', () => {
    expect(
      authorizeBookingLookup({
        user: { email: 'alice@example.com', role: 'customer' },
        lookup: { mode: 'email', value: 'bob@example.com' },
      }),
    ).toEqual({ ok: false, status: 404 });
  });

  it('staff pode qualquer modo', () => {
    expect(
      authorizeBookingLookup({
        user: { email: 'admin@example.com', role: 'admin' },
        lookup: { mode: 'email', value: 'bob@example.com' },
      }),
    ).toEqual({ ok: true });
  });
});

describe('handleGetBookings — asserts A→B + anônimo + positivo', () => {
  it('A→B: customer A com ?id= da reserva de B → 404 (sem vazar)', async () => {
    const queryDatabase = jest.fn(async () => [bookingB]);
    const res = await handleGetBookings(
      req('http://localhost/api/bookings?id=202'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => ({
          email: 'alice@example.com',
          role: 'customer',
        }),
      },
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(JSON.stringify(body)).not.toContain('PIX-SECRET-B');
    expect(JSON.stringify(body)).not.toContain('bob@example.com');
  });

  it('anônimo ?id= → 404 sem hit no DB', async () => {
    const queryDatabase = jest.fn(async () => [bookingA]);
    const res = await handleGetBookings(
      req('http://localhost/api/bookings?id=101'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => null,
      },
    );
    expect(res.status).toBe(404);
    expect(queryDatabase).not.toHaveBeenCalled();
  });

  it('anônimo ?email= → 404 sem hit no DB', async () => {
    const queryDatabase = jest.fn(async () => [bookingA]);
    const res = await handleGetBookings(
      req('http://localhost/api/bookings?email=alice@example.com'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => null,
      },
    );
    expect(res.status).toBe(404);
    expect(queryDatabase).not.toHaveBeenCalled();
  });

  it('anônimo ?code= RSV fraco → 404 sem hit no DB (sem PII/PIX)', async () => {
    const queryDatabase = jest.fn(async () => [bookingA]);
    const res = await handleGetBookings(
      req(
        'http://localhost/api/bookings?code=RSV-20260720-123456-7890',
      ),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => null,
      },
    );
    expect(res.status).toBe(404);
    expect(queryDatabase).not.toHaveBeenCalled();
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain('PIX-SECRET-A');
    expect(JSON.stringify(body)).not.toContain('alice@example.com');
  });

  it('anônimo ?booking_id= → 404', async () => {
    const queryDatabase = jest.fn(async () => [bookingA]);
    const res = await handleGetBookings(
      req('http://localhost/api/bookings?booking_id=101'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => null,
      },
    );
    expect(res.status).toBe(404);
    expect(queryDatabase).not.toHaveBeenCalled();
  });

  it('pollution ?id=1&id=2 → 400', async () => {
    const queryDatabase = jest.fn(async () => []);
    const res = await handleGetBookings(
      req('http://localhost/api/bookings?id=1&id=2'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => null,
      },
    );
    expect(res.status).toBe(400);
    expect(queryDatabase).not.toHaveBeenCalled();
  });

  it('positivo: owner autenticado ?id= própria → 200', async () => {
    const queryDatabase = jest.fn(async () => [bookingA]);
    const res = await handleGetBookings(
      req('http://localhost/api/bookings?id=101'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => ({
          email: 'alice@example.com',
          role: 'customer',
        }),
      },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(101);
  });

  it('negativo: anônimo ?code= alta entropia → 404 (modo code nunca público)', async () => {
    const queryDatabase = jest.fn(async () => [
      { ...bookingA, booking_code: HIGH_ENTROPY_CODE },
    ]);
    const res = await handleGetBookings(
      req(`http://localhost/api/bookings?code=${HIGH_ENTROPY_CODE}`),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => null,
      },
    );
    expect(res.status).toBe(404);
    expect(queryDatabase).not.toHaveBeenCalled();
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain('PIX-SECRET-A');
  });

  it('positivo: staff ?email= alheio → 200', async () => {
    const queryDatabase = jest.fn(async () => [bookingB]);
    const res = await handleGetBookings(
      req('http://localhost/api/bookings?email=bob@example.com'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => ({
          email: 'admin@example.com',
          role: 'admin',
        }),
      },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
  });

  it('owner autenticado com code fraco da própria reserva → 200', async () => {
    const queryDatabase = jest.fn(async () => [bookingA]);
    const res = await handleGetBookings(
      req(
        'http://localhost/api/bookings?code=RSV-20260720-123456-7890',
      ),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => ({
          email: 'alice@example.com',
          role: 'customer',
        }),
      },
    );
    expect(res.status).toBe(200);
  });

  it('A→B: customer A com code fraco da reserva de B → 404', async () => {
    const queryDatabase = jest.fn(async () => [bookingB]);
    const res = await handleGetBookings(
      req(
        'http://localhost/api/bookings?code=RSV-20260720-654321-4321',
      ),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => ({
          email: 'alice@example.com',
          role: 'customer',
        }),
      },
    );
    expect(res.status).toBe(404);
  });
});
