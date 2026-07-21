/**
 * PR-03b — check-in lookup authz (injectable handler).
 */

import { describe, it, expect, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import {
  authorizeCheckinLookup,
  parseCheckinLookupParams,
} from '@/lib/checkin-access';
import { handleGetCheckins, handlePostCheckin } from '@/lib/checkin-get-handler';

describe('checkin-access parse', () => {
  it('pollution → 400', () => {
    const sp = new URLSearchParams();
    sp.append('booking_id', '1');
    sp.append('booking_id', '2');
    const r = parseCheckinLookupParams(sp);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('multi-mode → 400', () => {
    const r = parseCheckinLookupParams(
      new URLSearchParams({ booking_id: '1', user_id: '2' }),
    );
    expect(r.ok).toBe(false);
  });

  it('anon authorize → 404', () => {
    expect(authorizeCheckinLookup(null)).toEqual({ ok: false, status: 404 });
  });
});

describe('handleGetCheckins', () => {
  it('anônimo ?booking_id= → 404 sem DB', async () => {
    const queryDatabase = jest.fn(async () => []);
    const res = await handleGetCheckins(
      new NextRequest('http://localhost/api/checkin?booking_id=99'),
      { queryDatabase: queryDatabase as never, getAuthUser: async () => null },
    );
    expect(res.status).toBe(404);
    expect(queryDatabase).not.toHaveBeenCalled();
  });

  it('A→B: customer A não lê check-in de B', async () => {
    const queryDatabase = jest.fn(async () => [
      {
        id: 1,
        booking_id: 99,
        user_id: 2,
        customer_email: 'bob@example.com',
        status: 'pending',
      },
    ]);
    const res = await handleGetCheckins(
      new NextRequest('http://localhost/api/checkin?booking_id=99'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => ({
          id: 1,
          email: 'alice@example.com',
          role: 'customer',
        }),
      },
    );
    expect(res.status).toBe(404);
  });

  it('staff ?booking_id= → 200', async () => {
    const queryDatabase = jest.fn(async () => [
      {
        id: 1,
        booking_id: 99,
        user_id: 2,
        customer_email: 'bob@example.com',
        status: 'pending',
      },
    ]);
    const res = await handleGetCheckins(
      new NextRequest('http://localhost/api/checkin?booking_id=99'),
      {
        queryDatabase: queryDatabase as never,
        getAuthUser: async () => ({
          id: 9,
          email: 'admin@example.com',
          role: 'admin',
        }),
      },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.checkins).toHaveLength(1);
  });
});

describe('handlePostCheckin', () => {
  it('anônimo POST → 404', async () => {
    const queryDatabase = jest.fn(async () => []);
    const res = await handlePostCheckin(
      new NextRequest('http://localhost/api/checkin', {
        method: 'POST',
        body: JSON.stringify({ booking_id: 1, property_id: 1 }),
        headers: { 'content-type': 'application/json' },
      }),
      { queryDatabase: queryDatabase as never, getAuthUser: async () => null },
    );
    expect(res.status).toBe(404);
    expect(queryDatabase).not.toHaveBeenCalled();
  });
});
