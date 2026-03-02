'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Tipos de usuário e autenticação
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  company?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  password: string;
  marketingOptIn?: boolean;
}

// Estado da autenticação
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Contexto de autenticação
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Mock API para demonstração
const mockAuthAPI = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular validação
    if (credentials.email === 'admin@rsv.com' && credentials.password === 'Admin123!') {
      return {
        user: {
          id: '1',
          email: 'admin@rsv.com',
          firstName: 'Administrador',
          lastName: 'RSV',
          role: 'admin',
          avatar: '/avatars/admin.jpg',
          company: 'RSV Viagens',
          phone: '(11) 99999-9999',
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600, // 1 hora
        },
      };
    } else if (credentials.email === 'user@rsv.com' && credentials.password === 'User123!') {
      return {
        user: {
          id: '2',
          email: 'user@rsv.com',
          firstName: 'Usuário',
          lastName: 'Comum',
          role: 'user',
          avatar: '/avatars/user.jpg',
          company: 'RSV Viagens',
          phone: '(11) 88888-8888',
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600,
        },
      };
    }
    
    throw new Error('Credenciais inválidas');
  },

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular criação de usuário
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
      company: data.company,
      phone: data.phone,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      user: newUser,
      tokens: {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
      },
    };
  },

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      tokens: {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
      },
    };
  },
};

// Contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Carregar estado inicial do localStorage
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedTokens = localStorage.getItem('auth_tokens');
        const savedUser = localStorage.getItem('auth_user');
        
        if (savedTokens && savedUser) {
          const tokens = JSON.parse(savedTokens);
          const user = JSON.parse(savedUser);
          
          // Verificar se o token não expirou
          const tokenExpiry = localStorage.getItem('auth_expiry');
          if (tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            setState({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
        
        // Limpar dados expirados
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_expiry');
        
        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Erro ao carregar estado de autenticação:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  // Salvar estado no localStorage
  const saveAuthState = useCallback((user: User, tokens: AuthTokens) => {
    try {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_expiry', (Date.now() + tokens.expiresIn * 1000).toString());
    } catch (error) {
      console.error('Erro ao salvar estado de autenticação:', error);
    }
  }, []);

  // Limpar estado do localStorage
  const clearAuthState = useCallback(() => {
    try {
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expiry');
    } catch (error) {
      console.error('Erro ao limpar estado de autenticação:', error);
    }
  }, []);

  // Função de login
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { user, tokens } = await mockAuthAPI.login(credentials);
      
      // Salvar no localStorage se "lembrar-me" estiver ativado
      if (credentials.rememberMe) {
        saveAuthState(user, tokens);
      }
      
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer login',
      }));
      throw error;
    }
  }, [saveAuthState]);

  // Função de registro
  const register = useCallback(async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { user, tokens } = await mockAuthAPI.register(data);
      
      // Salvar no localStorage após registro
      saveAuthState(user, tokens);
      
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar conta',
      }));
      throw error;
    }
  }, [saveAuthState]);

  // Função de logout
  const logout = useCallback(() => {
    clearAuthState();
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, [clearAuthState]);

  // Função de refresh do token
  const refreshAuth = useCallback(async () => {
    if (!state.tokens?.refreshToken) return;
    
    try {
      const { tokens } = await mockAuthAPI.refreshToken(state.tokens.refreshToken);
      
      if (state.user) {
        saveAuthState(state.user, tokens);
        setState(prev => ({
          ...prev,
          tokens,
        }));
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      logout();
    }
  }, [state.tokens, state.user, saveAuthState, logout]);

  // Função para limpar erros
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Função para atualizar dados do usuário
  const updateUser = useCallback((updates: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates, updatedAt: new Date() };
      setState(prev => ({ ...prev, user: updatedUser }));
      
      // Atualizar no localStorage
      if (state.tokens) {
        saveAuthState(updatedUser, state.tokens);
      }
    }
  }, [state.user, state.tokens, saveAuthState]);

  // Configurar refresh automático do token
  useEffect(() => {
    if (!state.tokens?.expiresIn) return;
    
    const refreshInterval = setInterval(() => {
      const expiryTime = localStorage.getItem('auth_expiry');
      if (expiryTime && Date.now() > parseInt(expiryTime) - 300000) { // 5 min antes
        refreshAuth();
      }
    }, 60000); // Verificar a cada minuto
    
    return () => clearInterval(refreshInterval);
  }, [state.tokens?.expiresIn, refreshAuth]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para verificar se o usuário tem uma role específica
export function useRole(requiredRole: User['role']) {
  const { user } = useAuth();
  return user?.role === requiredRole;
}

// Hook para verificar se o usuário tem pelo menos uma das roles
export function useAnyRole(requiredRoles: User['role'][]) {
  const { user } = useAuth();
  return user ? requiredRoles.includes(user.role) : false;
}
