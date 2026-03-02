import { BookingFormData } from '../../components/bookings/BookingModal';

// Tipos para a API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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

export interface BookingFilters {
  search?: string;
  status?: string;
  destination?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Dados mock para demonstração
let mockBookings: BookingFormData[] = [
  {
    customerName: 'Maria Silva',
    customerEmail: 'maria@email.com',
    customerPhone: '(11) 99999-9999',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-15',
    checkOut: '2025-01-20',
    guests: 2,
    totalPrice: 1200.00,
    status: 'confirmed',
    notes: 'Cliente VIP, preferência por quarto com vista'
  },
  {
    customerName: 'João Santos',
    customerEmail: 'joao@email.com',
    customerPhone: '(11) 88888-8888',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-18',
    checkOut: '2025-01-22',
    guests: 4,
    totalPrice: 1800.00,
    status: 'pending',
    notes: 'Família com crianças, solicita berço'
  },
  {
    customerName: 'Ana Costa',
    customerEmail: 'ana@email.com',
    customerPhone: '(11) 77777-7777',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-20',
    checkOut: '2025-01-25',
    guests: 2,
    totalPrice: 1500.00,
    status: 'confirmed',
    notes: 'Aniversário de casamento, decoração especial'
  },
  {
    customerName: 'Carlos Lima',
    customerEmail: 'carlos@email.com',
    customerPhone: '(11) 66666-6666',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-25',
    checkOut: '2025-01-30',
    guests: 3,
    totalPrice: 2100.00,
    status: 'completed',
    notes: 'Cliente recorrente, sempre satisfeito'
  },
  {
    customerName: 'Fernanda Oliveira',
    customerEmail: 'fernanda@email.com',
    customerPhone: '(11) 55555-5555',
    destination: 'Rio Quente - GO',
    checkIn: '2025-02-01',
    checkOut: '2025-02-05',
    guests: 2,
    totalPrice: 1600.00,
    status: 'confirmed',
    notes: 'Primeira vez no destino'
  },
  {
    customerName: 'Roberto Almeida',
    customerEmail: 'roberto@email.com',
    customerPhone: '(11) 44444-4444',
    destination: 'Pirenópolis - GO',
    checkIn: '2025-02-10',
    checkOut: '2025-02-15',
    guests: 6,
    totalPrice: 2400.00,
    status: 'pending',
    notes: 'Grupo de amigos, turismo cultural'
  }
];

// Simular delay de rede
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Gerar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Simular erro aleatório (para testar tratamento de erros)
const simulateRandomError = (errorRate: number = 0.1) => {
  if (Math.random() < errorRate) {
    throw new Error('Erro simulado da API - Tente novamente');
  }
};

// API de Reservas
export class BookingApi {
  // Buscar todas as reservas com filtros e paginação
  static async getBookings(filters: BookingFilters = {}): Promise<ApiResponse<PaginatedResponse<BookingFormData>>> {
    try {
      await simulateNetworkDelay();
      simulateRandomError(0.05); // 5% de chance de erro

      let filteredBookings = [...mockBookings];

      // Aplicar filtros
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredBookings = filteredBookings.filter(booking =>
          booking.customerName.toLowerCase().includes(searchLower) ||
          booking.customerEmail.toLowerCase().includes(searchLower) ||
          booking.destination.toLowerCase().includes(searchLower)
        );
      }

      if (filters.status && filters.status !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.status === filters.status);
      }

      if (filters.destination && filters.destination !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.destination === filters.destination);
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const today = new Date();
        filteredBookings = filteredBookings.filter(booking => {
          const checkIn = new Date(booking.checkIn);
          switch (filters.dateRange) {
            case 'today':
              return checkIn.toDateString() === today.toDateString();
            case 'week':
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              return checkIn >= weekAgo;
            case 'month':
              return checkIn.getMonth() === today.getMonth() && checkIn.getFullYear() === today.getFullYear();
            case 'quarter':
              const quarter = Math.floor(today.getMonth() / 3);
              const bookingQuarter = Math.floor(checkIn.getMonth() / 3);
              return bookingQuarter === quarter && checkIn.getFullYear() === today.getFullYear();
            case 'year':
              return checkIn.getFullYear() === today.getFullYear();
            default:
              return true;
          }
        });
      }

      // Aplicar ordenação
      if (filters.sortBy) {
        filteredBookings.sort((a, b) => {
          let aValue = a[filters.sortBy as keyof BookingFormData];
          let bValue = b[filters.sortBy as keyof BookingFormData];
          
          if (filters.sortBy === 'checkIn' || filters.sortBy === 'checkOut') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          }
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      // Aplicar paginação
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredBookings.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: filteredBookings.length,
            totalPages: Math.ceil(filteredBookings.length / limit)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Buscar reserva por ID
  static async getBookingById(id: string): Promise<ApiResponse<BookingFormData>> {
    try {
      await simulateNetworkDelay();
      simulateRandomError(0.05);

      const booking = mockBookings.find(b => b.id === id);
      
      if (!booking) {
        return {
          success: false,
          error: 'Reserva não encontrada'
        };
      }

      return {
        success: true,
        data: booking
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Criar nova reserva
  static async createBooking(bookingData: Omit<BookingFormData, 'id'>): Promise<ApiResponse<BookingFormData>> {
    try {
      await simulateNetworkDelay();
      simulateRandomError(0.1);

      const newBooking: BookingFormData = {
        ...bookingData,
        id: generateId()
      };

      mockBookings.push(newBooking);

      return {
        success: true,
        data: newBooking,
        message: 'Reserva criada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar reserva'
      };
    }
  }

  // Atualizar reserva existente
  static async updateBooking(id: string, bookingData: Partial<BookingFormData>): Promise<ApiResponse<BookingFormData>> {
    try {
      await simulateNetworkDelay();
      simulateRandomError(0.1);

      const index = mockBookings.findIndex(b => b.id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: 'Reserva não encontrada'
        };
      }

      const updatedBooking = { ...mockBookings[index], ...bookingData };
      mockBookings[index] = updatedBooking;

      return {
        success: true,
        data: updatedBooking,
        message: 'Reserva atualizada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar reserva'
      };
    }
  }

  // Excluir reserva
  static async deleteBooking(id: string): Promise<ApiResponse<void>> {
    try {
      await simulateNetworkDelay();
      simulateRandomError(0.1);

      const index = mockBookings.findIndex(b => b.id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: 'Reserva não encontrada'
        };
      }

      mockBookings.splice(index, 1);

      return {
        success: true,
        message: 'Reserva excluída com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao excluir reserva'
      };
    }
  }

  // Atualizar status da reserva
  static async updateBookingStatus(id: string, status: BookingFormData['status']): Promise<ApiResponse<BookingFormData>> {
    try {
      await simulateNetworkDelay();
      simulateRandomError(0.05);

      const booking = mockBookings.find(b => b.id === id);
      
      if (!booking) {
        return {
          success: false,
          error: 'Reserva não encontrada'
        };
      }

      booking.status = status;

      return {
        success: true,
        data: booking,
        message: 'Status da reserva atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar status'
      };
    }
  }

  // Buscar estatísticas das reservas
  static async getBookingStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    totalRevenue: number;
    averagePrice: number;
    topDestinations: Array<{ destination: string; count: number }>;
  }>> {
    try {
      await simulateNetworkDelay();
      simulateRandomError(0.05);

      const stats = {
        total: mockBookings.length,
        pending: mockBookings.filter(b => b.status === 'pending').length,
        confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
        cancelled: mockBookings.filter(b => b.status === 'cancelled').length,
        completed: mockBookings.filter(b => b.status === 'completed').length,
        totalRevenue: mockBookings.reduce((sum, b) => sum + b.totalPrice, 0),
        averagePrice: mockBookings.length > 0 ? mockBookings.reduce((sum, b) => sum + b.totalPrice, 0) / mockBookings.length : 0,
        topDestinations: Object.entries(
          mockBookings.reduce((acc, b) => {
            acc[b.destination] = (acc[b.destination] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
          .map(([destination, count]) => ({ destination, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
      };
    }
  }

  // Exportar reservas
  static async exportBookings(filters: BookingFilters = {}): Promise<ApiResponse<string>> {
    try {
      await simulateNetworkDelay(1000); // Simular processamento mais longo
      simulateRandomError(0.15);

      // Simular geração de arquivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `reservas_${timestamp}.csv`;

      return {
        success: true,
        data: filename,
        message: 'Arquivo exportado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao exportar reservas'
      };
    }
  }

  // Resetar dados mock (para desenvolvimento)
  static resetMockData(): void {
    mockBookings = [
      {
        customerName: 'Maria Silva',
        customerEmail: 'maria@email.com',
        customerPhone: '(11) 99999-9999',
        destination: 'Caldas Novas - GO',
        checkIn: '2025-01-15',
        checkOut: '2025-01-20',
        guests: 2,
        totalPrice: 1200.00,
        status: 'confirmed',
        notes: 'Cliente VIP, preferência por quarto com vista'
      },
      {
        customerName: 'João Santos',
        customerEmail: 'joao@email.com',
        customerPhone: '(11) 88888-8888',
        destination: 'Caldas Novas - GO',
        checkIn: '2025-01-18',
        checkOut: '2025-01-22',
        guests: 4,
        totalPrice: 1800.00,
        status: 'pending',
        notes: 'Família com crianças, solicita berço'
      }
    ];
  }
}

// Hook personalizado para usar a API
export const useBookingApi = () => {
  return {
    getBookings: BookingApi.getBookings,
    getBookingById: BookingApi.getBookingById,
    createBooking: BookingApi.createBooking,
    updateBooking: BookingApi.updateBooking,
    deleteBooking: BookingApi.deleteBooking,
    updateBookingStatus: BookingApi.updateBookingStatus,
    getBookingStats: BookingApi.getBookingStats,
    exportBookings: BookingApi.exportBookings,
    resetMockData: BookingApi.resetMockData,
  };
};
