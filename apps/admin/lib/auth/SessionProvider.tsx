'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  type AuthSessionResponse,
  type SessionUser,
  type TenantSession,
  parseAuthSessionResponse,
  toTenantSession,
} from '@rsv360/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface SessionContextValue {
  user: SessionUser | null;
  session: TenantSession | null;
  loading: boolean;
  authenticated: boolean;
  refreshSession: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function clearLegacyRefreshFromStorage() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
}

async function fetchSession(token: string): Promise<AuthSessionResponse> {
  const response = await fetch(`${API_BASE}/api/v1/auth/session`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });

  if (response.status === 401) {
    return { authenticated: false, error: 'Não autenticado' };
  }

  if (!response.ok) {
    throw new Error(`Falha ao carregar sessão (${response.status})`);
  }

  return response.json() as Promise<AuthSessionResponse>;
}

/**
 * PR-10c-pré-b — refresh via HttpOnly cookie (Path=/api/v1/auth).
 * Body legado only while localStorage still holds a refresh (migration).
 */
async function tryRefreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const legacyRefresh = window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

  const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: legacyRefresh
      ? JSON.stringify({ refresh_token: legacyRefresh })
      : JSON.stringify({}),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { access_token?: string };
  };

  if (!payload.success || !payload.data?.access_token) return null;

  window.localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, payload.data.access_token);
  clearLegacyRefreshFromStorage();
  return payload.data.access_token;
}

export interface SessionProviderProps {
  children: ReactNode;
  initialToken?: string | null;
}

export function SessionProvider({ children, initialToken = null }: SessionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<TenantSession | null>(null);
  const [loading, setLoading] = useState(true);

  const setAccessToken = useCallback((token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      window.localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
      clearLegacyRefreshFromStorage();
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let token =
      initialToken ?? window.localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);

    if (!token) {
      token = await tryRefreshAccessToken();
    }

    if (!token) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let body = await fetchSession(token);
      if (!body.authenticated) {
        const refreshed = await tryRefreshAccessToken();
        if (refreshed) {
          token = refreshed;
          body = await fetchSession(token);
        }
      }
      const parsed = parseAuthSessionResponse(body);
      setUser(parsed.user);
      setSession(parsed.session);
      if (parsed.user) {
        setAccessToken(token);
      }
    } catch {
      setUser(null);
      setSession(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, [initialToken, setAccessToken]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      session,
      loading,
      authenticated: Boolean(user),
      refreshSession,
      setAccessToken,
    }),
    [user, session, loading, refreshSession, setAccessToken]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}

export { toTenantSession };
