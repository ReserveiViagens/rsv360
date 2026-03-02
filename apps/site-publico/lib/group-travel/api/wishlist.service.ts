/**
 * ✅ FASE 1 - ETAPA 1.5: API Service Frontend - Wishlist
 * Service para comunicação com API de wishlists
 * 
 * @module group-travel/api/wishlist.service
 */

import type {
  SharedWishlist,
  WishlistItem,
  CreateWishlistDTO,
  UpdateWishlistDTO,
  AddItemDTO,
  WishlistQuery,
  Property
} from '../types';

// ============================================
// ERROR CLASSES
// ============================================

export class UnauthorizedError extends Error {
  constructor(message = 'Não autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Não encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message = 'Erro de validação', public errors?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ServerError extends Error {
  constructor(message = 'Erro no servidor') {
    super(message);
    this.name = 'ServerError';
  }
}

// ============================================
// API CLIENT HELPER
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Obter token de autenticação
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('access_token');
}

/**
 * Fazer requisição com retry automático
 */
export async function requestWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const token = getAuthToken();
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      // Tratar erros HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        switch (response.status) {
          case 401:
            throw new UnauthorizedError(errorData.message || 'Não autorizado');
          case 403:
            throw new ForbiddenError(errorData.message || 'Acesso negado');
          case 404:
            throw new NotFoundError(errorData.message || 'Não encontrado');
          case 422:
            throw new ValidationError(errorData.message || 'Erro de validação', errorData.errors);
          case 500:
          case 502:
          case 503:
          case 504:
            // Retry para erros 5xx
            if (attempt < retries) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, delay));
              lastError = new ServerError(errorData.message || 'Erro no servidor');
              continue;
            }
            throw new ServerError(errorData.message || 'Erro no servidor');
          default:
            throw new Error(errorData.message || `Erro HTTP ${response.status}`);
        }
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      lastError = error as Error;
      
      // Se não for erro 5xx, não retry
      if (!(error instanceof ServerError) && attempt < retries) {
        break;
      }
      
      // Última tentativa
      if (attempt === retries) {
        throw error;
      }
      
      // Delay antes de retry
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Erro desconhecido');
}

// ============================================
// WISHLIST SERVICE
// ============================================

class WishlistService {
  private baseURL = '/api/wishlists';

  /**
   * Listar todas as wishlists
   */
  async getAll(query?: WishlistQuery): Promise<{ wishlists: SharedWishlist[]; total: number }> {
    const params = new URLSearchParams();
    
    if (query?.userId) params.append('userId', query.userId);
    if (query?.privacy) params.append('privacy', query.privacy);
    if (query?.search) params.append('search', query.search);
    if (query?.createdBy) params.append('createdBy', query.createdBy);
    if (query?.memberId) params.append('memberId', query.memberId);

    const url = `${this.baseURL}${params.toString() ? `?${params}` : ''}`;
    return requestWithRetry<{ wishlists: SharedWishlist[]; total: number }>(url);
  }

  /**
   * Buscar wishlist por ID
   */
  async getById(id: string): Promise<SharedWishlist> {
    const url = `${this.baseURL}/${id}`;
    return requestWithRetry<SharedWishlist>(url);
  }

  /**
   * Criar nova wishlist
   */
  async create(data: CreateWishlistDTO): Promise<SharedWishlist> {
    const url = this.baseURL;
    return requestWithRetry<SharedWishlist>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar wishlist
   */
  async update(id: string, data: UpdateWishlistDTO): Promise<SharedWishlist> {
    const url = `${this.baseURL}/${id}`;
    return requestWithRetry<SharedWishlist>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletar wishlist
   */
  async delete(id: string): Promise<void> {
    const url = `${this.baseURL}/${id}`;
    await requestWithRetry<void>(url, {
      method: 'DELETE',
    });
  }

  /**
   * Adicionar item à wishlist
   */
  async addItem(wishlistId: string, data: AddItemDTO): Promise<WishlistItem> {
    const url = `${this.baseURL}/${wishlistId}/items`;
    return requestWithRetry<WishlistItem>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Remover item da wishlist
   */
  async removeItem(wishlistId: string, itemId: string): Promise<void> {
    const url = `${this.baseURL}/${wishlistId}/items/${itemId}`;
    await requestWithRetry<void>(url, {
      method: 'DELETE',
    });
  }

  /**
   * Convidar membro para wishlist
   */
  async inviteMember(wishlistId: string, email: string, role: string): Promise<void> {
    const url = `${this.baseURL}/${wishlistId}/invite`;
    await requestWithRetry<void>(url, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  /**
   * Remover membro da wishlist
   */
  async removeMember(wishlistId: string, memberId: string): Promise<void> {
    const url = `${this.baseURL}/${wishlistId}/members/${memberId}`;
    await requestWithRetry<void>(url, {
      method: 'DELETE',
    });
  }

  /**
   * Buscar wishlist com propriedades populadas
   */
  async getWithProperty(id: string): Promise<{ wishlist: SharedWishlist; properties: Property[] }> {
    const url = `${this.baseURL}/${id}/with-property`;
    return requestWithRetry<{ wishlist: SharedWishlist; properties: Property[] }>(url);
  }
}

// Exportar instância singleton
export default new WishlistService();

