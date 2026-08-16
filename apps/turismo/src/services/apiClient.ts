import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { tryCreateDpopProof } from '@rsv360/shared';

// API Configuration
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002').replace(/\/$/, '');
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true, // PR turismo-LS-prep — HttpOnly refresh cookie (Path=/api/v1/auth)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token + DPoP (PR-10c-a2, flag OFF best-effort)
apiClient.interceptors.request.use(
  async (config) => {
    // Tentar buscar token de diferentes locais (compatibilidade)
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const method = (config.method || 'get').toUpperCase();
      const url = axios.getUri(config);
      const proof = await tryCreateDpopProof({
        method,
        url,
        accessToken: token || undefined,
      });
      if (proof) {
        config.headers['DPoP'] = proof;
      }
    } catch {
      // best-effort
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          toast.error('Sessão expirada. Faça login novamente.');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error('Acesso negado. Você não tem permissão para esta ação.');
          break;
          
        case 404:
          toast.error('Recurso não encontrado.');
          break;
          
        case 422: {
          // Validation errors
          const errorData = data as ApiErrorPayload;
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            errorData.errors.forEach((err) => {
              toast.error(err.msg || err.message || 'Erro de validação');
            });
          } else {
            toast.error(errorData?.message || 'Dados inválidos');
          }
          break;
        }
          
        case 429:
          toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
          break;
          
        case 500:
          toast.error('Erro interno do servidor. Tente novamente mais tarde.');
          break;
          
        default: {
          const message = (data as ApiErrorPayload)?.message || 'Erro inesperado';
          toast.error(message);
          break;
        }
      }
    } else if (error.request) {
      // Network error
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      // Other errors
      toast.error('Erro inesperado. Tente novamente.');
    }
    
    console.error('❌ API Error:', error);
    return Promise.reject(error);
  }
);

interface ApiValidationErrorItem {
  msg?: string;
  message?: string;
}

interface ApiErrorPayload {
  message?: string;
  errors?: ApiValidationErrorItem[];
}

// API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiValidationErrorItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  /** Campos legados no root (alguns endpoints backend) */
  auctions?: unknown[];
  feeds?: unknown[];
}

// Generic API methods
export const api = {
  // GET request
  get: async <T = unknown>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  // POST request
  post: async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // PUT request
  put: async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.put(url, data);
    return response.data;
  },

  // PATCH request
  patch: async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.patch(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete(url);
    return response.data;
  },

  // Upload file
  upload: async <T = unknown>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },
};

// Token management — access in LS; refresh only via HttpOnly cookie (PR-10c-pré-b / ls-prep).
const REFRESH_LS_KEYS = ['refresh_token', 'refreshToken'] as const;

export const tokenManager = {
  /** Never persist refresh in localStorage (cookie is source of truth). */
  setTokens: (accessToken: string, _refreshToken?: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('authToken', accessToken); // Compatibilidade
    for (const key of REFRESH_LS_KEYS) {
      localStorage.removeItem(key);
    }
  },

  setAccessToken: (accessToken: string) => {
    tokenManager.setTokens(accessToken);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token') || localStorage.getItem('authToken');
  },

  /**
   * Migration bridge only — returns legacy LS refresh once; callers must clear after cookie mint.
   * New logins never write these keys.
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
  },

  clearRefreshTokens: () => {
    for (const key of REFRESH_LS_KEYS) {
      localStorage.removeItem(key);
    }
  },

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    tokenManager.clearRefreshTokens();
  },

  isAuthenticated: (): boolean => {
    return !!(localStorage.getItem('access_token') || localStorage.getItem('authToken'));
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default apiClient;
