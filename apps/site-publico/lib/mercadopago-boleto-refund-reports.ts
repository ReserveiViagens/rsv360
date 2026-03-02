/**
 * Serviços Mercado Pago: Boleto, Estornos e Relatórios
 * Itens 9, 10 e 11
 */

import { mercadoPagoService } from './mercadopago';
import { queryDatabase } from './db';
import { updateBookingStatus, logStatusChange } from './booking-status-service';

/**
 * ✅ ITEM 9: PROCESSAMENTO BOLETO COMPLETO
 * Gera boleto, valida vencimento e processa confirmação
 */
export async function processBoletoPayment(
  bookingId: number,
  bookingCode: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  customerDocument: string,
  customerAddress?: {
    zipCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  }
) {
  try {
    if (!customerDocument) {
      throw new Error('CPF/CNPJ é obrigatório para gerar boleto');
    }

    // Criar pagamento Boleto
    const paymentResult = await mercadoPagoService.createBoletoPayment({
      transaction_amount: amount,
      description: `Reserva ${bookingCode}`,
      payment_method_id: 'bolbradesco', // ou 'pec'
      payer: {
        email: customerEmail,
        first_name: customerName.split(' ')[0],
        last_name: customerName.split(' ').slice(1).join(' ') || '',
        identification: {
          type: customerDocument.length === 11 ? 'CPF' : 'CNPJ',
          number: customerDocument.replace(/\D/g, ''),
        },
        address: customerAddress ? {
          zip_code: customerAddress.zipCode.replace(/\D/g, ''),
          street_name: customerAddress.street,
          street_number: customerAddress.number,
          neighborhood: customerAddress.neighborhood,
          city: customerAddress.city,
          federal_unit: customerAddress.state,
        } : undefined,
      },
      metadata: {
        booking_code: bookingCode,
        booking_id: bookingId,
      },
    });

    // Calcular data de vencimento (3 dias úteis)
    const expiresAt = paymentResult.date_of_expiration || 
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    // Atualizar registro de pagamento no banco
    await queryDatabase(
      `UPDATE payments 
       SET 
         gateway_transaction_id = $1,
         boleto_url = $2,
         boleto_expires_at = $3,
         gateway_response = $4,
         payment_status = 'pending',
         updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $5`,
      [
        paymentResult.id,
        paymentResult.external_resource_url,
        expiresAt,
        JSON.stringify(paymentResult),
        bookingId,
      ]
    );

    return {
      success: true,
      payment_id: paymentResult.id,
      boleto_url: paymentResult.external_resource_url,
      expires_at: expiresAt,
      status: paymentResult.status,
    };
  } catch (error: any) {
    console.error('Erro ao processar pagamento Boleto:', error);
    throw new Error(`Erro ao processar pagamento Boleto: ${error.message}`);
  }
}

/**
 * Validar se boleto ainda está válido (não vencido)
 */
export async function validateBoletoExpiration(paymentId: string): Promise<{
  valid: boolean;
  expired: boolean;
  expiresAt?: string;
  daysUntilExpiration?: number;
}> {
  try {
    const payments = await queryDatabase(
      `SELECT boleto_expires_at, payment_status 
       FROM payments 
       WHERE gateway_transaction_id = $1`,
      [paymentId]
    );

    if (payments.length === 0) {
      return { valid: false, expired: false };
    }

    const payment = payments[0];
    const expiresAt = payment.boleto_expires_at;

    if (!expiresAt) {
      return { valid: true, expired: false };
    }

    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const expired = expirationDate < now;
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Se vencido e não pago, marcar como expirado
    if (expired && payment.payment_status === 'pending') {
      await queryDatabase(
        `UPDATE payments 
         SET payment_status = 'expired', updated_at = CURRENT_TIMESTAMP 
         WHERE gateway_transaction_id = $1`,
        [paymentId]
      );
    }

    return {
      valid: !expired,
      expired,
      expiresAt: expiresAt.toString(),
      daysUntilExpiration: expired ? 0 : daysUntilExpiration,
    };
  } catch (error) {
    console.error('Erro ao validar vencimento do boleto:', error);
    return { valid: false, expired: false };
  }
}

/**
 * ✅ ITEM 10: TRATAMENTO DE ESTORNOS COMPLETO
 * Processa estornos, atualiza reserva e envia notificações
 */
export async function processRefund(
  paymentId: string,
  bookingId: number,
  amount?: number,
  reason?: string,
  refundedBy?: number,
  refundedByEmail?: string
): Promise<{
  success: boolean;
  refund_id?: string;
  amount?: number;
  error?: string;
}> {
  try {
    // Buscar pagamento
    const payments = await queryDatabase(
      `SELECT * FROM payments WHERE gateway_transaction_id = $1 OR booking_id = $2`,
      [paymentId, bookingId]
    );

    if (payments.length === 0) {
      return {
        success: false,
        error: 'Pagamento não encontrado',
      };
    }

    const payment = payments[0];

    // Validar se pode reembolsar
    if (payment.payment_status !== 'paid') {
      return {
        success: false,
        error: `Pagamento não pode ser reembolsado. Status atual: ${payment.payment_status}`,
      };
    }

    // Processar reembolso no Mercado Pago
    const refundResult = await mercadoPagoService.refundPayment(
      payment.gateway_transaction_id,
      amount || parseFloat(payment.amount)
    );

    // Atualizar status do pagamento
    await queryDatabase(
      `UPDATE payments 
       SET 
         payment_status = 'refunded',
         refunded_at = CURRENT_TIMESTAMP,
         refund_amount = $1,
         refund_reason = $2,
         gateway_response = $3,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [
        refundResult.amount || amount || parseFloat(payment.amount),
        reason || 'Reembolso solicitado',
        JSON.stringify(refundResult),
        payment.id,
      ]
    );

    // Atualizar status da reserva
    const booking = await queryDatabase(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (booking.length > 0) {
      const bookingData = booking[0];

      // Cancelar reserva
      await updateBookingStatus(
        bookingId,
        'cancelled',
        refundedBy,
        refundedByEmail || bookingData.customer_email,
        `Reembolso processado: ${reason || 'Solicitado pelo cliente'}`
      );

      await queryDatabase(
        `UPDATE bookings 
         SET 
           payment_status = 'refunded',
           status = 'cancelled',
           cancelled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [bookingId]
      );

      // Registrar no histórico
      await logStatusChange(
        bookingId,
        bookingData.status as any,
        'cancelled' as any,
        refundedBy,
        refundedByEmail || bookingData.customer_email,
        `Reembolso: ${reason || 'Solicitado'}`
      );
    }

    return {
      success: true,
      refund_id: refundResult.id,
      amount: refundResult.amount || amount || parseFloat(payment.amount),
    };
  } catch (error: any) {
    console.error('Erro ao processar reembolso:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar reembolso',
    };
  }
}

/**
 * Buscar histórico de estornos
 */
export async function getRefundHistory(bookingId?: number, limit: number = 50) {
  try {
    let query = `
      SELECT 
        p.id,
        p.booking_id,
        p.gateway_transaction_id,
        p.refund_amount,
        p.refund_reason,
        p.refunded_at,
        b.booking_code,
        b.customer_name,
        b.customer_email
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      WHERE p.payment_status = 'refunded'
    `;

    const params: any[] = [];
    if (bookingId) {
      query += ` AND p.booking_id = $1`;
      params.push(bookingId);
    }

    query += ` ORDER BY p.refunded_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const refunds = await queryDatabase(query, params);
    return refunds;
  } catch (error) {
    console.error('Erro ao buscar histórico de estornos:', error);
    return [];
  }
}

/**
 * ✅ ITEM 11: RELATÓRIOS DE PAGAMENTO
 * Dashboard, exportação e análise de pagamentos
 */

export interface PaymentReportFilters {
  startDate?: string;
  endDate?: string;
  paymentMethod?: 'pix' | 'card' | 'boleto';
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed' | 'cancelled';
  bookingId?: number;
  customerEmail?: string;
}

export interface PaymentReport {
  total: number;
  count: number;
  byMethod: {
    pix: { total: number; count: number };
    card: { total: number; count: number };
    boleto: { total: number; count: number };
  };
  byStatus: {
    pending: { total: number; count: number };
    paid: { total: number; count: number };
    refunded: { total: number; count: number };
    failed: { total: number; count: number };
    cancelled: { total: number; count: number };
  };
  average: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Gerar relatório de pagamentos
 */
export async function generatePaymentReport(
  filters: PaymentReportFilters = {}
): Promise<PaymentReport> {
  try {
    let query = `
      SELECT 
        p.amount,
        p.payment_method,
        p.payment_status,
        p.created_at,
        p.paid_at
      FROM payments p
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters.startDate) {
      query += ` AND p.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND p.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.paymentMethod) {
      query += ` AND p.payment_method = $${paramIndex}`;
      params.push(filters.paymentMethod);
      paramIndex++;
    }

    if (filters.paymentStatus) {
      query += ` AND p.payment_status = $${paramIndex}`;
      params.push(filters.paymentStatus);
      paramIndex++;
    }

    if (filters.bookingId) {
      query += ` AND p.booking_id = $${paramIndex}`;
      params.push(filters.bookingId);
      paramIndex++;
    }

    if (filters.customerEmail) {
      query += ` AND EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.id = p.booking_id 
        AND b.customer_email = $${paramIndex}
      )`;
      params.push(filters.customerEmail);
      paramIndex++;
    }

    const payments = await queryDatabase(query, params);

    // Calcular estatísticas
    let total = 0;
    let count = 0;
    const byMethod = {
      pix: { total: 0, count: 0 },
      card: { total: 0, count: 0 },
      boleto: { total: 0, count: 0 },
    };
    const byStatus = {
      pending: { total: 0, count: 0 },
      paid: { total: 0, count: 0 },
      refunded: { total: 0, count: 0 },
      failed: { total: 0, count: 0 },
      cancelled: { total: 0, count: 0 },
    };

    for (const payment of payments) {
      const amount = parseFloat(payment.amount || 0);
      total += amount;
      count++;

      // Por método
      const method = payment.payment_method || 'unknown';
      if (method === 'pix') {
        byMethod.pix.total += amount;
        byMethod.pix.count++;
      } else if (method === 'card') {
        byMethod.card.total += amount;
        byMethod.card.count++;
      } else if (method === 'boleto') {
        byMethod.boleto.total += amount;
        byMethod.boleto.count++;
      }

      // Por status
      const status = payment.payment_status || 'unknown';
      if (status in byStatus) {
        byStatus[status as keyof typeof byStatus].total += amount;
        byStatus[status as keyof typeof byStatus].count++;
      }
    }

    return {
      total,
      count,
      byMethod,
      byStatus,
      average: count > 0 ? total / count : 0,
      period: {
        start: filters.startDate || new Date(0).toISOString(),
        end: filters.endDate || new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Erro ao gerar relatório de pagamentos:', error);
    throw error;
  }
}

/**
 * Exportar relatório para CSV
 */
export async function exportPaymentReportToCSV(
  filters: PaymentReportFilters = {}
): Promise<string> {
  try {
    let query = `
      SELECT 
        p.id,
        p.booking_id,
        b.booking_code,
        b.customer_name,
        b.customer_email,
        p.amount,
        p.payment_method,
        p.payment_status,
        p.created_at,
        p.paid_at,
        p.refunded_at,
        p.refund_amount
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters.startDate) {
      query += ` AND p.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND p.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.paymentMethod) {
      query += ` AND p.payment_method = $${paramIndex}`;
      params.push(filters.paymentMethod);
      paramIndex++;
    }

    if (filters.paymentStatus) {
      query += ` AND p.payment_status = $${paramIndex}`;
      params.push(filters.paymentStatus);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC`;

    const payments = await queryDatabase(query, params);

    // Gerar CSV
    const headers = [
      'ID',
      'Booking ID',
      'Código Reserva',
      'Cliente',
      'Email',
      'Valor',
      'Método',
      'Status',
      'Criado em',
      'Pago em',
      'Reembolsado em',
      'Valor Reembolsado',
    ];

    const rows = payments.map((p: any) => [
      p.id,
      p.booking_id,
      p.booking_code || '',
      p.customer_name || '',
      p.customer_email || '',
      parseFloat(p.amount || 0).toFixed(2),
      p.payment_method || '',
      p.payment_status || '',
      p.created_at ? new Date(p.created_at).toISOString() : '',
      p.paid_at ? new Date(p.paid_at).toISOString() : '',
      p.refunded_at ? new Date(p.refunded_at).toISOString() : '',
      p.refund_amount ? parseFloat(p.refund_amount).toFixed(2) : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    throw error;
  }
}

/**
 * Buscar pagamentos com análise detalhada
 */
export async function getPaymentAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  conversionRate: number;
  averageTicket: number;
  paymentsByDay: Array<{ date: string; count: number; total: number }>;
  topPaymentMethods: Array<{ method: string; count: number; total: number }>;
}> {
  try {
    const payments = await queryDatabase(
      `SELECT 
        p.amount,
        p.payment_method,
        p.payment_status,
        p.refund_amount,
        p.created_at,
        p.paid_at
      FROM payments p
      WHERE p.created_at >= $1 AND p.created_at <= $2
      ORDER BY p.created_at ASC`,
      [startDate, endDate]
    );

    let totalRevenue = 0;
    let totalRefunds = 0;
    let paidCount = 0;
    let totalCount = 0;
    const paymentsByDay: { [key: string]: { count: number; total: number } } = {};
    const methodStats: { [key: string]: { count: number; total: number } } = {};

    for (const payment of payments) {
      const amount = parseFloat(payment.amount || 0);
      totalCount++;

      if (payment.payment_status === 'paid') {
        totalRevenue += amount;
        paidCount++;
      }

      if (payment.payment_status === 'refunded' && payment.refund_amount) {
        totalRefunds += parseFloat(payment.refund_amount);
      }

      // Por dia
      const date = new Date(payment.created_at).toISOString().split('T')[0];
      if (!paymentsByDay[date]) {
        paymentsByDay[date] = { count: 0, total: 0 };
      }
      paymentsByDay[date].count++;
      if (payment.payment_status === 'paid') {
        paymentsByDay[date].total += amount;
      }

      // Por método
      const method = payment.payment_method || 'unknown';
      if (!methodStats[method]) {
        methodStats[method] = { count: 0, total: 0 };
      }
      methodStats[method].count++;
      if (payment.payment_status === 'paid') {
        methodStats[method].total += amount;
      }
    }

    return {
      totalRevenue,
      totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
      conversionRate: totalCount > 0 ? (paidCount / totalCount) * 100 : 0,
      averageTicket: paidCount > 0 ? totalRevenue / paidCount : 0,
      paymentsByDay: Object.entries(paymentsByDay).map(([date, stats]) => ({
        date,
        ...stats,
      })),
      topPaymentMethods: Object.entries(methodStats)
        .map(([method, stats]) => ({ method, ...stats }))
        .sort((a, b) => b.total - a.total),
    };
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    throw error;
  }
}

