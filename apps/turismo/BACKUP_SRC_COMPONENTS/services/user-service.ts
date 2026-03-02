import { apiClient, ApiResponse } from '@/lib/api-client';
import { User } from '@/components/auth';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: 'admin' | 'manager' | 'user';
  password: string;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  role?: 'admin' | 'manager' | 'user';
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
  company?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'changeRole' | 'sendEmail';
  data?: any;
}

export interface UserImportRequest {
  file: File;
  options: {
    skipFirstRow: boolean;
    updateExisting: boolean;
    sendWelcomeEmails: boolean;
    defaultRole: string;
    defaultCompany: string;
  };
}

export interface UserImportResponse {
  totalRows: number;
  imported: number;
  updated: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  usersByCompany: Record<string, number>;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  usersByStatus: {
    active: number;
    inactive: number;
    pending: number;
    locked: number;
  };
}

export class UserService {
  // Listar usuários com filtros e paginação
  static async getUsers(
    page = 1,
    limit = 20,
    filters?: UserFilters
  ): Promise<ApiResponse<UserListResponse>> {
    const params: any = { page, limit };
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params[key] = value.toISOString();
          } else {
            params[key] = value;
          }
        }
      });
    }

    return apiClient.get<UserListResponse>('/users', params);
  }

  // Obter usuário por ID
  static async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${userId}`);
  }

  // Criar novo usuário
  static async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/users', data);
  }

  // Atualizar usuário
  static async updateUser(userId: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${userId}`, data);
  }

  // Excluir usuário
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${userId}`);
  }

  // Ativar usuário
  static async activateUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/users/${userId}/activate`);
  }

  // Desativar usuário
  static async deactivateUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/users/${userId}/deactivate`);
  }

  // Bloquear usuário
  static async lockUser(userId: string, reason?: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/users/${userId}/lock`, { reason });
  }

  // Desbloquear usuário
  static async unlockUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/users/${userId}/unlock`);
  }

  // Alterar senha do usuário
  static async changeUserPassword(userId: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/users/${userId}/change-password`, { newPassword });
  }

  // Forçar reset de senha
  static async forcePasswordReset(userId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/users/${userId}/force-password-reset`);
  }

  // Enviar email de boas-vindas
  static async sendWelcomeEmail(userId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/users/${userId}/send-welcome-email`);
  }

  // Operações em lote
  static async bulkOperation(operation: BulkUserOperation): Promise<ApiResponse<{
    success: number;
    failed: number;
    errors: Array<{ userId: string; error: string }>;
  }>> {
    return apiClient.post('/users/bulk-operation', operation);
  }

  // Ativar múltiplos usuários
  static async bulkActivate(userIds: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.bulkOperation({ userIds, operation: 'activate' });
  }

  // Desativar múltiplos usuários
  static async bulkDeactivate(userIds: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.bulkOperation({ userIds, operation: 'deactivate' });
  }

  // Excluir múltiplos usuários
  static async bulkDelete(userIds: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.bulkOperation({ userIds, operation: 'delete' });
  }

  // Alterar role de múltiplos usuários
  static async bulkChangeRole(userIds: string[], newRole: string): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.bulkOperation({ userIds, operation: 'changeRole', data: { newRole } });
  }

  // Enviar email para múltiplos usuários
  static async bulkSendEmail(userIds: string[], emailData: {
    subject: string;
    body: string;
    template?: string;
  }): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.bulkOperation({ userIds, operation: 'sendEmail', data: emailData });
  }

  // Importar usuários
  static async importUsers(data: UserImportRequest): Promise<ApiResponse<UserImportResponse>> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('options', JSON.stringify(data.options));

    return apiClient.post<UserImportResponse>('/users/import', formData);
  }

  // Exportar usuários
  static async exportUsers(
    format: 'csv' | 'excel' | 'json' = 'csv',
    filters?: UserFilters
  ): Promise<void> {
    const params: any = { format };
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params[key] = value.toISOString();
          } else {
            params[key] = value;
          }
        }
      });
    }

    const queryString = new URLSearchParams(params).toString();
    return apiClient.download(`/users/export?${queryString}`, `usuarios.${format}`);
  }

  // Obter estatísticas de usuários
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiClient.get<UserStats>('/users/stats');
  }

  // Obter usuários por empresa
  static async getUsersByCompany(company: string): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(`/users/by-company/${encodeURIComponent(company)}`);
  }

  // Obter usuários por role
  static async getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(`/users/by-role/${role}`);
  }

  // Buscar usuários
  static async searchUsers(
    query: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<UserListResponse>> {
    return apiClient.get<UserListResponse>('/users/search', { query, page, limit });
  }

  // Verificar se email está disponível
  static async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return apiClient.get<{ available: boolean }>(`/users/check-email/${encodeURIComponent(email)}`);
  }

  // Obter histórico de atividades do usuário
  static async getUserActivityHistory(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{
    activities: Array<{
      id: string;
      action: string;
      details: string;
      timestamp: Date;
      ipAddress: string;
      userAgent: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiClient.get(`/users/${userId}/activity-history?page=${page}&limit=${limit}`);
  }

  // Obter sessões ativas do usuário
  static async getUserSessions(userId: string): Promise<ApiResponse<Array<{
    id: string;
    device: string;
    browser: string;
    ipAddress: string;
    location: string;
    lastActivity: Date;
    isCurrent: boolean;
  }>>> {
    return apiClient.get(`/users/${userId}/sessions`);
  }

  // Encerrar sessão do usuário
  static async terminateUserSession(userId: string, sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${userId}/sessions/${sessionId}`);
  }

  // Encerrar todas as sessões do usuário
  static async terminateAllUserSessions(userId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/users/${userId}/sessions/terminate-all`);
  }

  // Obter permissões do usuário
  static async getUserPermissions(userId: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`/users/${userId}/permissions`);
  }

  // Atualizar permissões do usuário
  static async updateUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/users/${userId}/permissions`, { permissions });
  }

  // Obter roles disponíveis
  static async getAvailableRoles(): Promise<ApiResponse<Array<{
    name: string;
    description: string;
    permissions: string[];
    isDefault: boolean;
  }>>> {
    return apiClient.get('/users/roles');
  }

  // Criar novo role
  static async createRole(data: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<ApiResponse<{ name: string; description: string; permissions: string[] }>> {
    return apiClient.post('/users/roles', data);
  }

  // Atualizar role
  static async updateRole(
    roleName: string,
    data: {
      description?: string;
      permissions?: string[];
    }
  ): Promise<ApiResponse<{ name: string; description: string; permissions: string[] }>> {
    return apiClient.put(`/users/roles/${roleName}`, data);
  }

  // Excluir role
  static async deleteRole(roleName: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/roles/${roleName}`);
  }

  // Obter template de importação
  static async getImportTemplate(): Promise<void> {
    return apiClient.download('/users/import-template', 'template-importacao-usuarios.csv');
  }

  // Validar dados de importação
  static async validateImportData(file: File): Promise<ApiResponse<UserImportResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<UserImportResponse>('/users/validate-import', formData);
  }

  // Obter logs de auditoria de usuários
  static async getUserAuditLogs(
    userId?: string,
    page = 1,
    limit = 20,
    filters?: {
      action?: string;
      dateFrom?: Date;
      dateTo?: Date;
      adminUser?: string;
    }
  ): Promise<ApiResponse<{
    logs: Array<{
      id: string;
      userId: string;
      adminUserId: string;
      action: string;
      details: string;
      timestamp: Date;
      ipAddress: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    const params: any = { page, limit };
    
    if (userId) params.userId = userId;
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params[key] = value.toISOString();
          } else {
            params[key] = value;
          }
        }
      });
    }

    return apiClient.get('/users/audit-logs', params);
  }

  // Limpar logs de auditoria antigos
  static async clearOldAuditLogs(daysOld: number): Promise<ApiResponse<{ deleted: number }>> {
    return apiClient.delete<{ deleted: number }>(`/users/audit-logs?daysOld=${daysOld}`);
  }

  // Obter relatório de usuários
  static async getUserReport(
    reportType: 'summary' | 'detailed' | 'activity' | 'security',
    filters?: UserFilters,
    format: 'pdf' | 'csv' | 'excel' = 'pdf'
  ): Promise<void> {
    const params: any = { reportType, format };
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params[key] = value.toISOString();
          } else {
            params[key] = value;
          }
        }
      });
    }

    const queryString = new URLSearchParams(params).toString();
    return apiClient.download(`/users/reports?${queryString}`, `relatorio-usuarios-${reportType}.${format}`);
  }
}

export default UserService;
