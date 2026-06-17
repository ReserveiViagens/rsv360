import { api, type ApiResponse } from '../apiClient';

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

export interface LeilaoRelatorio {
  totalAuctions: number;
  totalRevenue: number;
  totalBids: number;
}

interface AuctionApiRecord {
  id?: number | string;
  title?: string;
  description?: string;
  property_id?: number | string;
  start_price?: number;
  current_price?: number;
  reserve_price?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  enterprise_id?: number | string;
  created_at?: string;
  updated_at?: string;
}

interface FlashDealApiRecord {
  id?: number | string;
  title?: string;
  description?: string;
  property_id?: number | string;
  original_price?: number;
  current_price?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  discount_percentage?: number;
  units_available?: number;
  created_at?: string;
  updated_at?: string;
}

interface BidApiRecord {
  id?: number | string;
  auction_id?: number | string;
  customer_id?: number | string;
  amount?: number;
  status?: string;
  created_at?: string;
  customer_name?: string;
  customer_email?: string;
}

type AuctionPayload = Partial<Omit<Leilao, 'id' | 'created_at' | 'updated_at'>> & {
  accommodation_id?: number | string;
  min_increment?: number;
};

function extractAuctionList(response: ApiResponse<AuctionApiRecord[]>): AuctionApiRecord[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response.auctions)) {
    return response.auctions as AuctionApiRecord[];
  }
  return [];
}

// API de Leilões - Usa /api/v1/auctions (backend real)
export const leiloesApi = {
  // Listar leilões com filtros e paginação
  getLeiloes: async (filters: LeilaoFilters = {}): Promise<PaginatedResponse<Leilao>> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters.status) {
        params.status = filters.status === 'ended' ? 'finished' : filters.status;
      }
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await api.get<AuctionApiRecord[]>('/api/v1/auctions', params);
      const auctions = extractAuctionList(response).map(mapAuctionToLeilao);

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
    const response = await api.get<AuctionApiRecord>(`/api/v1/auctions/${id}`);
    const auction = response.data ?? (response as unknown as AuctionApiRecord);
    return mapAuctionToLeilao(auction);
  },

  // Criar novo leilão
  createLeilao: async (data: Omit<Leilao, 'id' | 'created_at' | 'updated_at'>): Promise<Leilao> => {
    const auctionData = mapLeilaoToAuction(data);
    const response = await api.post<AuctionApiRecord>('/api/v1/auctions', auctionData);
    const auction = response.data ?? (response as unknown as AuctionApiRecord);
    return mapAuctionToLeilao(auction);
  },

  // Atualizar leilão
  updateLeilao: async (id: string, data: Partial<Leilao>): Promise<Leilao> => {
    const auctionData = mapLeilaoToAuction(data);
    const response = await api.put<AuctionApiRecord>(`/api/v1/auctions/${id}`, auctionData);
    const auction = response.data ?? (response as unknown as AuctionApiRecord);
    return mapAuctionToLeilao(auction);
  },

  // Deletar/Cancelar leilão
  deleteLeilao: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/auctions/${id}`);
  },

  // Listar lances de um leilão
  getLances: async (auctionId: string): Promise<Lance[]> => {
    const response = await api.get<BidApiRecord[]>(`/api/v1/auctions/${auctionId}/bids`);
    const bids = response.data ?? [];
    return Array.isArray(bids) ? bids.map(mapBidToLance) : [];
  },

  // Criar lance
  createLance: async (auctionId: string, amount: number): Promise<Lance> => {
    const response = await api.post<BidApiRecord>(`/api/v1/auctions/${auctionId}/bids`, { amount });
    const bid = response.data ?? (response as unknown as BidApiRecord);
    return mapBidToLance(bid);
  },

  // Listar flash deals
  getFlashDeals: async (filters: Omit<LeilaoFilters, 'type'> = {}): Promise<PaginatedResponse<Leilao>> => {
    const params: Record<string, unknown> = { ...filters };
    const response = await api.get<FlashDealApiRecord[]>('/api/v1/flash-deals/active', params);
    const deals = response.data ?? [];
    const mapped = Array.isArray(deals) ? deals.map(mapFlashDealToLeilao) : [];
    return {
      data: mapped,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 12,
        total: mapped.length,
        totalPages: Math.ceil(mapped.length / (filters.limit || 12)),
      },
    };
  },

  // Obter relatórios
  getRelatorios: async (_filters: RelatorioFilters = {}): Promise<LeilaoRelatorio> => {
    return {
      totalAuctions: 0,
      totalRevenue: 0,
      totalBids: 0,
    };
  },
};

function mapAuctionToLeilao(auction: AuctionApiRecord): Leilao {
  return {
    id: auction.id?.toString() || '',
    title: auction.title || '',
    description: auction.description,
    property_id: auction.property_id?.toString(),
    starting_price: auction.start_price || 0,
    current_price: auction.current_price || auction.start_price || 0,
    reserve_price: auction.reserve_price,
    start_date: auction.start_date || auction.created_at || '',
    end_date: auction.end_date || '',
    status: mapAuctionStatus(auction.status || ''),
    type: 'auction',
    created_by: auction.enterprise_id?.toString(),
    created_at: auction.created_at || new Date().toISOString(),
    updated_at: auction.updated_at || new Date().toISOString(),
  };
}

function mapFlashDealToLeilao(deal: FlashDealApiRecord): Leilao {
  return {
    id: deal.id?.toString() || '',
    title: deal.title || '',
    description: deal.description,
    property_id: deal.property_id?.toString(),
    starting_price: deal.original_price || 0,
    current_price: deal.current_price || deal.original_price || 0,
    start_date: deal.start_date || deal.created_at || '',
    end_date: deal.end_date || '',
    status: mapFlashDealStatus(deal.status || ''),
    type: 'flash_deal',
    discount_percentage: deal.discount_percentage,
    max_participants: deal.units_available,
    created_at: deal.created_at || new Date().toISOString(),
    updated_at: deal.updated_at || new Date().toISOString(),
  };
}

function mapLeilaoToAuction(leilao: AuctionPayload): Record<string, unknown> {
  return {
    title: leilao.title,
    description: leilao.description,
    property_id: leilao.property_id ? parseInt(String(leilao.property_id), 10) : undefined,
    accommodation_id: leilao.accommodation_id ? parseInt(String(leilao.accommodation_id), 10) : undefined,
    start_price: leilao.starting_price,
    reserve_price: leilao.reserve_price,
    min_increment: leilao.min_increment || 10,
    start_date: leilao.start_date,
    end_date: leilao.end_date,
  };
}

function mapBidToLance(bid: BidApiRecord): Lance {
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
