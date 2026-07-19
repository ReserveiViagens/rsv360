/**
 * Shared env for RSV360 capacity baseline scripts (E5).
 * k6 is an external binary — not an npm dependency.
 *
 *   BASE_URL   default http://localhost:3002
 *   TOKEN      Bearer JWT (skips login when set)
 *   EMAIL / PASSWORD  used only when TOKEN is empty
 *   HOTEL_ID   default piazza-diroma (listagem /disponiveis)
 */

export function baseUrl() {
  return (__ENV.BASE_URL || 'http://localhost:3002').replace(/\/$/, '');
}

export function jsonHeaders(token) {
  const h = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function authHeaders(token) {
  const h = { Accept: 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Extract access_token from login JSON (DB or pilot shapes). */
export function extractAccessToken(body) {
  try {
    const data = JSON.parse(body);
    return (
      data?.data?.access_token ||
      data?.data?.accessToken ||
      data?.access_token ||
      data?.token ||
      null
    );
  } catch {
    return null;
  }
}

export function hotelId() {
  return __ENV.HOTEL_ID || 'piazza-diroma';
}

export function checkInOut() {
  const checkIn = __ENV.CHECK_IN || '2026-09-01';
  const checkOut = __ENV.CHECK_OUT || '2026-09-04';
  return { checkIn, checkOut };
}
