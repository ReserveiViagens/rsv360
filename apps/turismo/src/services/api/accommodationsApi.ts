// ===================================================================
// API SERVICE - MULTI-ACOMODAÇÕES
// ===================================================================

import { api } from '../apiClient';
import type {
  Enterprise,
  Property,
  Accommodation,
  AccommodationAvailability,
  PricingRule,
  AccommodationSearchFilters,
  AccommodationSearchResult,
  PriceCalculation
} from '../../types/accommodations';

// ===================================================================
// ENTERPRISES API
// ===================================================================

export const enterprisesApi = {
  // Listar empreendimentos
  list: async (params?: {
    type?: string;
    city?: string;
    state?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<Enterprise[]>('/api/v1/enterprises', params);
    return response;
  },

  // Obter empreendimento por ID
  getById: async (id: number) => {
    const response = await api.get<Enterprise>(`/api/v1/enterprises/${id}`);
    return response;
  },

  // Criar empreendimento
  create: async (data: Partial<Enterprise>) => {
    const response = await api.post<Enterprise>('/api/v1/enterprises', data);
    return response;
  },

  // Atualizar empreendimento
  update: async (id: number, data: Partial<Enterprise>) => {
    const response = await api.put<Enterprise>(`/api/v1/enterprises/${id}`, data);
    return response;
  },

  // Deletar empreendimento
  delete: async (id: number) => {
    const response = await api.delete(`/api/v1/enterprises/${id}`);
    return response;
  },

  // Obter propriedades do empreendimento
  getProperties: async (id: number) => {
    const response = await api.get<Property[]>(`/api/v1/enterprises/${id}/properties`);
    return response;
  }
};

// ===================================================================
// PROPERTIES API
// ===================================================================

export const propertiesApi = {
  // Listar propriedades
  list: async (params?: {
    enterprise_id?: number;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<Property[]>('/api/v1/properties', params);
    return response;
  },

  // Obter propriedade por ID
  getById: async (id: number) => {
    const response = await api.get<Property>(`/api/v1/properties/${id}`);
    return response;
  },

  // Criar propriedade
  create: async (data: Partial<Property>) => {
    const response = await api.post<Property>('/api/v1/properties', data);
    return response;
  },

  // Atualizar propriedade
  update: async (id: number, data: Partial<Property>) => {
    const response = await api.put<Property>(`/api/v1/properties/${id}`, data);
    return response;
  },

  // Deletar propriedade
  delete: async (id: number) => {
    const response = await api.delete(`/api/v1/properties/${id}`);
    return response;
  },

  // Obter acomodações da propriedade
  getAccommodations: async (id: number) => {
    const response = await api.get<Accommodation[]>(`/api/v1/properties/${id}/accommodations`);
    return response;
  }
};

// ===================================================================
// ACCOMMODATIONS API
// ===================================================================

export const accommodationsApi = {
  // Listar acomodações
  list: async (params?: {
    property_id?: number;
    enterprise_id?: number;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<Accommodation[]>('/api/v1/accommodations', params);
    return response;
  },

  // Obter acomodação por ID
  getById: async (id: number) => {
    const response = await api.get<Accommodation>(`/api/v1/accommodations/${id}`);
    return response;
  },

  // Criar acomodação
  create: async (data: Partial<Accommodation>) => {
    const response = await api.post<Accommodation>('/api/v1/accommodations', data);
    return response;
  },

  // Atualizar acomodação
  update: async (id: number, data: Partial<Accommodation>) => {
    const response = await api.put<Accommodation>(`/api/v1/accommodations/${id}`, data);
    return response;
  },

  // Deletar acomodação
  delete: async (id: number) => {
    const response = await api.delete(`/api/v1/accommodations/${id}`);
    return response;
  },

  // Verificar disponibilidade
  checkAvailability: async (id: number, checkIn: string, checkOut: string) => {
    const response = await api.get<{
      isAvailable: boolean;
      hasBookings: boolean;
      availability: AccommodationAvailability[];
      checkIn: string;
      checkOut: string;
    }>(`/api/v1/accommodations/${id}/availability`, {
      check_in: checkIn,
      check_out: checkOut
    });
    return response;
  }
};

// ===================================================================
// SEARCH API
// ===================================================================

export const searchApi = {
  // Buscar acomodações disponíveis
  search: async (filters: AccommodationSearchFilters) => {
    const response = await api.get<AccommodationSearchResult[]>('/api/v1/search', filters);
    return response;
  },

  // Calcular preço
  calculatePrice: async (
    accommodationId: number,
    checkIn: string,
    checkOut: string,
    guests: number
  ) => {
    const response = await api.get<PriceCalculation>(
      `/api/v1/accommodations/${accommodationId}/price`,
      { check_in: checkIn, check_out: checkOut, guests }
    );
    return response;
  }
};
