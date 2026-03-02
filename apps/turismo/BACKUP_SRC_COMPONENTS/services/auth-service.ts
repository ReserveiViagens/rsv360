import { apiClient, ApiResponse } from '@/lib/api-client';
import { User, LoginCredentials, RegisterData, AuthTokens } from '@/components/auth';

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  avatar?: File;
}

export interface TwoFactorSetupRequest {
  email: string;
  password: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export class AuthService {
  // Login de usuário
  static async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  // Registro de usuário
  static async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/register', data);
  }

  // Logout de usuário
  static async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>('/auth/logout');
      // Limpar tokens locais independente da resposta da API
      apiClient.logout();
      return response;
    } catch (error) {
      // Mesmo com erro, limpar tokens locais
      apiClient.logout();
      throw error;
    }
  }

  // Renovar token
  static async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshResponse>> {
    return apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
  }

  // Verificar token
  static async verifyToken(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/verify');
  }

  // Solicitar reset de senha
  static async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset', data);
  }

  // Confirmar reset de senha
  static async confirmPasswordReset(data: PasswordResetConfirm): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset/confirm', data);
  }

  // Alterar senha
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password', data);
  }

  // Atualizar perfil
  static async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    if (data.avatar) {
      // Upload de avatar
      const formData = new FormData();
      formData.append('avatar', data.avatar);
      
      // Adicionar outros campos
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'avatar' && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      return apiClient.post<User>('/auth/profile', formData);
    } else {
      // Atualização sem avatar
      return apiClient.put<User>('/auth/profile', data);
    }
  }

  // Configurar 2FA
  static async setupTwoFactor(data: TwoFactorSetupRequest): Promise<ApiResponse<TwoFactorResponse>> {
    return apiClient.post<TwoFactorResponse>('/auth/2fa/setup', data);
  }

  // Verificar código 2FA
  static async verifyTwoFactor(data: TwoFactorVerifyRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/2fa/verify', data);
  }

  // Desativar 2FA
  static async disableTwoFactor(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/2fa/disable');
  }

  // Gerar novos códigos de backup
  static async generateBackupCodes(): Promise<ApiResponse<string[]>> {
    return apiClient.post<string[]>('/auth/2fa/backup-codes');
  }

  // Verificar se usuário tem 2FA ativado
  static async checkTwoFactorStatus(): Promise<ApiResponse<{ enabled: boolean }>> {
    return apiClient.get<{ enabled: boolean }>('/auth/2fa/status');
  }

  // Obter sessões ativas
  static async getActiveSessions(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/auth/sessions');
  }

  // Encerrar sessão específica
  static async terminateSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/auth/sessions/${sessionId}`);
  }

  // Encerrar todas as outras sessões
  static async terminateAllOtherSessions(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/sessions/terminate-all-others');
  }

  // Verificar permissões do usuário
  static async getUserPermissions(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/auth/permissions');
  }

  // Verificar se usuário tem permissão específica
  static async checkPermission(permission: string): Promise<ApiResponse<boolean>> {
    return apiClient.get<boolean>(`/auth/permissions/check/${permission}`);
  }

  // Obter roles disponíveis
  static async getAvailableRoles(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/auth/roles');
  }

  // Atualizar role do usuário
  static async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/auth/users/${userId}/role`, { role });
  }

  // Verificar status da conta
  static async checkAccountStatus(): Promise<ApiResponse<{ active: boolean; locked: boolean; reason?: string }>> {
    return apiClient.get<{ active: boolean; locked: boolean; reason?: string }>('/auth/account/status');
  }

  // Ativar conta
  static async activateAccount(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/account/activate', { token });
  }

  // Reenviar email de ativação
  static async resendActivationEmail(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/account/resend-activation', { email });
  }

  // Verificar se email está disponível
  static async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return apiClient.get<{ available: boolean }>(`/auth/check-email/${encodeURIComponent(email)}`);
  }

  // Verificar força da senha
  static async checkPasswordStrength(password: string): Promise<ApiResponse<{ 
    score: number; 
    feedback: string[]; 
    suggestions: string[] 
  }>> {
    return apiClient.post<{ score: number; feedback: string[]; suggestions: string[] }>('/auth/check-password-strength', { password });
  }

  // Obter histórico de login
  static async getLoginHistory(page = 1, limit = 20): Promise<ApiResponse<{
    logins: Array<{
      id: string;
      timestamp: Date;
      ipAddress: string;
      location: string;
      device: string;
      browser: string;
      success: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiClient.get(`/auth/login-history?page=${page}&limit=${limit}`);
  }

  // Obter estatísticas de segurança
  static async getSecurityStats(): Promise<ApiResponse<{
    totalLogins: number;
    failedAttempts: number;
    lastFailedLogin?: Date;
    suspiciousActivity: number;
    twoFactorEnabled: boolean;
    lastPasswordChange?: Date;
  }>> {
    return apiClient.get('/auth/security-stats');
  }

  // Exportar dados de segurança
  static async exportSecurityData(format: 'csv' | 'json' = 'csv'): Promise<void> {
    return apiClient.download(`/auth/export-security-data?format=${format}`, `security-data.${format}`);
  }

  // Limpar histórico de login
  static async clearLoginHistory(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/auth/login-history');
  }

  // Configurar notificações de segurança
  static async updateSecurityNotifications(settings: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushAlerts: boolean;
    suspiciousActivity: boolean;
    newDeviceLogin: boolean;
    passwordChange: boolean;
  }): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/auth/security-notifications', settings);
  }

  // Obter configurações de notificações de segurança
  static async getSecurityNotifications(): Promise<ApiResponse<{
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushAlerts: boolean;
    suspiciousActivity: boolean;
    newDeviceLogin: boolean;
    passwordChange: boolean;
  }>> {
    return apiClient.get('/auth/security-notifications');
  }
}

export default AuthService;
