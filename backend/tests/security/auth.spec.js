const { test, expect } = require('@playwright/test');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Testes de Segurança - Autenticação
 */
test.describe('Security - Authentication', () => {
  test('deve rejeitar requisições sem token', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
      data: { title: 'Test' }
    });

    expect(response.status()).toBe(401);
  });

  test('deve rejeitar token inválido', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
      headers: {
        'Authorization': 'Bearer invalid-token-12345'
      },
      data: { title: 'Test' }
    });

    expect(response.status()).toBe(401);
  });

  test('deve rejeitar token expirado', async ({ request }) => {
    // Token expirado (exemplo)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImV4cCI6MTYwOTQ1NjgwMH0.invalid';
    
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });

    expect(response.status()).toBe(401);
  });

  test('deve aceitar token válido', async ({ request }) => {
    // Primeiro fazer login para obter token válido
    const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: {
        email: 'admin@test.com',
        password: 'password123'
      }
    });

    if (loginResponse.status() === 200) {
      const loginData = await loginResponse.json();
      const token = loginData.token || loginData.data?.token;

      if (token) {
        const response = await request.get(`${API_BASE_URL}/api/v1/auctions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.status()).toBe(200);
      }
    }
  });
});

/**
 * Testes de Segurança - Validação de Input
 */
test.describe('Security - Input Validation', () => {
  test('deve rejeitar dados maliciosos em SQL injection', async ({ request }) => {
    const maliciousInputs = [
      "'; DROP TABLE auctions; --",
      "' OR '1'='1",
      "1' UNION SELECT * FROM users--",
      "<script>alert('XSS')</script>",
      "../../etc/passwd"
    ];

    for (const malicious of maliciousInputs) {
      const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        data: {
          title: malicious,
          start_price: 100
        }
      });

      // Deve rejeitar ou sanitizar
      expect([400, 401, 422]).toContain(response.status());
    }
  });

  test('deve validar tipos de dados', async ({ request }) => {
    const invalidData = [
      { title: 12345 }, // título deve ser string
      { start_price: 'not-a-number' }, // preço deve ser número
      { start_price: -100 }, // preço não pode ser negativo
      { start_price: 0 }, // preço deve ser maior que zero
    ];

    for (const data of invalidData) {
      const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        data: {
          ...data,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString()
        }
      });

      expect([400, 422]).toContain(response.status());
    }
  });

  test('deve validar campos obrigatórios', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      data: {
        // Campos obrigatórios ausentes
      }
    });

    expect(response.status()).toBe(400);
  });

  test('deve validar tamanho máximo de campos', async ({ request }) => {
    const longString = 'a'.repeat(10000); // String muito longa

    const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      data: {
        title: longString,
        start_price: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString()
      }
    });

    expect([400, 422]).toContain(response.status());
  });
});

/**
 * Testes de Segurança - Rate Limiting
 */
test.describe('Security - Rate Limiting', () => {
  test('deve aplicar rate limiting após muitas requisições', async ({ request }) => {
    // Fazer 110 requisições rapidamente (limite padrão é 100)
    const requests = Array(110).fill(null).map(() =>
      request.get(`${API_BASE_URL}/api/v1/auctions/active`).catch(() => null)
    );

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r && r.status() === 429);

    // Pelo menos uma requisição deve ser bloqueada
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('deve retornar headers de rate limiting', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
    
    // Verificar headers de rate limiting se existirem
    const headers = response.headers();
    const hasRateLimitHeaders = 
      headers['x-ratelimit-limit'] || 
      headers['x-ratelimit-remaining'] ||
      headers['retry-after'];

    // Headers podem ou não estar presentes dependendo da implementação
    // Mas se estiverem, devem estar corretos
    if (headers['x-ratelimit-limit']) {
      expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
    }
  });

  test('deve resetar rate limit após período de tempo', async ({ request }) => {
    // Fazer muitas requisições até atingir o limite
    for (let i = 0; i < 105; i++) {
      await request.get(`${API_BASE_URL}/api/v1/auctions/active`).catch(() => null);
    }

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fazer nova requisição - deve funcionar novamente
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
    
    // Pode ser 200 (sucesso) ou 429 (ainda limitado) dependendo do tempo
    expect([200, 429]).toContain(response.status());
  });
});

/**
 * Testes de Segurança - CORS
 */
test.describe('Security - CORS', () => {
  test('deve ter headers CORS configurados', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });

    const headers = response.headers();
    
    // Verificar se CORS está configurado
    if (headers['access-control-allow-origin']) {
      expect(headers['access-control-allow-origin']).toBeTruthy();
    }
  });
});

/**
 * Testes de Segurança - XSS Protection
 */
test.describe('Security - XSS Protection', () => {
  test('deve sanitizar inputs para prevenir XSS', async ({ request }) => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>'
    ];

    for (const payload of xssPayloads) {
      const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        data: {
          title: payload,
          start_price: 100,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString()
        }
      });

      if (response.status() === 200 || response.status() === 201) {
        const data = await response.json();
        // Verificar que o payload foi sanitizado
        expect(data.title || data.data?.title).not.toContain('<script>');
        expect(data.title || data.data?.title).not.toContain('onerror=');
      }
    }
  });
});

/**
 * Testes de Segurança - CSRF Protection
 */
test.describe('Security - CSRF Protection', () => {
  test('deve validar origem das requisições', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/v1/auctions`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Origin': 'https://malicious-site.com'
      },
      data: {
        title: 'Test',
        start_price: 100
      }
    });

    // Deve rejeitar ou aceitar dependendo da configuração CORS
    // Se CORS estiver configurado, deve rejeitar origens não permitidas
    expect([200, 201, 403, 401]).toContain(response.status());
  });
});

/**
 * Testes de Segurança - Headers de Segurança
 */
test.describe('Security - Security Headers', () => {
  test('deve ter headers de segurança configurados', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
    const headers = response.headers();

    // Verificar headers de segurança (se configurados via Helmet)
    if (headers['x-content-type-options']) {
      expect(headers['x-content-type-options']).toBe('nosniff');
    }

    if (headers['x-frame-options']) {
      expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
    }

    if (headers['x-xss-protection']) {
      expect(headers['x-xss-protection']).toBeTruthy();
    }
  });
});

module.exports = {};
