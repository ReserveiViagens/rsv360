/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { clearPortalSession, getPortalToken } from './portal-session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export class PortalApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'PortalApiError';
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = RequestInit & {
  allow404?: boolean;
  token?: string | null;
  skipAuthRedirect?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? (typeof window !== 'undefined' ? getPortalToken() : null);
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer portal_${token}`, 'X-Portal-Token': token } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && typeof window !== 'undefined' && !options.skipAuthRedirect) {
    clearPortalSession();
    window.location.href = '/login';
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    if (response.status === 404 && options.allow404) {
      return payload as T;
    }

    throw new PortalApiError(
      (payload as { error?: string; message?: string } | null)?.error ||
        (payload as { error?: string; message?: string } | null)?.message ||
        response.statusText ||
        'Erro na API',
      response.status,
      payload,
    );
  }

  return parseResponse<T>(response);
}

export const api = {
  get: <T>(path: string, options: RequestOptions = {}) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data?: unknown, options: RequestOptions = {}) =>
    apiFetch<T>(path, { ...options, method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown, options: RequestOptions = {}) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body: data === undefined ? undefined : JSON.stringify(data) }),
  delete: <T>(path: string, options: RequestOptions = {}) => apiFetch<T>(path, { ...options, method: 'DELETE' }),
};

export async function safeApiGet<T>(path: string, fallback: T, token?: string | null): Promise<T> {
  try {
    return await api.get<T>(path, { token, allow404: true, skipAuthRedirect: true });
  } catch (error) {
    if (error instanceof PortalApiError && error.status === 404) {
      return fallback;
    }

    return fallback;
  }
}
