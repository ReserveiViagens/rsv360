/**
 * PR-03b — Check-in lookup authz (site-publico).
 * Anonymous query by booking_id / property_id / user_id is closed (same spirit as PR-03 bookings).
 */

export type CheckinAuthUser = {
  id: number;
  email: string;
  role: string;
};

const STAFF_ROLES = new Set(['admin', 'manager', 'staff']);

export function isCheckinStaff(user: CheckinAuthUser | null | undefined): boolean {
  return Boolean(user?.role && STAFF_ROLES.has(user.role));
}

export function parseCheckinLookupParams(searchParams: URLSearchParams):
  | { ok: true; bookingId?: number; propertyId?: number; userId?: number }
  | { ok: false; status: 400; error: string } {
  for (const key of ['booking_id', 'property_id', 'user_id'] as const) {
    if (searchParams.getAll(key).length > 1) {
      return { ok: false, status: 400, error: 'Parâmetro duplicado não permitido' };
    }
  }

  const bookingRaw = searchParams.get('booking_id');
  const propertyRaw = searchParams.get('property_id');
  const userRaw = searchParams.get('user_id');

  const present = [bookingRaw, propertyRaw, userRaw].filter(
    (v) => v != null && String(v).trim() !== '',
  );
  if (present.length === 0) {
    return {
      ok: false,
      status: 400,
      error: 'Informe booking_id, property_id ou user_id',
    };
  }
  if (present.length > 1) {
    return {
      ok: false,
      status: 400,
      error: 'Informe apenas um modo de busca',
    };
  }

  const parseId = (raw: string | null, label: string) => {
    if (raw == null || String(raw).trim() === '') return undefined;
    if (!/^\d+$/.test(String(raw).trim())) {
      return { error: `${label} inválido` as const };
    }
    return { value: parseInt(String(raw).trim(), 10) };
  };

  if (bookingRaw) {
    const p = parseId(bookingRaw, 'booking_id');
    if (p && 'error' in p) return { ok: false, status: 400, error: p.error };
    return { ok: true, bookingId: p!.value };
  }
  if (propertyRaw) {
    const p = parseId(propertyRaw, 'property_id');
    if (p && 'error' in p) return { ok: false, status: 400, error: p.error };
    return { ok: true, propertyId: p!.value };
  }
  const p = parseId(userRaw, 'user_id');
  if (p && 'error' in p) return { ok: false, status: 400, error: p.error };
  return { ok: true, userId: p!.value };
}

/** Pre-DB: never anonymous. */
export function authorizeCheckinLookup(user: CheckinAuthUser | null): {
  ok: true;
} | { ok: false; status: 404 } {
  if (!user) return { ok: false, status: 404 };
  return { ok: true };
}

export function filterCheckinsForCaller<
  T extends { user_id?: number | null; customer_email?: string | null },
>(rows: T[], user: CheckinAuthUser): T[] {
  if (isCheckinStaff(user)) return rows;
  return rows.filter(
    (r) =>
      r.user_id === user.id ||
      (r.customer_email || '').toLowerCase() === user.email.toLowerCase(),
  );
}
