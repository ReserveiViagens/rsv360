/**
 * ✅ ITEM 24: INTERCEPTOR DE AUTENTICAÇÃO - FRONTEND
 * Renovação automática de tokens e interceptação de requests
 * PR-10c-pré-a — refresh via HttpOnly cookie (BFF); limpa refresh legado do localStorage.
 */

import {
  formatBrowserSessionCookie,
  formatClearedBrowserSessionCookie,
} from '@rsv360/shared';

// Armazenamento de tokens (pode ser localStorage, sessionStorage, ou cookies)
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

function clearLegacyRefreshFromStorage() {
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refresh_token');
  }
}

/**
 * Configurar access token (refresh vive em HttpOnly cookie via BFF).
 * `refresh` arg kept for call-site compat — never persisted to localStorage.
 */
export function setTokens(access: string, _refresh?: string) {
  accessToken = access;
  refreshToken = null;

  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('auth_token', access);
    localStorage.removeItem('refresh_token');
    document.cookie = formatBrowserSessionCookie('auth_token', access);
  }
}

/**
 * Obter tokens
 */
export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
    // Legacy only — used once to migrate sessions before cookie exists.
    refreshToken = localStorage.getItem('refresh_token');
  }
  return { accessToken, refreshToken };
}

/**
 * Limpar tokens
 */
export function clearTokens() {
  accessToken = null;
  refreshToken = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_token');
    document.cookie = formatClearedBrowserSessionCookie('auth_token');
  }
}

/**
 * Renovar access token usando HttpOnly refresh cookie (BFF).
 * Body legado só se ainda houver refresh no localStorage (migração).
 */
async function refreshAccessToken(): Promise<string> {
  // Evitar múltiplas chamadas simultâneas
  if (refreshPromise) {
    return refreshPromise;
  }

  const { refreshToken: legacyRefresh } = getTokens();

  refreshPromise = (async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const init: RequestInit = {
        method: 'POST',
        headers,
        credentials: 'include',
        body: legacyRefresh
          ? JSON.stringify({ refresh_token: legacyRefresh })
          : JSON.stringify({}),
      };

      const response = await fetch('/api/auth/refresh', init);
      const result = await response.json();

      if (!result.success) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Refresh token inválido');
      }

      const access = result.data?.access_token as string | undefined;
      if (!access) {
        clearTokens();
        throw new Error('Access token ausente no refresh');
      }

      setTokens(access);
      clearLegacyRefreshFromStorage();
      return access;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Interceptor de fetch para adicionar token e renovar automaticamente
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const { accessToken } = getTokens();
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const currentAccessToken = accessToken || authToken;

  // Adicionar token ao header
  const headers = new Headers(options.headers);
  if (currentAccessToken) {
    headers.set('Authorization', `Bearer ${currentAccessToken}`);
  }

  // Fazer requisição
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials ?? 'include',
  });

  // Se token expirou (401), tentar renovar
  if (response.status === 401 && currentAccessToken) {
    try {
      const newAccessToken = await refreshAccessToken();

      // Retentar requisição com novo token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials ?? 'include',
      });
    } catch (error) {
      // Falha ao renovar - fazer logout
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw error;
    }
  }

  return response;
}

/**
 * Hook para usar em componentes React
 */
export function useAuthInterceptor() {
  if (typeof window === 'undefined') {
    return { authenticatedFetch, setTokens, clearTokens, getTokens };
  }

  // Inicializar tokens do localStorage
  getTokens();

  return {
    authenticatedFetch,
    setTokens,
    clearTokens,
    getTokens,
  };
}
