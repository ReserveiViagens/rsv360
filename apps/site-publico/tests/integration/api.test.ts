/**
 * ✅ TESTES DE INTEGRAÇÃO - API
 * 
 * Testes para endpoints da API:
 * - Autenticação
 * - Reservas
 * - Propriedades
 * - Preços
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

describe('API Integration Tests', () => {
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // Setup: Criar usuário de teste e obter token
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123!@#',
          name: 'Test User',
        }),
      });

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        authToken = registerData.token || registerData.access_token;
        testUserId = registerData.user?.id || 1;
      } else {
        // Tentar login se registro falhar
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: 'Test123!@#',
          }),
        });
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          authToken = loginData.token || loginData.access_token;
          testUserId = loginData.user?.id || 1;
        }
      }
    } catch (error) {
      console.warn('Erro no setup de testes:', error);
      // Continuar mesmo se setup falhar
    }
  });

  afterAll(async () => {
    // Cleanup: Remover dados de teste
    try {
      if (authToken && testUserId) {
        // Limpar dados de teste se necessário
        // Por enquanto, apenas log
        console.log('Cleanup: Dados de teste podem ser removidos manualmente');
      }
    } catch (error) {
      console.warn('Erro no cleanup de testes:', error);
    }
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          password: 'Test123!@#',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
    });

    it('should login with valid credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test123!@#',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      authToken = data.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Properties', () => {
    it('should list properties', async () => {
      const response = await fetch(`${API_BASE_URL}/properties`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a property', async () => {
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Property',
          address: '123 Test St',
          city: 'Test City',
          price_per_night: 100,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test Property');
    });
  });

  describe('Bookings', () => {
    let propertyId: number;

    beforeAll(async () => {
      // Criar propriedade de teste
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Booking Property',
          address: '456 Test Ave',
          city: 'Test City',
          price_per_night: 150,
        }),
      });
      const data = await response.json();
      propertyId = data.id;
    });

    it('should create a booking', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 7);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 2);

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: propertyId,
          check_in: checkIn.toISOString().split('T')[0],
          check_out: checkOut.toISOString().split('T')[0],
          guests: 2,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.property_id).toBe(propertyId);
    });

    it('should list bookings', async () => {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Smart Pricing', () => {
    it('should calculate smart price', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 14);

      const response = await fetch(`${API_BASE_URL}/pricing/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: 1,
          check_in: checkIn.toISOString().split('T')[0],
          check_out: new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          base_price: 100,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('finalPrice');
      expect(data).toHaveProperty('factors');
      expect(data.finalPrice).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent resource', async () => {
      const response = await fetch(`${API_BASE_URL}/properties/99999`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthorized requests', async () => {
      const response = await fetch(`${API_BASE_URL}/properties`, {
        // Sem token
      });

      expect(response.status).toBe(401);
    });
  });
});

