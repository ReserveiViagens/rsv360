'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AUTH_ACCESS_TOKEN_KEY,
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
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token =
      initialToken ?? window.localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);

    if (!token) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const body = await fetchSession(token);
      const parsed = parseAuthSessionResponse(body);
      setUser(parsed.user);
      setSession(parsed.session);
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
