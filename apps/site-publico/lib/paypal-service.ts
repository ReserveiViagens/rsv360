/**
 * ✅ SERVIÇO PAYPAL
 * 
 * Integração com PayPal para pagamentos
 */

import { getServiceCredentials } from './credentials-service';

export interface PayPalOrder {
  id: string;
  status: string;
  amount: number;
  currency: string;
  approval_url?: string;
}

/**
 * Obter access token do PayPal
 */
async function getPayPalAccessToken(): Promise<string> {
  const credentials = await getServiceCredentials('paypal');
  
  if (!credentials.client_id || !credentials.client_secret) {
    throw new Error('Credenciais PayPal não configuradas');
  }

  const isSandbox = credentials.environment === 'sandbox';
  const baseUrl = isSandbox 
    ? 'https://api.sandbox.paypal.com'
    : 'https://api.paypal.com';

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
    // Basic Auth
    // @ts-ignore
    auth: {
      username: credentials.client_id,
      password: credentials.client_secret,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_description || 'Erro ao obter token PayPal');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Criar ordem PayPal
 */
export async function createPayPalOrder(
  amount: number,
  currency: string = 'BRL',
  returnUrl: string,
  cancelUrl: string
): Promise<PayPalOrder> {
  try {
    const accessToken = await getPayPalAccessToken();
    const credentials = await getServiceCredentials('paypal');
    const isSandbox = credentials.environment === 'sandbox';
    const baseUrl = isSandbox 
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao criar ordem PayPal');
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      amount,
      currency,
      approval_url: data.links?.find((link: any) => link.rel === 'approve')?.href,
    };
  } catch (error: any) {
    console.error('Erro ao criar ordem PayPal:', error);
    throw error;
  }
}

/**
 * Capturar pagamento PayPal
 */
export async function capturePayPalOrder(orderId: string): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();
    const credentials = await getServiceCredentials('paypal');
    const isSandbox = credentials.environment === 'sandbox';
    const baseUrl = isSandbox 
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'COMPLETED';
  } catch (error: any) {
    console.error('Erro ao capturar ordem PayPal:', error);
    return false;
  }
}

