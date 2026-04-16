/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, PortalApiError } from './api';
import { clearPortalSession, getPortalGuest, getPortalToken, setPortalSession } from './portal-session';
import type { AuthState, LoginRequest, LoginResponse, GuestProfile } from '@/types/auth';

type AuthContextValue = AuthState & {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  verify: (token: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function tryLoginEndpoint(data: LoginRequest): Promise<LoginResponse | null> {
  try {
    return await api.post<LoginResponse>('/api/guest-portal/auth/login', data, { skipAuthRedirect: true });
  } catch (error) {
    if (error instanceof PortalApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

async function tryVerifyEndpoint(token: string): Promise<LoginResponse | null> {
  try {
    return await api.post<LoginResponse>(
      '/api/guest-portal/auth/verify',
      { token },
      { token, skipAuthRedirect: true },
    );
  } catch (error) {
    if (error instanceof PortalApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function AuthProvider({ children, initialGuest }: { children: ReactNode; initialGuest?: GuestProfile | null }) {
  const [token, setToken] = useState<string | null>(null);
  const [guest, setGuest] = useState<GuestProfile | null>(initialGuest || null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const storedToken = getPortalToken();
    const storedGuest = getPortalGuest<GuestProfile>();

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedGuest) {
      setGuest(storedGuest);
    }
  }, []);

  const refreshSession = () => {
    const storedToken = getPortalToken();
    const storedGuest = getPortalGuest<GuestProfile>();
    setToken(storedToken);
    setGuest(storedGuest);
  };

  const login = async (data: LoginRequest) => {
    const loginResponse = await tryLoginEndpoint(data);
    const tokenCandidate = loginResponse?.token || data.reservationCode;
    const verifyResponse = await tryVerifyEndpoint(tokenCandidate);

    if (!loginResponse && !verifyResponse) {
      throw new Error('Não foi possível autenticar. Use o token enviado no link do portal.');
    }

    const nextToken = loginResponse?.token || verifyResponse?.token || tokenCandidate;
    const nextGuest =
      loginResponse?.guest ||
      verifyResponse?.guest ||
      (loginResponse as { booking?: { guest?: GuestProfile } } | null)?.booking?.guest ||
      (verifyResponse as { booking?: { guest?: GuestProfile } } | null)?.booking?.guest ||
      null;

    setPortalSession(nextToken, nextGuest as GuestProfile | undefined);
    setToken(nextToken);
    setGuest(nextGuest || guest);

    return {
      success: true,
      token: nextToken,
      guest: nextGuest || guest,
    };
  };

  const verify = async (candidateToken: string) => {
    const response = (await tryVerifyEndpoint(candidateToken)) || {
      success: true,
      token: candidateToken,
      guest,
    };

    setPortalSession(response.token, response.guest);
    setToken(response.token);
    setGuest((response.guest as GuestProfile | null) || guest);
    return response;
  };

  const logout = async () => {
    try {
      await api.post('/api/guest-portal/auth/logout', {}, { token, skipAuthRedirect: true });
    } catch {
      // noop
    }

    clearPortalSession();
    setToken(null);
    setGuest(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      guest,
      isAuthenticated: Boolean(token),
      loading: !hydrated,
      login,
      verify,
      logout,
      refreshSession,
    }),
    [guest, hydrated, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
