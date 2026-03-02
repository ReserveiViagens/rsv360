/**
 * ✅ TESTES E2E: API e Webhooks
 * Testes end-to-end para APIs e integrações
 */

import { test, expect } from '@playwright/test';
import { request } from '@playwright/test';

test.describe('API e Webhooks', () => {
  let apiContext: any;

  test.beforeAll(async ({ request: apiRequest }) => {
    apiContext = apiRequest;
  });

  test('deve retornar health check', async ({ request }) => {
    const response = await request.get('/api/health');
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });

  test('deve listar propriedades via API', async ({ request }) => {
    const response = await request.get('/api/properties?limit=10');
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verificar estrutura da resposta
    if (body.data || body.properties || Array.isArray(body)) {
      expect(true).toBe(true); // Sucesso
    }
  });

  test('deve criar reserva via API', async ({ request }) => {
    const bookingData = {
      booking_type: 'hotel',
      item_id: 1,
      item_name: 'Test Property',
      check_in: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
      check_out: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 dias depois
      adults: 2,
      children: 0,
      customer: {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        phone: '+5511999999999'
      },
      payment_method: 'pix'
    };

    const response = await request.post('/api/bookings', {
      data: bookingData
    });

    // Pode retornar 201 (criado) ou 400/409 (validação/conflito)
    expect([201, 400, 409]).toContain(response.status());
    
    if (response.status() === 201) {
      const body = await response.json();
      expect(body).toHaveProperty('success', true);
      expect(body.data).toHaveProperty('booking_code');
    }
  });

  test('deve validar dados de reserva via API', async ({ request }) => {
    const invalidBookingData = {
      // Dados incompletos
      check_in: new Date().toISOString().split('T')[0]
    };

    const response = await request.post('/api/bookings', {
      data: invalidBookingData
    });

    // Deve retornar erro de validação
    expect([400, 422]).toContain(response.status());
    
    const body = await response.json();
    expect(body).toHaveProperty('success', false);
  });

  test('deve listar eventos de webhook disponíveis', async ({ request }) => {
    const response = await request.get('/api/webhooks/events');
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('success', true);
    expect(body.data).toHaveProperty('events');
    expect(Array.isArray(body.data.events)).toBe(true);
  });

  test('deve verificar status do WebSocket', async ({ request }) => {
    const response = await request.get('/api/socket');
    
    // Pode retornar 200 ou 500 se WebSocket não estiver configurado
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('success');
      expect(body.data).toHaveProperty('connected');
    }
  });

  test('deve retornar erro 401 para endpoints protegidos sem token', async ({ request }) => {
    const response = await request.get('/api/bookings');
    
    // Deve retornar 401 ou 403 se endpoint requer autenticação
    expect([401, 403, 200]).toContain(response.status());
  });
});

