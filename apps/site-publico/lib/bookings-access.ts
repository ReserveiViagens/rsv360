/**
 * PR-03 — Booking lookup authorization (BOLA/IDOR).
 * Classificação de booking_code: formato RSV-YYYYMMDD-######-#### e códigos curtos
 * são adivinháveis → NÃO são token público. Token público = alta entropia (≥24 chars,
 * sem prefixo de data previsível) ou UUID.
 */

export type BookingLookupMode = 'id' | 'email' | 'code';

export type BookingLookup =
  | { mode: 'id'; value: string }
  | { mode: 'email'; value: string }
  | { mode: 'code'; value: string };

export type BookingLookupUser = {
  email: string;
  role: string;
};

const STAFF_ROLES = new Set(['admin', 'manager']);

/** Known weak pattern from POST /api/bookings code generator. */
const WEAK_RSV_CODE = /^RSV-\d{8}-\d{6}-\d{4}$/i;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * True when code is suitable as an unauthenticated capability token.
 * Current RSV-* generator codes return false (guessable).
 */
export function isHighEntropyBookingCode(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed || trimmed.length < 24) return false;
  if (WEAK_RSV_CODE.test(trimmed)) return false;
  if (UUID_RE.test(trimmed)) return true;
  // Long opaque token (no predictable RSV-date shape)
  if (/^RSV-/i.test(trimmed) && trimmed.length < 40) return false;
  return /^[A-Za-z0-9_-]{24,}$/.test(trimmed);
}

function hasParamPollution(searchParams: URLSearchParams, key: string): boolean {
  return searchParams.getAll(key).length > 1;
}

/**
 * Parse a single scalar lookup mode. Rejects pollution and multi-mode ambiguity.
 */
export function parseBookingLookupParams(
  searchParams: URLSearchParams,
):
  | { ok: true; lookup: BookingLookup }
  | { ok: false; status: 400; error: string } {
  for (const key of ['id', 'booking_id', 'email', 'code'] as const) {
    if (hasParamPollution(searchParams, key)) {
      return {
        ok: false,
        status: 400,
        error: 'Parâmetro duplicado não permitido',
      };
    }
  }

  const id = searchParams.get('id');
  const bookingId = searchParams.get('booking_id');
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  const present = [id, bookingId, email, code].filter(
    (v) => v != null && String(v).trim() !== '',
  );
  if (present.length === 0) {
    return {
      ok: false,
      status: 400,
      error: 'É necessário fornecer email, código, booking_id ou id da reserva',
    };
  }
  if (present.length > 1) {
    return {
      ok: false,
      status: 400,
      error: 'Informe apenas um modo de busca (id, booking_id, email ou code)',
    };
  }

  if (id != null && String(id).trim() !== '') {
    if (Array.isArray(id as unknown) || typeof id === 'object') {
      return { ok: false, status: 400, error: 'id inválido' };
    }
    const raw = String(id).trim();
    if (!/^\d+$/.test(raw)) {
      return { ok: false, status: 400, error: 'id inválido' };
    }
    return { ok: true, lookup: { mode: 'id', value: raw } };
  }

  if (bookingId != null && String(bookingId).trim() !== '') {
    const raw = String(bookingId).trim();
    if (!/^\d+$/.test(raw)) {
      return { ok: false, status: 400, error: 'booking_id inválido' };
    }
    return { ok: true, lookup: { mode: 'id', value: raw } };
  }

  if (code != null && String(code).trim() !== '') {
    return { ok: true, lookup: { mode: 'code', value: String(code).trim() } };
  }

  if (email != null && String(email).trim() !== '') {
    return { ok: true, lookup: { mode: 'email', value: String(email).trim() } };
  }

  return {
    ok: false,
    status: 400,
    error: 'É necessário fornecer email, código, booking_id ou id da reserva',
  };
}

/**
 * Gate before DB: anonymous cannot use id/email; weak code requires auth;
 * high-entropy code may proceed unauthenticated.
 */
export function authorizeBookingLookup(opts: {
  user: BookingLookupUser | null;
  lookup: BookingLookup;
}): { ok: true } | { ok: false; status: 401 | 404 } {
  const { user, lookup } = opts;
  const isStaff = Boolean(user && STAFF_ROLES.has(user.role));

  if (isStaff) return { ok: true };

  if (lookup.mode === 'email') {
    if (!user) return { ok: false, status: 404 };
    if (user.email.toLowerCase() !== lookup.value.toLowerCase()) {
      return { ok: false, status: 404 };
    }
    return { ok: true };
  }

  if (lookup.mode === 'id') {
    // Sequential ID — never anonymous; ownership checked after fetch
    if (!user) return { ok: false, status: 404 };
    return { ok: true };
  }

  // code
  if (isHighEntropyBookingCode(lookup.value)) {
    return { ok: true };
  }
  // Guessable RSV-* (and short codes): require session; ownership after fetch
  if (!user) return { ok: false, status: 404 };
  return { ok: true };
}

/** After fetch: non-staff must own the booking (customer_email). */
export function filterBookingsForCaller<
  T extends { customer_email?: string | null },
>(bookings: T[], user: BookingLookupUser | null): T[] {
  if (!user) {
    // Only high-entropy public code path reaches here without user
    return bookings;
  }
  if (STAFF_ROLES.has(user.role)) return bookings;
  const email = user.email.toLowerCase();
  return bookings.filter(
    (b) => (b.customer_email || '').toLowerCase() === email,
  );
}
