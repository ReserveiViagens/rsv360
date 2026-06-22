/**
 * ✅ ITEM 24: PROVIDER DE AUTENTICAÇÃO
 * Contexto React para gerenciar autenticação
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedFetch, setTokens, clearTokens, getTokens } from '@/lib/auth-interceptor';
import { useToast } from '@/components/providers/toast-wrapper';

interface AuthUser {
  id: number;
  name?: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  authenticatedFetch: typeof authenticatedFetch;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { success, error: showError } = useToast();

  useEffect(() => {
    // Verificar se há tokens salvos
    const { accessToken } = getTokens();
    if (accessToken) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        setTokens(result.data.access_token, result.data.refresh_token);
        setUser(result.data.user);
        success('Login realizado com sucesso!');
        return true;
      } else {
        showError(result.error || 'Erro ao fazer login');
        return false;
      }
    } catch (error: any) {
      showError(error.message || 'Erro ao fazer login');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { accessToken: access, refreshToken: refresh } = getTokens();
      const authToken =
        access ||
        (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch {
      // Ignorar erro se já estiver deslogado
    } finally {
      clearTokens();
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authenticatedFetch('/api/auth/session');
      const session = await response.json();

      if (session.authenticated && session.user) {
        const roles = Array.isArray(session.user.roles)
          ? session.user.roles
          : session.user.role
            ? [session.user.role]
            : ['user'];
        setUser({
          id: Number(session.user.id) || session.user.id,
          email: session.user.email ?? '',
          name: session.user.name ?? '',
          role: session.user.role ?? roles[0] ?? 'user',
        });
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        authenticatedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

