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
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignorar erro se já estiver deslogado
    } finally {
      clearTokens();
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authenticatedFetch('/api/users/profile');
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      } else {
        clearTokens();
        setUser(null);
      }
    } catch (error) {
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

