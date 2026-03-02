// Integração com Mercado Pago
// Para usar em produção, configure as variáveis de ambiente:
// MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
// MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_aqui
// MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui

import crypto from 'crypto';

interface PixPaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: 'pix';
  payer: {
    email: string;
    first_name: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: {
    booking_code: string;
    booking_id: number;
  };
}

interface CardPaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: 'credit_card' | 'debit_card';
  installments: number;
  token: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: {
    booking_code: string;
    booking_id: number;
  };
}

interface BoletoPaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: 'bolbradesco' | 'pec';
  payer: {
    email: string;
    first_name: string;
    last_name?: string;
    identification: {
      type: string;
      number: string;
    };
    address?: {
      zip_code: string;
      street_name: string;
      street_number: string;
      neighborhood: string;
      city: string;
      federal_unit: string;
    };
  };
  metadata?: {
    booking_code: string;
    booking_id: number;
  };
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export class MercadoPagoService {
  private accessToken: string;
  private publicKey: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.mercadopago.com';

  constructor() {
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    this.publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY || '';
    this.webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
  }

  // Função de retry com backoff exponencial
  private async retryRequest<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Não fazer retry para erros 4xx (erros do cliente)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Se não for a última tentativa, aguardar antes de tentar novamente
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
          console.log(`Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Erro após múltiplas tentativas');
  }

  // Log estruturado
  private logPayment(action: string, data: any, error?: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      paymentId: data?.id || data?.payment_id,
      bookingCode: data?.metadata?.booking_code,
      amount: data?.transaction_amount,
      status: data?.status,
      error: error?.message,
    };
    console.log('[MercadoPago]', JSON.stringify(logData));
  }

  // Gerar pagamento PIX
  async createPixPayment(data: PixPaymentData) {
    this.logPayment('createPixPayment', data);

    if (!this.accessToken) {
      console.warn('⚠️ Mercado Pago não configurado - usando modo de desenvolvimento');
      // Modo de desenvolvimento - retornar dados simulados
      return {
        id: `MP-${Date.now()}`,
        status: 'pending',
        status_detail: 'pending_waiting_payment',
        qr_code: this.generateMockPixQrCode(data.metadata?.booking_code || ''),
        qr_code_base64: null,
        transaction_amount: data.transaction_amount,
        date_created: new Date().toISOString(),
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };
    }

    try {
      const paymentData = {
        transaction_amount: data.transaction_amount,
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payer.email,
          first_name: data.payer.first_name,
          last_name: data.payer.last_name || '',
          identification: data.payer.identification || undefined,
        },
        metadata: data.metadata || {},
        notification_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      };

      const result = await this.retryRequest(async () => {
        const response = await fetch(`${this.baseUrl}/v1/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Idempotency-Key': `${data.metadata?.booking_code || Date.now()}-${Date.now()}`,
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorWithStatus = new Error(error.message || 'Erro ao criar pagamento PIX');
          (errorWithStatus as any).status = response.status;
          (errorWithStatus as any).details = error;
          throw errorWithStatus;
        }

        return await response.json();
      });

      // Extrair QR Code real da resposta
      const qrCode = result.point_of_interaction?.transaction_data?.qr_code || 
                     result.point_of_interaction?.transaction_data?.qr_code_base64 ||
                     result.qr_code;

      // Gerar QR Code base64 se necessário (usar biblioteca qrcode se disponível)
      let qrCodeBase64 = null;
      if (qrCode && typeof qrCode === 'string') {
        // Em produção, você pode usar uma biblioteca como 'qrcode' para gerar a imagem
        // Por enquanto, retornamos o código string
        qrCodeBase64 = qrCode;
      }

      this.logPayment('createPixPayment_success', result);

      return {
        ...result,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
      };
    } catch (error: any) {
      this.logPayment('createPixPayment_error', data, error);
      throw error;
    }
  }

  // Processar pagamento com cartão
  async createCardPayment(data: CardPaymentData) {
    this.logPayment('createCardPayment', data);

    if (!this.accessToken) {
      console.warn('⚠️ Mercado Pago não configurado - usando modo de desenvolvimento');
      // Modo de desenvolvimento - retornar dados simulados
      return {
        id: `MP-${Date.now()}`,
        status: 'approved',
        status_detail: 'accredited',
        transaction_amount: data.transaction_amount,
        installments: data.installments,
        date_created: new Date().toISOString(),
      };
    }

    try {
      const paymentData = {
        transaction_amount: data.transaction_amount,
        description: data.description,
        payment_method_id: data.payment_method_id,
        installments: data.installments,
        token: data.token,
        payer: {
          email: data.payer.email,
          identification: data.payer.identification || undefined,
        },
        metadata: data.metadata || {},
        notification_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
        statement_descriptor: 'RSV 360°',
      };

      const result = await this.retryRequest(async () => {
        const response = await fetch(`${this.baseUrl}/v1/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Idempotency-Key': `${data.metadata?.booking_code || Date.now()}-${Date.now()}`,
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorWithStatus = new Error(error.message || 'Erro ao processar pagamento');
          (errorWithStatus as any).status = response.status;
          (errorWithStatus as any).details = error;
          throw errorWithStatus;
        }

        return await response.json();
      });

      // Verificar se precisa de 3D Secure
      if (result.status === 'pending' && result.status_detail === 'pending_challenge') {
        this.logPayment('createCardPayment_3ds_required', result);
        return {
          ...result,
          requires_3ds: true,
          three_ds_info: result.three_ds_info,
        };
      }

      this.logPayment('createCardPayment_success', result);
      return result;
    } catch (error: any) {
      this.logPayment('createCardPayment_error', data, error);
      throw error;
    }
  }

  // Gerar pagamento Boleto
  async createBoletoPayment(data: BoletoPaymentData) {
    this.logPayment('createBoletoPayment', data);

    if (!this.accessToken) {
      console.warn('⚠️ Mercado Pago não configurado - usando modo de desenvolvimento');
      // Modo de desenvolvimento - retornar dados simulados
      return {
        id: `MP-${Date.now()}`,
        status: 'pending',
        status_detail: 'pending_waiting_payment',
        transaction_amount: data.transaction_amount,
        external_resource_url: 'https://www.mercadopago.com.br/payments/123456/ticket?caller_id=123456',
        date_of_expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
        date_created: new Date().toISOString(),
      };
    }

    try {
      const paymentData = {
        transaction_amount: data.transaction_amount,
        description: data.description,
        payment_method_id: data.payment_method_id,
        payer: {
          email: data.payer.email,
          first_name: data.payer.first_name,
          last_name: data.payer.last_name || '',
          identification: data.payer.identification,
          address: data.payer.address || undefined,
        },
        metadata: data.metadata || {},
        notification_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
        date_of_expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
      };

      const result = await this.retryRequest(async () => {
        const response = await fetch(`${this.baseUrl}/v1/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Idempotency-Key': `${data.metadata?.booking_code || Date.now()}-${Date.now()}`,
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorWithStatus = new Error(error.message || 'Erro ao gerar boleto');
          (errorWithStatus as any).status = response.status;
          (errorWithStatus as any).details = error;
          throw errorWithStatus;
        }

        return await response.json();
      });

      this.logPayment('createBoletoPayment_success', result);
      return result;
    } catch (error: any) {
      this.logPayment('createBoletoPayment_error', data, error);
      throw error;
    }
  }

  // Gerar QR Code PIX mockado (para desenvolvimento)
  private generateMockPixQrCode(bookingCode: string): string {
    // Formato EMV simplificado para desenvolvimento
    return `00020126580014br.gov.bcb.pix0136${bookingCode}5204000053039865802BR5925RESERVEI VIAGENS LTDA6009CALDAS NOVAS62070503***6304${Math.random().toString(36).substring(7)}`;
  }

  // Verificar status do pagamento
  async getPaymentStatus(paymentId: string) {
    if (!this.accessToken) {
      return {
        status: 'pending',
        status_detail: 'pending_waiting_payment',
      };
    }

    try {
      const result = await this.retryRequest(async () => {
        const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          const errorWithStatus = new Error(error.message || 'Erro ao buscar status do pagamento');
          (errorWithStatus as any).status = response.status;
          throw errorWithStatus;
        }

        return await response.json();
      });

      this.logPayment('getPaymentStatus', { id: paymentId, ...result });
      return result;
    } catch (error: any) {
      this.logPayment('getPaymentStatus_error', { id: paymentId }, error);
      throw error;
    }
  }

  // Validar assinatura do webhook
  validateWebhookSignature(xSignature: string, xRequestId: string, dataId: string): boolean {
    if (!this.webhookSecret) {
      console.warn('⚠️ Webhook secret não configurado - validação desabilitada');
      return true; // Em desenvolvimento, aceitar sem validação
    }

    try {
      // Mercado Pago envia a assinatura no formato: sha256=hash
      const parts = xSignature.split(',');
      const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
      const hash = parts.find(p => p.startsWith('sha256='))?.split('=')[1];

      if (!ts || !hash || !dataId) {
        return false;
      }

      // Criar string para hash: ts + data_id + webhook_secret
      const dataString = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      const calculatedHash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(dataString)
        .digest('hex');

      return calculatedHash === hash;
    } catch (error) {
      console.error('Erro ao validar assinatura do webhook:', error);
      return false;
    }
  }

  // Cancelar pagamento
  async cancelPayment(paymentId: string) {
    this.logPayment('cancelPayment', { id: paymentId });

    if (!this.accessToken) {
      throw new Error('Mercado Pago não configurado');
    }

    try {
      const result = await this.retryRequest(async () => {
        const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            status: 'cancelled',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorWithStatus = new Error(error.message || 'Erro ao cancelar pagamento');
          (errorWithStatus as any).status = response.status;
          throw errorWithStatus;
        }

        return await response.json();
      });

      this.logPayment('cancelPayment_success', result);
      return result;
    } catch (error: any) {
      this.logPayment('cancelPayment_error', { id: paymentId }, error);
      throw error;
    }
  }

  // Reembolsar pagamento
  async refundPayment(paymentId: string, amount?: number) {
    this.logPayment('refundPayment', { id: paymentId, amount });

    if (!this.accessToken) {
      throw new Error('Mercado Pago não configurado');
    }

    try {
      const refundData: any = {};
      if (amount) {
        refundData.amount = amount;
      }

      const result = await this.retryRequest(async () => {
        const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}/refunds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(refundData),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorWithStatus = new Error(error.message || 'Erro ao reembolsar pagamento');
          (errorWithStatus as any).status = response.status;
          throw errorWithStatus;
        }

        return await response.json();
      });

      this.logPayment('refundPayment_success', result);
      return result;
    } catch (error: any) {
      this.logPayment('refundPayment_error', { id: paymentId }, error);
      throw error;
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();

