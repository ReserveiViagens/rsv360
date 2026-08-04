import { tryCreateDpopProof } from '@rsv360/shared';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002').replace(/\/$/, '');

function getBrowserStorage(key: string, fallback = '') {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) || fallback;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const propertyId = getBrowserStorage('propertyId', '1');
  const enterpriseId = getBrowserStorage('rsv360_enterprise_id', 'ent_1');
  const token =
    getBrowserStorage('rsv360_access_token', '') || getBrowserStorage('token', '');

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-Property-Id', propertyId);
  headers.set('X-Enterprise-Id', enterpriseId);

  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE}${path}`;
  const proof = await tryCreateDpopProof({
    method,
    url,
    accessToken: token || undefined,
  });
  if (proof) headers.set('DPoP', proof);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    const message =
      (typeof error.error === 'string' && error.error) ||
      (typeof error.message === 'string' && error.message) ||
      `API error ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, data: unknown) => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) => apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string, options: RequestInit = {}) => apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
