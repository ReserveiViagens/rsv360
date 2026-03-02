/**
 * ✅ FASE 1 - ETAPA 1.5: API Service Frontend - Split Payment
 * Service para comunicação com API de divisão de pagamentos
 * 
 * @module group-travel/api/split-payment.service
 */

import type { SplitPayment, PaymentSplit, CreateSplitPaymentDTO } from '../types';
import { requestWithRetry } from './wishlist.service';

// ============================================
// SPLIT PAYMENT SERVICE
// ============================================

class SplitPaymentService {
  private baseURL = '/api/bookings';
  private splitsURL = '/api/split-payments';

  /**
   * Criar divisão de pagamento
   */
  async createSplit(bookingId: string, data: CreateSplitPaymentDTO): Promise<SplitPayment> {
    const url = `${this.baseURL}/${bookingId}/split-payment`;
    return requestWithRetry<SplitPayment>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar divisão de pagamento do booking
   */
  async getBookingSplits(bookingId: string): Promise<SplitPayment | null> {
    const url = `${this.baseURL}/${bookingId}/split-payment`;
    try {
      return await requestWithRetry<SplitPayment>(url);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Marcar split como pago
   */
  async markAsPaid(
    splitId: string,
    paymentData: { method: string; transactionId?: string }
  ): Promise<PaymentSplit> {
    const url = `${this.splitsURL}/${splitId}/mark-paid`;
    return requestWithRetry<PaymentSplit>(url, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Buscar splits do usuário
   */
  async getUserSplits(
    userId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<PaymentSplit[]> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const url = `${this.splitsURL}/user/${userId}${params.toString() ? `?${params}` : ''}`;
    return requestWithRetry<PaymentSplit[]>(url);
  }

  /**
   * Obter status do split payment
   */
  async getSplitStatus(bookingId: string): Promise<{
    total: number;
    paid: number;
    pending: number;
    percentage: number;
  }> {
    const url = `${this.baseURL}/${bookingId}/split-payment/status`;
    return requestWithRetry<{ total: number; paid: number; pending: number; percentage: number }>(url);
  }

  /**
   * Enviar lembrete de pagamento
   */
  async sendReminder(splitId: string): Promise<void> {
    const url = `${this.splitsURL}/${splitId}/reminder`;
    await requestWithRetry<void>(url, {
      method: 'POST',
    });
  }
}

// Exportar instância singleton
export default new SplitPaymentService();

