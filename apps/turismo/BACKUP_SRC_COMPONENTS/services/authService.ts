import { api, tokenManager, ApiResponse } from './apiClient';
import { wsClient } from './websocketClient';
import { toast } from 'react-hot-toast';

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
      const response = await api.post<LoginResponse>('/api/auth/login', credentials);
      
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
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Verify 2FA
  async verify2FA(verification: TwoFactorVerification): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/auth/2fa/verify', verification);
      
      if (response.success && response.data) {
        // Store tokens after successful 2FA
        tokenManager.setTokens(response.data.access_token, response.data.refresh_token);
        
        // Connect WebSocket
        wsClient.connect();
        
        toast.success('Autenticação concluída com sucesso!');
        return response.data;
      }
      
      throw new Error(response.message || 'Erro na verificação 2FA');
    } catch (error: any) {
      console.error('2FA verification error:', error);
      throw error;
    }
  },

  // Register
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await api.post<User>('/api/auth/register', userData);
      
      if (response.success && response.data) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        return response.data;
      }
      
      throw new Error(response.message || 'Erro no cadastro');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
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
      const response = await api.get<User>('/api/auth/me');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao obter dados do usuário');
    } catch (error: any) {
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

      const response = await api.post<{ access_token: string; refresh_token: string }>('/api/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      if (response.success && response.data) {
        tokenManager.setTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      }
      
      throw new Error(response.message || 'Erro ao renovar token');
    } catch (error: any) {
      console.error('Refresh token error:', error);
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      throw error;
    }
  },

  // Setup 2FA
  async setup2FA(): Promise<TwoFactorSetup> {
    try {
      const response = await api.post<TwoFactorSetup>('/api/auth/2fa/setup');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao configurar 2FA');
    } catch (error: any) {
      console.error('2FA setup error:', error);
      throw error;
    }
  },

  // Verify 2FA setup
  async verify2FASetup(token: string): Promise<{ backupCodes: string[] }> {
    try {
      const response = await api.post<{ backupCodes: string[] }>('/api/auth/2fa/verify-setup', { token });
      
      if (response.success && response.data) {
        toast.success('Autenticação de dois fatores ativada com sucesso!');
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao verificar 2FA');
    } catch (error: any) {
      console.error('2FA verification error:', error);
      throw error;
    }
  },

  // Disable 2FA
  async disable2FA(currentPassword: string, twoFactorCode?: string, backupCode?: string): Promise<void> {
    try {
      const response = await api.post('/api/auth/2fa/disable', {
        current_password: currentPassword,
        two_factor_token: twoFactorCode,
        backup_code: backupCode,
      });
      
      if (response.success) {
        toast.success('Autenticação de dois fatores desativada');
      } else {
        throw new Error(response.message || 'Erro ao desativar 2FA');
      }
    } catch (error: any) {
      console.error('2FA disable error:', error);
      throw error;
    }
  },

  // Generate backup codes
  async generateBackupCodes(currentPassword: string, twoFactorCode?: string): Promise<string[]> {
    try {
      const response = await api.post<{ backup_codes: string[] }>('/api/auth/2fa/backup-codes', {
        current_password: currentPassword,
        two_factor_token: twoFactorCode,
      });
      
      if (response.success && response.data) {
        toast.success('Novos códigos de backup gerados');
        return response.data.backup_codes;
      }
      
      throw new Error(response.message || 'Erro ao gerar códigos de backup');
    } catch (error: any) {
      console.error('Backup codes generation error:', error);
      throw error;
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      
      if (response.success) {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      } else {
        throw new Error(response.message || 'Erro ao solicitar recuperação');
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(data: PasswordReset): Promise<void> {
    try {
      const response = await api.post('/api/auth/reset-password', data);
      
      if (response.success) {
        toast.success('Senha redefinida com sucesso! Faça login com a nova senha.');
      } else {
        throw new Error(response.message || 'Erro ao redefinir senha');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // Verify token
  async verifyToken(): Promise<boolean> {
    try {
      const response = await api.post('/api/auth/verify-token');
      return response.success;
    } catch (error) {
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
