import apiClient, { api } from '../apiClient';

// Tipos para Viagens em Grupo
export interface Grupo {
  id: string;
  nome: string;
  destino: string;
  descricao?: string;
  data_prevista?: string;
  limite_participantes?: number;
  privacidade: 'publico' | 'privado' | 'somente_convite';
  status: 'formando' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Membro {
  id: string;
  grupo_id: string;
  user_id: string;
  role: 'admin' | 'membro';
  status: 'ativo' | 'inativo' | 'removido';
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export interface WishlistItem {
  id: string;
  grupo_id: string;
  user_id: string;
  item_tipo: string;
  item_id?: string;
  descricao: string;
  votos: number;
  created_at: string;
  user_name?: string;
}

export interface PagamentoDividido {
  id: string;
  grupo_id: string;
  descricao: string;
  valor_total: number;
  valor_por_pessoa?: number;
  status: 'pendente' | 'pago' | 'parcial' | 'cancelado';
  created_by?: string;
  created_at: string;
}

export interface GrupoFilters {
  search?: string;
  status?: string;
  destino?: string;
  data_prevista?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API de Viagens em Grupo
export const viagensGrupoApi = {
  // Listar grupos com filtros e paginação
  getGrupos: async (filters: GrupoFilters = {}): Promise<PaginatedResponse<Grupo>> => {
    const response = await api.get<PaginatedResponse<Grupo>>('/api/v1/viagens-grupo', filters);
    // O api.get já retorna response.data, então response já é o objeto {success, data, pagination}
    // Se response tem a estrutura esperada, retornar diretamente
    if (response && typeof response === 'object' && 'data' in response) {
      return {
        data: Array.isArray(response.data) ? response.data : [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
    // Fallback caso a estrutura seja diferente
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },

  // Buscar grupo por ID
  getGrupoById: async (id: string): Promise<Grupo> => {
    const response = await api.get<{ data: Grupo }>(`/api/v1/viagens-grupo/${id}`);
    return response.data?.data || response.data as Grupo;
  },

  // Criar novo grupo
  createGrupo: async (data: Omit<Grupo, 'id' | 'created_at' | 'updated_at'>): Promise<Grupo> => {
    const response = await api.post<{ data: Grupo }>('/api/v1/viagens-grupo', data);
    return response.data?.data || response.data as Grupo;
  },

  // Atualizar grupo
  updateGrupo: async (id: string, data: Partial<Grupo>): Promise<Grupo> => {
    const response = await api.put<{ data: Grupo }>(`/api/v1/viagens-grupo/${id}`, data);
    return response.data?.data || response.data as Grupo;
  },

  // Deletar grupo
  deleteGrupo: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/viagens-grupo/${id}`);
  },

  // Listar wishlists de um grupo
  getWishlists: async (grupoId: string): Promise<WishlistItem[]> => {
    try {
      const response = await api.get<{ data: WishlistItem[] }>(`/api/v1/viagens-grupo/${grupoId}/wishlists`);
      // O api.get já retorna response.data, então response já é o objeto {success, data}
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      // Fallback caso a estrutura seja diferente
      return [];
    } catch (error) {
      console.error('Erro ao carregar wishlists:', error);
      return [];
    }
  },

  // Adicionar item à wishlist
  addWishlistItem: async (grupoId: string, item: Omit<WishlistItem, 'id' | 'grupo_id' | 'votos' | 'created_at'>): Promise<WishlistItem> => {
    const response = await api.post<{ data: WishlistItem }>(`/api/v1/viagens-grupo/${grupoId}/wishlists`, item);
    return response.data?.data || response.data as WishlistItem;
  },

  // Listar pagamentos divididos de um grupo
  getPagamentos: async (grupoId: string): Promise<PagamentoDividido[]> => {
    try {
      const response = await api.get<{ data: PagamentoDividido[] }>(`/api/v1/viagens-grupo/${grupoId}/pagamentos`);
      // O api.get já retorna response.data, então response já é o objeto {success, data}
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      // Fallback caso a estrutura seja diferente
      return [];
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      return [];
    }
  },

  // Criar pagamento dividido
  createPagamentoDividido: async (grupoId: string, data: Omit<PagamentoDividido, 'id' | 'grupo_id' | 'created_at'>): Promise<PagamentoDividido> => {
    const response = await api.post<{ data: PagamentoDividido }>(`/api/v1/viagens-grupo/${grupoId}/pagamentos`, data);
    return response.data?.data || response.data as PagamentoDividido;
  },
};

