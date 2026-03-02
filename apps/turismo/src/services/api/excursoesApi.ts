import apiClient, { api } from '../apiClient';

// Tipos para Excursões
export interface Excursao {
  id: string;
  nome: string;
  destino: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  preco: number;
  vagas_disponiveis: number;
  vagas_totais: number;
  status: 'planejamento' | 'em_andamento' | 'concluida' | 'cancelada';
  inclui_transporte: boolean;
  inclui_hospedagem: boolean;
  inclui_refeicoes: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Roteiro {
  id: string;
  excursao_id: string;
  dia: number;
  horario?: string;
  atividade: string;
  descricao?: string;
  ordem: number;
  created_at: string;
}

export interface Participante {
  id: string;
  excursao_id: string;
  user_id: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  pagamento_status: 'pendente' | 'pago' | 'parcial' | 'reembolsado';
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface ExcursaoFilters {
  search?: string;
  status?: string;
  destino?: string;
  data_inicio?: string;
  data_fim?: string;
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

// API de Excursões
export const excursoesApi = {
  // Listar excursões com filtros e paginação
  getExcursoes: async (filters: ExcursaoFilters = {}): Promise<PaginatedResponse<Excursao>> => {
    const response = await api.get<PaginatedResponse<Excursao>>('/api/v1/excursoes', filters);
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

  // Buscar excursão por ID
  getExcursaoById: async (id: string): Promise<Excursao> => {
    const response = await api.get<{ data: Excursao }>(`/api/v1/excursoes/${id}`);
    return response.data?.data || response.data as Excursao;
  },

  // Criar nova excursão
  createExcursao: async (data: Omit<Excursao, 'id' | 'created_at' | 'updated_at'>): Promise<Excursao> => {
    const response = await api.post<{ data: Excursao }>('/api/v1/excursoes', data);
    return response.data?.data || response.data as Excursao;
  },

  // Atualizar excursão
  updateExcursao: async (id: string, data: Partial<Excursao>): Promise<Excursao> => {
    const response = await api.put<{ data: Excursao }>(`/api/v1/excursoes/${id}`, data);
    return response.data?.data || response.data as Excursao;
  },

  // Deletar/Cancelar excursão
  deleteExcursao: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/excursoes/${id}`);
  },

  // Listar participantes de uma excursão
  getParticipantes: async (excursaoId: string): Promise<Participante[]> => {
    const response = await api.get<{ data: Participante[] }>(`/api/v1/excursoes/${excursaoId}/participantes`);
    return response.data?.data || [];
  },

  // Adicionar participante
  addParticipante: async (excursaoId: string, userId: string): Promise<Participante> => {
    const response = await api.post<{ data: Participante }>(`/api/v1/excursoes/${excursaoId}/participantes`, { user_id: userId });
    return response.data?.data || response.data as Participante;
  },

  // Remover participante
  removeParticipante: async (excursaoId: string, userId: string): Promise<void> => {
    await api.delete(`/api/v1/excursoes/${excursaoId}/participantes/${userId}`);
  },

  // Listar roteiros de uma excursão
  getRoteiros: async (excursaoId: string): Promise<Roteiro[]> => {
    const response = await api.get<{ data: Roteiro[] }>(`/api/v1/excursoes/${excursaoId}/roteiros`);
    return response.data?.data || [];
  },

  // Criar roteiro
  createRoteiro: async (excursaoId: string, data: Omit<Roteiro, 'id' | 'excursao_id' | 'created_at'>): Promise<Roteiro> => {
    const response = await api.post<{ data: Roteiro }>(`/api/v1/excursoes/${excursaoId}/roteiros`, data);
    return response.data?.data || response.data as Roteiro;
  },
};

