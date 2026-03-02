import apiClient, { api } from '../apiClient';

// Tipos para Leilões
export interface Leilao {
  id: string;
  title: string;
  description?: string;
  property_id?: string;
  starting_price: number;
  current_price: number;
  reserve_price?: number;
  start_date: string;
  end_date: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  type: 'auction' | 'flash_deal';
  discount_percentage?: number;
  max_participants?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Lance {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  is_winning: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface LeilaoFilters {
  search?: string;
  status?: string;
  type?: 'auction' | 'flash_deal';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RelatorioFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  type?: 'auction' | 'flash_deal';
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

// API de Leilões - Usa /api/v1/auctions (backend real)
export const leiloesApi = {
  // Listar leilões com filtros e paginação
  getLeiloes: async (filters: LeilaoFilters = {}): Promise<PaginatedResponse<Leilao>> => {
    try {
      // Mapear filtros para a API de auctions
      const params: any = {};
      if (filters.status) {
        if (filters.status === 'ended') params.status = 'finished';
        else params.status = filters.status;
      }
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await api.get<any>('/api/v1/auctions', params);
      
      // A API retorna um array ou objeto com data
      let auctions: Leilao[] = [];
      if (Array.isArray(response)) {
        auctions = response.map(mapAuctionToLeilao);
      } else if (response?.data && Array.isArray(response.data)) {
        auctions = response.data.map(mapAuctionToLeilao);
      } else if (response?.auctions && Array.isArray(response.auctions)) {
        auctions = response.auctions.map(mapAuctionToLeilao);
      }

      return {
        data: auctions,
        pagination: response.pagination || {
          page: filters.page || 1,
          limit: filters.limit || 12,
          total: auctions.length,
          totalPages: Math.ceil(auctions.length / (filters.limit || 12)),
        },
      };
    } catch (error) {
      console.error('Erro ao buscar leilões:', error);
      return {
        data: [],
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 12,
          total: 0,
          totalPages: 0,
        },
      };
    }
  },

  // Buscar leilão por ID
  getLeilaoById: async (id: string): Promise<Leilao> => {
    const response = await api.get<any>(`/api/v1/auctions/${id}`);
    const auction = response.data || response;
    return mapAuctionToLeilao(auction);
  },

  // Criar novo leilão
  createLeilao: async (data: Omit<Leilao, 'id' | 'created_at' | 'updated_at'>): Promise<Leilao> => {
    const auctionData = mapLeilaoToAuction(data);
    const response = await api.post<any>('/api/v1/auctions', auctionData);
    const auction = response.data || response;
    return mapAuctionToLeilao(auction);
  },

  // Atualizar leilão
  updateLeilao: async (id: string, data: Partial<Leilao>): Promise<Leilao> => {
    const auctionData = mapLeilaoToAuction(data);
    const response = await api.put<any>(`/api/v1/auctions/${id}`, auctionData);
    const auction = response.data || response;
    return mapAuctionToLeilao(auction);
  },

  // Deletar/Cancelar leilão
  deleteLeilao: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/auctions/${id}`);
  },

  // Listar lances de um leilão
  getLances: async (auctionId: string): Promise<Lance[]> => {
    const response = await api.get<any>(`/api/v1/auctions/${auctionId}/bids`);
    const bids = response.data?.data || response.data || response;
    return Array.isArray(bids) ? bids.map(mapBidToLance) : [];
  },

  // Criar lance
  createLance: async (auctionId: string, amount: number): Promise<Lance> => {
    const response = await api.post<any>(`/api/v1/auctions/${auctionId}/bids`, { amount });
    const bid = response.data || response;
    return mapBidToLance(bid);
  },

  // Listar flash deals
  getFlashDeals: async (filters: Omit<LeilaoFilters, 'type'> = {}): Promise<PaginatedResponse<Leilao>> => {
    // Flash deals são gerenciados separadamente na API
    const response = await api.get<any>('/api/v1/flash-deals/active', filters);
    const deals = response.data || response;
    return {
      data: Array.isArray(deals) ? deals.map(mapFlashDealToLeilao) : [],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 12,
        total: Array.isArray(deals) ? deals.length : 0,
        totalPages: Math.ceil((Array.isArray(deals) ? deals.length : 0) / (filters.limit || 12)),
      },
    };
  },

  // Obter relatórios
  getRelatorios: async (filters: RelatorioFilters = {}): Promise<any> => {
    // TODO: Implementar endpoint de relatórios quando disponível
    return {
      totalAuctions: 0,
      totalRevenue: 0,
      totalBids: 0,
    };
  },
};

// Funções auxiliares para mapear entre os formatos
function mapAuctionToLeilao(auction: any): Leilao {
  return {
    id: auction.id?.toString() || '',
    title: auction.title || '',
    description: auction.description,
    property_id: auction.property_id?.toString(),
    starting_price: auction.start_price || 0,
    current_price: auction.current_price || auction.start_price || 0,
    reserve_price: auction.reserve_price,
    start_date: auction.start_date || auction.created_at,
    end_date: auction.end_date || '',
    status: mapAuctionStatus(auction.status),
    type: 'auction',
    created_by: auction.enterprise_id?.toString(),
    created_at: auction.created_at || new Date().toISOString(),
    updated_at: auction.updated_at || new Date().toISOString(),
  };
}

function mapFlashDealToLeilao(deal: any): Leilao {
  return {
    id: deal.id?.toString() || '',
    title: deal.title || '',
    description: deal.description,
    property_id: deal.property_id?.toString(),
    starting_price: deal.original_price || 0,
    current_price: deal.current_price || deal.original_price || 0,
    start_date: deal.start_date || deal.created_at,
    end_date: deal.end_date || '',
    status: mapFlashDealStatus(deal.status),
    type: 'flash_deal',
    discount_percentage: deal.discount_percentage,
    max_participants: deal.units_available,
    created_at: deal.created_at || new Date().toISOString(),
    updated_at: deal.updated_at || new Date().toISOString(),
  };
}

function mapLeilaoToAuction(leilao: any): any {
  return {
    title: leilao.title,
    description: leilao.description,
    property_id: leilao.property_id ? parseInt(leilao.property_id) : undefined,
    accommodation_id: leilao.accommodation_id ? parseInt(leilao.accommodation_id) : undefined,
    start_price: leilao.starting_price,
    reserve_price: leilao.reserve_price,
    min_increment: leilao.min_increment || 10,
    start_date: leilao.start_date,
    end_date: leilao.end_date,
  };
}

function mapBidToLance(bid: any): Lance {
  return {
    id: bid.id?.toString() || '',
    auction_id: bid.auction_id?.toString() || '',
    user_id: bid.customer_id?.toString() || '',
    amount: bid.amount || 0,
    is_winning: bid.status === 'accepted',
    created_at: bid.created_at || new Date().toISOString(),
    user_name: bid.customer_name,
    user_email: bid.customer_email,
  };
}

function mapAuctionStatus(status: string): 'scheduled' | 'active' | 'ended' | 'cancelled' {
  switch (status) {
    case 'scheduled':
      return 'scheduled';
    case 'active':
      return 'active';
    case 'finished':
      return 'ended';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'scheduled';
  }
}

function mapFlashDealStatus(status: string): 'scheduled' | 'active' | 'ended' | 'cancelled' {
  switch (status) {
    case 'scheduled':
      return 'scheduled';
    case 'active':
      return 'active';
    case 'sold_out':
    case 'expired':
      return 'ended';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'scheduled';
  }
}
