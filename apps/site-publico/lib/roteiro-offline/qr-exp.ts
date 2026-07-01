/** Expiração do QR no cache (alinhado ao backend: check-out + 24h). */
export function calcQrCacheExpMs(checkOut?: string | null): number {
  if (checkOut && /^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return new Date(`${checkOut}T23:59:59.000Z`).getTime() + 24 * 60 * 60 * 1000;
  }
  return Date.now() + 90 * 24 * 60 * 60 * 1000;
}

export function isQrCacheExpired(expMs: number, now = Date.now()): boolean {
  return now > expMs;
}

export function buildQrImageUrl(token: string, voucherSlug: string, checkOut?: string | null): string {
  const exp = calcQrCacheExpMs(checkOut);
  return `/api/propostas/${encodeURIComponent(token)}/vouchers/${encodeURIComponent(voucherSlug)}/qr.png?exp=${exp}`;
}
