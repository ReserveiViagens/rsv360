import { api, ApiResponse } from './apiClient';
import { toast } from 'react-hot-toast';

// Types
export interface Booking {
  id: number;
  user_id: number;
  booking_number: string;
  title: string;
  description?: string;
  type: 'hotel' | 'flight' | 'car' | 'tour' | 'package' | 'activity';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  total_amount: number;
  currency: string;
  paid_amount: number;
  pending_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  guests_count: number;
  adults_count: number;
  children_count: number;
  guest_details?: any[];
  special_requests?: string[];
  provider_name?: string;
  cancellation_fee?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  user_name?: string;
  user_email?: string;
}

export interface BookingFilters {
  status?: string[];
  type?: string[];
  start_date?: string;
  end_date?: string;
  user_id?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateBookingData {
  title: string;
  description?: string;
  type: 'hotel' | 'flight' | 'car' | 'tour' | 'package' | 'activity';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  total_amount?: number;
  currency?: string;
  guests_count?: number;
  adults_count?: number;
  children_count?: number;
  guest_details?: any[];
  special_requests?: string[];
  provider_name?: string;
  user_id?: number;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
}

export interface BookingStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  paid_revenue: number;
  average_booking_value: number;
  monthlyTrend: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  popularTypes: Array<{
    type: string;
    count: number;
  }>;
}

export interface PaginatedBookings {
  bookings: Booking[];
  pagination: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

// Booking Service
export const bookingService = {
  // Get all bookings with filters
  async getBookings(filters: BookingFilters = {}): Promise<PaginatedBookings> {
    try {
      const response = await api.get<PaginatedBookings>('/api/bookings', filters);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao buscar reservas');
    } catch (error: any) {
      console.error('Get bookings error:', error);
      throw error;
    }
  },

  // Get booking by ID
  async getBooking(id: number): Promise<Booking> {
    try {
      const response = await api.get<Booking>(`/api/bookings/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao buscar reserva');
    } catch (error: any) {
      console.error('Get booking error:', error);
      throw error;
    }
  },

  // Create new booking
  async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      const response = await api.post<Booking>('/api/bookings', data);
      
      if (response.success && response.data) {
        toast.success('Reserva criada com sucesso!');
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao criar reserva');
    } catch (error: any) {
      console.error('Create booking error:', error);
      throw error;
    }
  },

  // Update booking
  async updateBooking(id: number, data: UpdateBookingData): Promise<Booking> {
    try {
      const response = await api.put<Booking>(`/api/bookings/${id}`, data);
      
      if (response.success && response.data) {
        toast.success('Reserva atualizada com sucesso!');
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao atualizar reserva');
    } catch (error: any) {
      console.error('Update booking error:', error);
      throw error;
    }
  },

  // Cancel booking
  async cancelBooking(id: number, reason?: string): Promise<{ cancellation_fee: number; refund_amount: number }> {
    try {
      const response = await api.post<{ cancellation_fee: number; refund_amount: number }>(`/api/bookings/${id}/cancel`, {
        cancellation_reason: reason,
      });
      
      if (response.success && response.data) {
        toast.success('Reserva cancelada com sucesso!');
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao cancelar reserva');
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  },

  // Delete booking (admin only)
  async deleteBooking(id: number): Promise<void> {
    try {
      const response = await api.delete(`/api/bookings/${id}`);
      
      if (response.success) {
        toast.success('Reserva deletada com sucesso!');
      } else {
        throw new Error(response.message || 'Erro ao deletar reserva');
      }
    } catch (error: any) {
      console.error('Delete booking error:', error);
      throw error;
    }
  },

  // Get booking statistics (admin/manager only)
  async getBookingStats(): Promise<BookingStats> {
    try {
      const response = await api.get<BookingStats>('/api/bookings/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao buscar estatísticas');
    } catch (error: any) {
      console.error('Get booking stats error:', error);
      throw error;
    }
  },

  // Helper functions
  formatBookingStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada',
    };
    return statusMap[status] || status;
  },

  formatBookingType(type: string): string {
    const typeMap: { [key: string]: string } = {
      hotel: 'Hotel',
      flight: 'Voo',
      car: 'Carro',
      tour: 'Tour',
      package: 'Pacote',
      activity: 'Atividade',
    };
    return typeMap[type] || type;
  },

  formatPaymentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendente',
      partial: 'Parcial',
      paid: 'Pago',
      refunded: 'Reembolsado',
    };
    return statusMap[status] || status;
  },

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'yellow',
      confirmed: 'blue',
      in_progress: 'purple',
      completed: 'green',
      cancelled: 'red',
      refunded: 'gray',
    };
    return colorMap[status] || 'gray';
  },

  getPaymentStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'red',
      partial: 'yellow',
      paid: 'green',
      refunded: 'gray',
    };
    return colorMap[status] || 'gray';
  },

  // Calculate booking duration in days
  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Format currency
  formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Validate booking dates
  validateBookingDates(startDate: string, endDate: string): { valid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return { valid: false, error: 'Data de início não pode ser no passado' };
    }

    if (start >= end) {
      return { valid: false, error: 'Data de fim deve ser após a data de início' };
    }

    return { valid: true };
  },

  // Export bookings to CSV
  async exportBookings(filters: BookingFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/api/bookings/export', {
        ...filters,
        format: 'csv',
      });
      
      // Convert response to blob
      const blob = new Blob([response.data], { type: 'text/csv' });
      return blob;
    } catch (error: any) {
      console.error('Export bookings error:', error);
      throw error;
    }
  },
};

export default bookingService;
