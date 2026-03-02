import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
  avatar?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  // Ações de autenticação
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  
  // Ações de estado
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Ações de permissões
  hasPermission: (permission: string) => boolean;
  hasRole: (role: User['role']) => boolean;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ações de autenticação
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implementar chamada real para API
          // Simulação de login
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            name: 'João Silva',
            email: email,
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            permissions: ['read:bookings', 'write:bookings', 'read:customers', 'write:customers', 'admin:all']
          };
          
          const mockToken = 'mock-jwt-token-' + Date.now();
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erro ao fazer login'
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implementar chamada real para API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simula sucesso no registro
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erro ao registrar usuário'
          });
        }
      },

      // Ações de estado
      setUser: (user: User) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: !!token });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Ações de permissões
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        
        return user.permissions.includes(permission) || user.permissions.includes('admin:all');
      },

      hasRole: (role: User['role']) => {
        const { user } = get();
        if (!user) return false;
        
        const roleHierarchy = {
          'agent': 1,
          'manager': 2,
          'admin': 3
        };
        
        return roleHierarchy[user.role] >= roleHierarchy[role];
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
