/**
 * ✅ FASE 7: KLARNA SERVICE
 * Integração com Klarna para "Reserve Now, Pay Later"
 */

export interface KlarnaSession {
  session_id: string;
  client_token: string;
  payment_method_categories?: Array<{
    identifier: string;
    name: string;
  }>;
}

export interface KlarnaPayment {
  order_id: string;
  status: 'pending' | 'authorized' | 'captured' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  installments?: number;
}

/**
 * ✅ Cliente Klarna
 */
class KlarnaClient {
  private apiKey: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.KLARNA_API_KEY || '';
    this.baseUrl = process.env.KLARNA_BASE_URL || 'https://api.klarna.com';
    this.enabled = !!this.apiKey && process.env.KLARNA_ENABLED === 'true';
  }

  /**
   * ✅ Criar sessão de pagamento
   */
  async createSession(params: {
    booking_id: number;
    amount: number;
    currency: string;
    billing_address: any;
    shipping_address: any;
    order_lines: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
    }>;
  }): Promise<KlarnaSession> {
    if (!this.enabled) {
      // Mock para desenvolvimento
      return this.mockCreateSession(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          purchase_country: 'BR',
          purchase_currency: params.currency,
          locale: 'pt-BR',
          order_amount: params.amount,
          order_lines: params.order_lines,
          billing_address: params.billing_address,
          shipping_address: params.shipping_address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Klarna API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        session_id: data.session_id,
        client_token: data.client_token,
        payment_method_categories: data.payment_method_categories,
      };
    } catch (error: any) {
      console.error('Erro ao criar sessão Klarna:', error);
      // Fallback para mock
      return this.mockCreateSession(params);
    }
  }

  /**
   * ✅ Verificar elegibilidade para "Pay Later"
   */
  async checkEligibility(params: {
    amount: number;
    check_in_date: Date;
  }): Promise<{ eligible: boolean; reason?: string }> {
    // Regras de elegibilidade
    const minAmount = 100; // R$ 100 mínimo
    const maxAmount = 10000; // R$ 10.000 máximo
    const minDaysAhead = 14; // Check-in deve ser pelo menos 14 dias no futuro

    const daysUntilCheckIn = Math.ceil(
      (params.check_in_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (params.amount < minAmount) {
      return { eligible: false, reason: `Valor mínimo é R$ ${minAmount}` };
    }

    if (params.amount > maxAmount) {
      return { eligible: false, reason: `Valor máximo é R$ ${maxAmount}` };
    }

    if (daysUntilCheckIn < minDaysAhead) {
      return { eligible: false, reason: `Check-in deve ser pelo menos ${minDaysAhead} dias no futuro` };
    }

    return { eligible: true };
  }

  /**
   * ✅ Processar pagamento
   */
  async processPayment(params: {
    session_id: string;
    authorization_token: string;
  }): Promise<KlarnaPayment> {
    if (!this.enabled) {
      return this.mockProcessPayment(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/v1/authorizations/${params.authorization_token}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          auto_capture: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Klarna API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        order_id: data.order_id,
        status: data.status,
        amount: data.order_amount,
        currency: data.purchase_currency,
        installments: data.installments,
      };
    } catch (error: any) {
      console.error('Erro ao processar pagamento Klarna:', error);
      throw error;
    }
  }

  /**
   * Mock para desenvolvimento
   */
  private mockCreateSession(params: any): KlarnaSession {
    return {
      session_id: `mock-session-${Date.now()}`,
      client_token: `mock-token-${Date.now()}`,
      payment_method_categories: [
        { identifier: 'pay_later', name: 'Pagar depois' },
        { identifier: 'pay_over_time', name: 'Parcelar' },
      ],
    };
  }

  private mockProcessPayment(params: any): KlarnaPayment {
    return {
      order_id: `mock-order-${Date.now()}`,
      status: 'authorized',
      amount: 1000,
      currency: 'BRL',
      installments: 3,
    };
  }
}

// Instância singleton
export const klarnaClient = new KlarnaClient();

