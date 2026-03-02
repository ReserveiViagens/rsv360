/**
 * ✅ ITEM 24: INTERCEPTOR DE AUTENTICAÇÃO - FRONTEND
 * Renovação automática de tokens e interceptação de requests
 */

// Armazenamento de tokens (pode ser localStorage, sessionStorage, ou cookies)
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

/**
 * Configurar tokens
 */
export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  
  // Salvar no localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

/**
 * Obter tokens
 */
export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
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
  }
}

/**
 * Renovar access token usando refresh token
 */
async function refreshAccessToken(): Promise<string> {
  // Evitar múltiplas chamadas simultâneas
  if (refreshPromise) {
    return refreshPromise;
  }

  const { refreshToken: currentRefreshToken } = getTokens();

  if (!currentRefreshToken) {
    throw new Error('Refresh token não disponível');
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
      });

      const result = await response.json();

      if (!result.success) {
        // Refresh token inválido - fazer logout
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Refresh token inválido');
      }

      // Atualizar tokens
      setTokens(result.data.access_token, result.data.refresh_token);
      return result.data.access_token;
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
  options: RequestInit = {}
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

