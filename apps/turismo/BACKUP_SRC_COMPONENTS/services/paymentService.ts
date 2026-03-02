import { api, ApiResponse } from './apiClient';
import { toast } from 'react-hot-toast';

// Types
export interface Payment {
  id: number;
  booking_id?: number;
  user_id: number;
  transaction_id: string;
  external_transaction_id?: string;
  gateway_transaction_id?: string;
  type: 'payment' | 'refund';
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'cash' | 'voucher';
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  fee_amount: number;
  net_amount: number;
  installments: number;
  description: string;
  card_last_four?: string;
  card_brand?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  failed_at?: string;
  
  // Joined fields
  user_name?: string;
  user_email?: string;
  booking_number?: string;
  booking_title?: string;
}

export interface PaymentFilters {
  status?: string[];
  type?: string[];
  method?: string[];
  start_date?: string;
  end_date?: string;
  user_id?: number;
  booking_id?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreatePaymentData {
  booking_id?: number;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'cash' | 'voucher';
  installments?: number;
  description?: string;
  card_data?: {
    number?: string;
    brand?: string;
    holder_name?: string;
    expiry_month?: string;
    expiry_year?: string;
    cvv?: string;
  };
}

export interface PaymentStats {
  total_transactions: number;
  completed_payments: number;
  failed_payments: number;
  total_refunds: number;
  total_revenue: number;
  total_refunded: number;
  total_fees: number;
  average_transaction: number;
  methodStats: Array<{
    method: string;
    count: number;
    total_amount: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface PaginatedPayments {
  payments: Payment[];
  pagination: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface RefundData {
  amount?: number;
  reason?: string;
}

// Payment Service
export const paymentService = {
  // Get all payments with filters
  async getPayments(filters: PaymentFilters = {}): Promise<PaginatedPayments> {
    try {
      const response = await api.get<PaginatedPayments>('/api/payments', filters);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao buscar pagamentos');
    } catch (error: any) {
      console.error('Get payments error:', error);
      throw error;
    }
  },

  // Get payment by ID
  async getPayment(id: number): Promise<Payment> {
    try {
      const response = await api.get<Payment>(`/api/payments/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao buscar pagamento');
    } catch (error: any) {
      console.error('Get payment error:', error);
      throw error;
    }
  },

  // Process payment
  async processPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      // Show processing toast
      const loadingToast = toast.loading('Processando pagamento...');
      
      const response = await api.post<Payment>('/api/payments', data);
      
      toast.dismiss(loadingToast);
      
      if (response.success && response.data) {
        if (response.data.status === 'completed') {
          toast.success('Pagamento processado com sucesso!');
        } else if (response.data.status === 'processing') {
          toast.info('Pagamento em processamento...');
        }
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao processar pagamento');
    } catch (error: any) {
      console.error('Process payment error:', error);
      throw error;
    }
  },

  // Refund payment (admin/manager only)
  async refundPayment(id: number, data: RefundData = {}): Promise<Payment> {
    try {
      const loadingToast = toast.loading('Processando estorno...');
      
      const response = await api.post<Payment>(`/api/payments/${id}/refund`, data);
      
      toast.dismiss(loadingToast);
      
      if (response.success && response.data) {
        toast.success('Estorno processado com sucesso!');
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao processar estorno');
    } catch (error: any) {
      console.error('Refund payment error:', error);
      throw error;
    }
  },

  // Get payment statistics (admin/manager only)
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const response = await api.get<PaymentStats>('/api/payments/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erro ao buscar estatísticas');
    } catch (error: any) {
      console.error('Get payment stats error:', error);
      throw error;
    }
  },

  // Helper functions
  formatPaymentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      processing: 'Processando',
      completed: 'Concluído',
      failed: 'Falhou',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || status;
  },

  formatPaymentMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      bank_transfer: 'Transferência Bancária',
      pix: 'PIX',
      cash: 'Dinheiro',
      voucher: 'Voucher',
    };
    return methodMap[method] || method;
  },

  formatPaymentType(type: string): string {
    const typeMap: { [key: string]: string } = {
      payment: 'Pagamento',
      refund: 'Estorno',
    };
    return typeMap[type] || type;
  },

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      processing: 'yellow',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
    };
    return colorMap[status] || 'gray';
  },

  getMethodIcon(method: string): string {
    const iconMap: { [key: string]: string } = {
      credit_card: '💳',
      debit_card: '💳',
      bank_transfer: '🏦',
      pix: '⚡',
      cash: '💵',
      voucher: '🎫',
    };
    return iconMap[method] || '💳';
  },

  // Format currency
  formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Calculate fee percentage
  calculateFeePercentage(amount: number, feeAmount: number): number {
    if (amount === 0) return 0;
    return (feeAmount / amount) * 100;
  },

  // Validate card number (basic Luhn algorithm)
  validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and non-digits
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit = digit % 10 + 1;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Get card brand from number
  getCardBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    if (/^(?:2131|1800|35\d{3})\d{11}$/.test(digits)) return 'jcb';
    
    return 'unknown';
  },

  // Format card number for display
  formatCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  },

  // Mask card number for security
  maskCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4) return cardNumber;
    
    const lastFour = digits.slice(-4);
    const masked = '*'.repeat(digits.length - 4);
    return this.formatCardNumber(masked + lastFour);
  },

  // Validate expiry date
  validateExpiryDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get 2-digit year
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  },

  // Calculate installment amount
  calculateInstallmentAmount(totalAmount: number, installments: number, feeRate: number = 0): number {
    const amountWithFee = totalAmount * (1 + feeRate);
    return amountWithFee / installments;
  },

  // Export payments to CSV
  async exportPayments(filters: PaymentFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/api/payments/export', {
        ...filters,
        format: 'csv',
      });
      
      // Convert response to blob
      const blob = new Blob([response.data], { type: 'text/csv' });
      return blob;
    } catch (error: any) {
      console.error('Export payments error:', error);
      throw error;
    }
  },

  // Generate payment receipt
  async generateReceipt(paymentId: number): Promise<Blob> {
    try {
      const response = await api.get(`/api/payments/${paymentId}/receipt`, {
        responseType: 'blob',
      });
      
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error: any) {
      console.error('Generate receipt error:', error);
      throw error;
    }
  },
};

export default paymentService;
