'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, full_name: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // Inicializar isLoading como false por padrão para evitar travamento
  // Só será true durante a verificação inicial de autenticação
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  console.log('[AuthContext] AuthProvider renderizado, isLoading:', isLoading);

  // Verificar token armazenado ao inicializar
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    
    console.log('[AuthContext] useEffect executado - iniciando initAuth');
    
    // Definir isLoading como true apenas durante a verificação
    setIsLoading(true);
    
    const initAuth = async () => {
      console.log('[AuthContext] initAuth chamado');
      
      // Timeout de segurança: sempre definir isLoading como false após 2 segundos
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.log('[AuthContext] ⚠️ Timeout de segurança - definindo isLoading como false');
          setIsLoading(false);
        }
      }, 2000);
      
      try {
        // Verificar se estamos no cliente (localStorage só existe no browser)
        if (typeof window === 'undefined') {
          console.log('[AuthContext] SSR - definindo isLoading como false');
          if (isMounted) setIsLoading(false);
          return;
        }

        console.log('[AuthContext] Iniciando verificação de autenticação...');
        const storedAccessToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        
        console.log('[AuthContext] Tokens encontrados:', {
          hasAccessToken: !!storedAccessToken,
          hasRefreshToken: !!storedRefreshToken,
          accessToken: storedAccessToken?.substring(0, 10) + '...'
        });
        
        if (storedAccessToken && storedRefreshToken) {
          if (isMounted) {
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
          }
          
          // Se for demo token, criar usuário demo
          if (storedAccessToken === 'demo-token') {
            console.log('[AuthContext] Token demo detectado - criando usuário demo');
            const demoUser: User = {
              id: 1,
              email: 'demo@onionrsv.com',
              full_name: 'Usuário Demo',
              is_active: true,
              permissions: ['admin'],
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            };
            if (isMounted) {
              setUser(demoUser);
              setIsLoading(false);
            }
            if (timeoutId) clearTimeout(timeoutId);
            console.log('[AuthContext] Usuário demo criado, isLoading = false, isAuthenticated = true');
            return;
          } else {
            // Tentar verificar token real (opcional) com timeout
            try {
              console.log('[AuthContext] Verificando token real...');
              // Timeout de 3 segundos para evitar travamento
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              );
              
              const isValid = await Promise.race([
                verifyToken(storedAccessToken),
                timeoutPromise
              ]) as boolean;
              
              console.log('[AuthContext] Token válido:', isValid);
              if (isValid && isMounted) {
                await fetchUserData(storedAccessToken);
                // fetchUserData já define isLoading como false
              } else if (isMounted) {
                console.log('[AuthContext] Token inválido - limpando autenticação');
                clearAuth();
              }
            } catch (error) {
              // Se falhar ou timeout, limpar autenticação
              console.error('[AuthContext] Erro ao verificar token:', error);
              if (isMounted) clearAuth();
            }
          }
        } else {
          // Não há token armazenado, apenas definir loading como false IMEDIATAMENTE
          console.log('[AuthContext] Nenhum token encontrado - definindo isLoading como false');
          if (isMounted) setIsLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
          return; // Sair imediatamente
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao inicializar autenticação:', error);
        if (isMounted) clearAuth();
      } finally {
        // Garantir que sempre definimos loading como false
        if (timeoutId) clearTimeout(timeoutId);
        console.log('[AuthContext] Finalizando inicialização - isLoading = false');
        if (isMounted) setIsLoading(false);
      }
    };

    // Executar imediatamente
    console.log('[AuthContext] Chamando initAuth()...');
    initAuth().catch(error => {
      console.error('[AuthContext] Erro não capturado em initAuth:', error);
      if (isMounted) setIsLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
    });
    
    // Cleanup
    return () => {
      console.log('[AuthContext] Cleanup do useEffect');
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  // FALLBACK: Garantir que isLoading seja false após 5 segundos, independente de tudo
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      console.log('[AuthContext] ⚠️ FALLBACK: Forçando isLoading = false após 5 segundos');
      setIsLoading(false);
    }, 5000);
    
    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Renovação automática de token
  useEffect(() => {
    if (!accessToken || accessToken === 'demo-token') return;

    const tokenRefreshInterval = setInterval(async () => {
      try {
        if (refreshToken && refreshToken !== 'demo-refresh') {
          await refreshAccessToken(refreshToken);
        }
      } catch (error) {
        console.error('Erro ao renovar token:', error);
        logout();
      }
    }, 25 * 60 * 1000); // Renovar 5 minutos antes da expiração (30 min - 5 min)

    return () => clearInterval(tokenRefreshInterval);
  }, [accessToken, refreshToken]);

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      // Timeout de 5 segundos para evitar travamento
      const timeoutPromise = new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar dados do usuário')), 5000)
      );
      
      const fetchPromise = fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        const userData = await response.json();
        const u = userData.user || userData;
        setUser({
          id: u.id,
          email: u.email,
          full_name: u.name || u.full_name || '',
          firstName: u.name?.split?.(' ')[0],
          lastName: u.name?.split?.(' ').slice(1).join?.(' ') || '',
          role: u.role,
          is_active: u.status === 'active',
          permissions: u.role ? [u.role] : [],
          created_at: u.created_at || new Date().toISOString(),
          last_login: u.last_login,
        });
        setIsLoading(false);
        console.log('[AuthContext] Dados do usuário carregados com sucesso');
      } else {
        throw new Error('Falha ao buscar dados do usuário');
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao buscar dados do usuário:', error);
      // Se falhar, limpar autenticação mas garantir que isLoading seja false
      setIsLoading(false);
      throw error;
    }
  };

  const refreshAccessToken = async (refreshTokenValue: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccess = data.token || data.access_token;
        setAccessToken(newAccess);
        localStorage.setItem('access_token', newAccess);
        if (data.refresh_token || data.refreshToken) {
          setRefreshToken(data.refresh_token || data.refreshToken);
          localStorage.setItem('refresh_token', data.refresh_token || data.refreshToken);
        }
      } else {
        throw new Error('Falha ao renovar token');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Verificar se é login demo
      if (email === 'demo@onionrsv.com' && password === 'demo123') {
        const demoUser: User = {
          id: 1,
          email: 'demo@onionrsv.com',
          full_name: 'Usuário Demo',
          is_active: true,
          permissions: ['admin'],
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        
        setUser(demoUser);
        setAccessToken('demo-token');
        setRefreshToken('demo-refresh');
        localStorage.setItem('access_token', 'demo-token');
        localStorage.setItem('refresh_token', 'demo-refresh');
        return true;
      }

      // Verificar se é login admin
      if (email === 'admin@onionrsv.com' && password === 'admin123') {
        const adminUser: User = {
          id: 2,
          email: 'admin@onionrsv.com',
          full_name: 'Administrador',
          firstName: 'Administrador',
          lastName: 'RSV',
          role: 'admin',
          is_active: true,
          permissions: ['admin'],
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        
        setUser(adminUser);
        setAccessToken('admin-token');
        setRefreshToken('admin-refresh');
        localStorage.setItem('access_token', 'admin-token');
        localStorage.setItem('refresh_token', 'admin-refresh');
        return true;
      }

      // Tentar login real com backend (/api/auth/login)
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const access = data.token || data.access_token;
        const refresh = data.refreshToken || data.refresh_token;
        setAccessToken(access);
        setRefreshToken(refresh);
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        if (data.user) {
          const u = data.user;
          setUser({
            id: u.id,
            email: u.email,
            full_name: u.name || u.full_name || '',
            firstName: u.name?.split?.(' ')[0],
            lastName: u.name?.split?.(' ').slice(1).join?.(' ') || '',
            role: u.role,
            is_active: u.status === 'active',
            permissions: u.role ? [u.role] : [],
            created_at: u.created_at || new Date().toISOString(),
            last_login: u.last_login,
          });
        } else {
          await fetchUserData(access);
        }
        return true;
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const register = async (email: string, full_name: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: full_name, email, password }),
      });

      if (response.ok) {
        return true;
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || 'Falha no registro');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    // Redirecionar para login usando window.location (funciona em SSR)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setIsLoading(false);
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!accessToken || accessToken === 'demo-token' || accessToken === 'admin-token') {
        // Para usuários demo, apenas atualizar localmente
        if (user) {
          setUser({ ...user, ...userData });
        }
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return true;
      } else {
        throw new Error('Falha ao atualizar usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!accessToken || accessToken === 'demo-token' || accessToken === 'admin-token') {
        // Para usuários demo, simular sucesso
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Falha ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated: !!user,
    refreshToken: () => refreshToken ? refreshAccessToken(refreshToken) : Promise.resolve(),
    updateUser,
    changePassword,
  };

  console.log('[AuthContext] Renderizando Provider com value:', {
    hasUser: !!user,
    isLoading,
    isAuthenticated: !!user
  });
  
  console.log('[AuthContext] Provider sendo criado, value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  console.log('[AuthContext] useAuth chamado, context:', context === undefined ? 'undefined' : 'definido');
  
  // Durante SSR ou se não estiver no AuthProvider, retornar valores padrão
  if (context === undefined) {
    console.warn('[AuthContext] ⚠️ Contexto undefined - retornando valores padrão (isLoading: true)');
    // Retornar valores padrão em vez de lançar erro
    // Isso permite que o componente seja renderizado durante SSR
    return {
      user: null,
      login: async () => false,
      logout: () => {},
      register: async () => false,
      isLoading: true,
      isAuthenticated: false,
      refreshToken: async () => {},
      updateUser: async () => false,
      changePassword: async () => false,
    };
  }
  
  console.log('[AuthContext] useAuth retornando context com isLoading:', context.isLoading);
  return context;
} 