import { api, tokenManager } from './apiClient';
import { wsClient } from './websocketClient';
import { toast } from 'react-hot-toast';
import {
  AUTH_V1,
  AuthV1SessionResponse,
  AuthV1UserPayload,
  mapAuthV1User,
  mapRegisterV1User,
  parseAuthV1LoginResponse,
} from '../lib/auth-v1';

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
      const response = await api.post<Record<string, unknown>>(AUTH_V1.LOGIN, credentials);

      if (response.success && response.data) {
        const parsed = parseAuthV1LoginResponse({
          success: true,
          data: response.data as Record<string, unknown>,
        });

        if (parsed?.requires_2fa) {
          toast.info('Código de autenticação de dois fatores necessário');
          return {
            requiresTwoFactor: true,
            tempToken: parsed.temp_token,
            expires_in: parsed.expires_in ?? 300,
            user: {} as User,
            access_token: '',
            refresh_token: '',
          };
        }

        if (parsed?.access_token && parsed.refresh_token) {
          tokenManager.setTokens(parsed.access_token, parsed.refresh_token);
          wsClient.connect();
          toast.success('Login realizado com sucesso!');
          const userPayload = parsed.user;
          return {
            user: userPayload
              ? (mapAuthV1User(userPayload) as unknown as User)
              : (response.data as LoginResponse).user,
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
            expires_in: parsed.expires_in ?? 900,
          };
        }
      }

      throw new Error(response.message || 'Erro no login');
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async verify2FA(verification: TwoFactorVerification): Promise<LoginResponse> {
    try {
      const response = await api.post<Record<string, unknown>>(AUTH_V1.TWO_FA_VERIFY, verification);

      if (response.success && response.data) {
        const parsed = parseAuthV1LoginResponse({
          success: true,
          data: response.data as Record<string, unknown>,
        });

        if (parsed?.access_token && parsed.refresh_token) {
          tokenManager.setTokens(parsed.access_token, parsed.refresh_token);
          wsClient.connect();
          toast.success('Autenticação concluída com sucesso!');
          const userPayload = parsed.user;
          return {
            user: userPayload
              ? (mapAuthV1User(userPayload) as unknown as User)
              : (response.data as LoginResponse).user,
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
            expires_in: parsed.expires_in ?? 900,
          };
        }
      }

      throw new Error(response.message || 'Erro na verificação 2FA');
    } catch (error: unknown) {
      console.error('2FA verification error:', error);
      throw error;
    }
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

  async setup2FA(): Promise<TwoFactorSetup> {
    try {
      const response = await api.post<{
        secret: string;
        qr_code: string;
        otpauth_url?: string;
      }>(AUTH_V1.TWO_FA_SETUP);

      if (response.success && response.data) {
        return {
          secret: response.data.secret,
          qrCode: response.data.qr_code,
          backupCodes: [],
        };
      }

      throw new Error(response.message || 'Erro ao configurar 2FA');
    } catch (error: unknown) {
      console.error('2FA setup error:', error);
      throw error;
    }
  },

  async verify2FASetup(token: string): Promise<{ backupCodes: string[] }> {
    try {
      const response = await api.post<{ backup_codes: string[] }>(
        AUTH_V1.TWO_FA_VERIFY_SETUP,
        { code: token }
      );

      if (response.success && response.data) {
        return { backupCodes: response.data.backup_codes ?? [] };
      }

      throw new Error(response.message || 'Erro ao verificar 2FA');
    } catch (error: unknown) {
      console.error('2FA verify setup error:', error);
      throw error;
    }
  },

  async disable2FA(
    currentPassword: string,
    twoFactorCode?: string,
    backupCode?: string
  ): Promise<void> {
    try {
      const body: Record<string, string> = { password: currentPassword };
      if (twoFactorCode) body.code = twoFactorCode;
      if (backupCode) body.code = backupCode;

      const response = await api.post(AUTH_V1.TWO_FA_DISABLE, body);
      if (response.success) {
        toast.success('2FA desativado');
        return;
      }
      throw new Error(response.message || 'Erro ao desativar 2FA');
    } catch (error: unknown) {
      console.error('2FA disable error:', error);
      throw error;
    }
  },

  async generateBackupCodes(currentPassword: string, twoFactorCode?: string): Promise<string[]> {
    try {
      const response = await api.post<{ backup_codes: string[] }>(
        AUTH_V1.TWO_FA_BACKUP_CODES,
        { password: currentPassword, code: twoFactorCode }
      );

      if (response.success && response.data?.backup_codes) {
        return response.data.backup_codes;
      }

      throw new Error(response.message || 'Erro ao gerar códigos de backup');
    } catch (error: unknown) {
      console.error('Backup codes error:', error);
      throw error;
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await api.post(AUTH_V1.FORGOT_PASSWORD, { email });
      if (response.success) {
        toast.success(response.message || 'Se o e-mail existir, enviaremos instruções.');
        return;
      }
      throw new Error(response.message || 'Erro ao solicitar recuperação');
    } catch (error: unknown) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  async resetPassword(data: PasswordReset): Promise<void> {
    try {
      const response = await api.post(AUTH_V1.RESET_PASSWORD, {
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      if (response.success) {
        toast.success(response.message || 'Senha alterada. Faça login.');
        return;
      }

      throw new Error(response.message || 'Erro ao redefinir senha');
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      throw error;
    }
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
