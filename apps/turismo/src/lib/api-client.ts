import { toast } from 'sonner';

// Configurações da API
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Classe principal do cliente API
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  // Método principal para fazer requisições
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = this.getAuthToken();
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      // Adicionar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Verificar se o token expirou
      if (response.status === 401 && token) {
        return this.handleTokenExpiration(endpoint, options, retryCount);
      }

      // Processar resposta
      const data = await this.processResponse<T>(response);
      
      // Log de sucesso em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API ${options.method || 'GET'} ${endpoint}:`, data);
      }

      return data;
    } catch (error) {
      // Retry automático para erros de rede
      if (retryCount < this.retryAttempts && this.isRetryableError(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      // Log de erro
      console.error(`❌ API Error ${options.method || 'GET'} ${endpoint}:`, error);
      
      // Mostrar toast de erro para o usuário
      this.showErrorToast(error);
      
      throw this.formatError(error);
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : '';
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload de arquivos
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remover Content-Type para FormData
        ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
      },
    });
  }

  // Download de arquivos
  async download(endpoint: string, filename?: string): Promise<void> {
    try {
      const response = await this.request(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/octet-stream',
        },
      });

      if (response.success && response.data) {
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
      this.showErrorToast(error);
    }
  }

  // Processar resposta da API
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } else {
      // Para respostas não-JSON (como downloads)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return {
        success: true,
        data: await response.blob() as any,
      };
    }
  }

  // Tratar expiração de token
  private async handleTokenExpiration(
    endpoint: string,
    options: RequestInit,
    retryCount: number
  ): Promise<ApiResponse<any>> {
    if (this.isRefreshing) {
      // Se já está renovando, adicionar à fila
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // Tentar renovar o token
      const refreshed = await this.refreshToken();
      
      if (refreshed) {
        // Processar fila de requisições falhadas
        this.processQueue(null, null);
        
        // Retry da requisição original
        return this.request(endpoint, options, retryCount);
      } else {
        // Falha na renovação, limpar fila e redirecionar para login
        this.processQueue(null, new Error('Token refresh failed'));
        this.redirectToLogin();
        throw new Error('Authentication failed');
      }
    } catch (error) {
      this.processQueue(null, error);
      this.redirectToLogin();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Processar fila de requisições falhadas
  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Renovar token
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data?.accessToken) {
          this.setAuthToken(data.data.accessToken);
          this.setRefreshToken(data.data.refreshToken);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Verificar se erro é retryável
  private isRetryableError(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.status >= 400 && error.status < 500) return false;
    return true;
  }

  // Delay para retry
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Construir query string
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    return searchParams.toString();
  }

  // Gerenciar tokens de autenticação
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  // Mostrar toast de erro
  private showErrorToast(error: any): void {
    const message = this.getErrorMessage(error);
    
    if (typeof window !== 'undefined' && typeof toast !== 'undefined') {
      toast.error(message);
    }
  }

  // Formatar mensagem de erro
  private getErrorMessage(error: any): string {
    if (error.message) return error.message;
    if (error.status === 404) return 'Recurso não encontrado';
    if (error.status === 500) return 'Erro interno do servidor';
    if (error.status === 401) return 'Não autorizado';
    if (error.status === 403) return 'Acesso negado';
    if (error.status === 422) return 'Dados inválidos';
    return 'Erro desconhecido';
  }

  // Formatar erro para uso interno
  private formatError(error: any): ApiError {
    return {
      message: this.getErrorMessage(error),
      status: error.status || 500,
      code: error.code,
      details: error.details || error,
    };
  }

  // Redirecionar para login
  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      // Limpar tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirecionar para login
      window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }

  // Limpar tokens (logout)
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Obter token atual
  getCurrentToken(): string | null {
    return this.getAuthToken();
  }
}

// Instância singleton do cliente API
export const apiClient = new ApiClient();

// Hooks para uso em componentes React
export const useApiClient = () => apiClient;

// Exportar tipos úteis
export type { ApiResponse, ApiError };

// Exportar instância padrão
export default apiClient;
