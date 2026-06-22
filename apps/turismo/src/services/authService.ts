import { api, tokenManager } from './apiClient';
import { wsClient } from './websocketClient';
import { toast } from 'react-hot-toast';
import {
  AUTH_V1,
  AuthV1SessionResponse,
  AuthV1UserPayload,
  mapAuthV1User,
  mapRegisterV1User,
} from '../lib/auth-v1';
import { rejectDeferredAuth } from '../lib/auth-legacy-deferred';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  last_login_ip?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'user';
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface TwoFactorVerification {
  token?: string;
  backup_code?: string;
  temp_token?: string;
}

// Auth Service
export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(AUTH_V1.LOGIN, credentials);
      
      if (response.success && response.data) {
        if (response.data.requiresTwoFactor) {
          // 2FA required - don't store tokens yet
          toast.info('Código de autenticação de dois fatores necessário');
          return response.data;
        } else {
          // Normal login - store tokens
          tokenManager.setTokens(response.data.access_token, response.data.refresh_token);
          
          // Connect WebSocket
          wsClient.connect();
          
          toast.success('Login realizado com sucesso!');
          return response.data;
        }
      }
      
      throw new Error(response.message || 'Erro no login');
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Verify 2FA (defer — sem backend v1)
  async verify2FA(_verification: TwoFactorVerification): Promise<LoginResponse> {
    rejectDeferredAuth('twoFactor');
  },

  // Register (v1 — sem auto-login; D2.3)
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await api.post<AuthV1UserPayload>(AUTH_V1.REGISTER, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        ...(userData.role ? { role: userData.role } : {}),
      });

      if (response.success && response.data) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        const mapped = mapRegisterV1User(response.data);
        return {
          id: typeof mapped.id === 'number' ? mapped.id : parseInt(String(mapped.id), 10) || 0,
          name: mapped.name,
          email: mapped.email,
          role: (mapped.role as User['role']) || 'user',
          status: mapped.is_active ? 'active' : 'inactive',
          two_factor_enabled: false,
          created_at: mapped.created_at,
          updated_at: mapped.created_at,
        };
      }

      throw new Error(
        response.message || (response as { error?: string }).error || 'Erro no cadastro'
      );
    } catch (error: unknown) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      await api.post(AUTH_V1.LOGOUT, { refresh_token: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data
      tokenManager.clearTokens();
      wsClient.disconnect();
      toast.success('Logout realizado com sucesso!');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<AuthV1SessionResponse>(AUTH_V1.SESSION);

      if (response.authenticated && response.user) {
        const mapped = mapAuthV1User(response.user);

        return {
          id: typeof mapped.id === 'number' ? mapped.id : parseInt(String(mapped.id), 10) || 0,
          name: mapped.name,
          email: mapped.email,
          role: (mapped.role || 'user') as User['role'],
          status: mapped.is_active ? 'active' : 'inactive',
          two_factor_enabled: false,
          created_at: mapped.created_at,
          updated_at: mapped.created_at,
          last_login: mapped.last_login,
        };
      }

      throw new Error('Sessão inválida ou expirada');
    } catch (error: unknown) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<{ access_token: string; refresh_token: string }>(
        AUTH_V1.REFRESH,
        {
          refresh_token: refreshToken,
        }
      );
      
      if (response.success && response.data) {
        tokenManager.setTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      }
      
      throw new Error(response.message || 'Erro ao renovar token');
    } catch (error: unknown) {
      console.error('Refresh token error:', error);
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      throw error;
    }
  },

  // Setup 2FA (defer — sem backend v1)
  async setup2FA(): Promise<TwoFactorSetup> {
    rejectDeferredAuth('twoFactor');
  },

  // Verify 2FA setup (defer)
  async verify2FASetup(_token: string): Promise<{ backupCodes: string[] }> {
    rejectDeferredAuth('twoFactor');
  },

  // Disable 2FA (defer)
  async disable2FA(
    _currentPassword: string,
    _twoFactorCode?: string,
    _backupCode?: string
  ): Promise<void> {
    rejectDeferredAuth('twoFactor');
  },

  // Generate backup codes (defer)
  async generateBackupCodes(_currentPassword: string, _twoFactorCode?: string): Promise<string[]> {
    rejectDeferredAuth('twoFactor');
  },

  // Request password reset (defer — sem backend v1)
  async requestPasswordReset(_email: string): Promise<void> {
    rejectDeferredAuth('passwordReset');
  },

  // Reset password (defer)
  async resetPassword(_data: PasswordReset): Promise<void> {
    rejectDeferredAuth('passwordReset');
  },

  // Verify token
  async verifyToken(): Promise<boolean> {
    try {
      const response = await api.get<AuthV1SessionResponse>(AUTH_V1.SESSION);
      return response.authenticated === true;
    } catch (_error) {
      return false;
    }
  },

  // Utility functions
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  },

  clearAuth(): void {
    tokenManager.clearTokens();
    wsClient.disconnect();
  },
};

export default authService;
