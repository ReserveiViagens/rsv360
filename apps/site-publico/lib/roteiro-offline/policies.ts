/** Políticas de cache offline — espelhadas em public/roteiro/sw.js (runtime). */

import { buildQrImageUrl } from './qr-exp';

export const ROTEIRO_SW_PATH = '/roteiro/sw.js';
export const ROTEIRO_SW_SCOPE = '/roteiro/';

export const BLOCKED_API_PATH_PATTERNS = [
  /\/api\/cotacao\/gerar-proposta/,
  /turnstile/i,
];

export const ALLOWED_OFFLINE_API_GET: RegExp[] = [
  /^\/api\/cotacao\/roteiro\/[^/]+$/,
  /^\/api\/cotacao\/proposta\/[^/]+\/validade$/,
  /^\/api\/propostas\/[^/]+\/vouchers\/[^/]+\/qr\.png$/,
];

export function isBlockedOfflineApiPath(pathname: string): boolean {
  return BLOCKED_API_PATH_PATTERNS.some((re) => re.test(pathname));
}

export function isAllowedOfflineApiGet(pathname: string): boolean {
  return ALLOWED_OFFLINE_API_GET.some((re) => re.test(pathname));
}

export function buildRoteiroPrecacheUrls(token: string, checkOut?: string | null): string[] {
  const encoded = encodeURIComponent(token);
  return [
    `/api/cotacao/roteiro/${encoded}`,
    `/api/cotacao/proposta/${encoded}/validade`,
    buildQrImageUrl(token, 'hotel', checkOut),
    buildQrImageUrl(token, 'ingressos', checkOut),
    buildQrImageUrl(token, 'checkin', checkOut),
  ];
}

export const PRECACHE_STORAGE_KEY = (token: string) => `roteiro-precache-v1:${token}`;
export const LAST_UPDATED_STORAGE_KEY = (token: string) => `roteiro-last-updated-v1:${token}`;
