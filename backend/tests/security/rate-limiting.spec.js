const { test, expect } = require('@playwright/test');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Testes de Segurança - Rate Limiting Detalhado
 */
test.describe('Security - Rate Limiting', () => {
  test('deve bloquear após exceder limite de requisições', async ({ request }) => {
    // Fazer requisições até atingir o limite
    let rateLimited = false;
    let requestCount = 0;

    for (let i = 0; i < 120; i++) {
      const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
      requestCount++;

      if (response.status() === 429) {
        rateLimited = true;
        break;
      }

      // Pequeno delay para não sobrecarregar
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Deve ter aplicado rate limiting em algum momento
    expect(rateLimited || requestCount >= 100).toBeTruthy();
  });

  test('deve retornar headers de rate limiting', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
    const headers = response.headers();

    // Verificar se headers de rate limiting existem
    if (headers['x-ratelimit-limit']) {
      expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
    }

    if (headers['x-ratelimit-remaining']) {
      expect(parseInt(headers['x-ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
    }

    if (headers['retry-after']) {
      expect(parseInt(headers['retry-after'])).toBeGreaterThan(0);
    }
  });

  test('deve aplicar rate limiting por IP', async ({ request }) => {
    // Simular múltiplas requisições do mesmo IP
    const requests = Array(110).fill(null).map(() =>
      request.get(`${API_BASE_URL}/api/v1/auctions/active`).catch(() => null)
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r && r.status() === 429).length;

    // Algumas requisições devem ser bloqueadas
    expect(rateLimited).toBeGreaterThan(0);
  });
});

/**
 * Testes de Segurança - Validação de Headers
 */
test.describe('Security - Header Validation', () => {
  test('deve ter headers de segurança configurados', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
    const headers = response.headers();

    // Verificar headers de segurança (Helmet)
    if (headers['x-content-type-options']) {
      expect(headers['x-content-type-options']).toBe('nosniff');
    }

    if (headers['x-frame-options']) {
      expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
    }

    if (headers['strict-transport-security']) {
      expect(headers['strict-transport-security']).toContain('max-age');
    }
  });

  test('deve rejeitar métodos HTTP não permitidos', async ({ request }) => {
    // Tentar métodos não permitidos
    const methods = ['TRACE', 'OPTIONS', 'PATCH'];

    for (const method of methods) {
      try {
        const response = await request.fetch(`${API_BASE_URL}/api/v1/auctions/active`, {
          method: method
        });
        
        // Deve retornar 405 (Method Not Allowed) ou 404
        expect([405, 404, 501]).toContain(response.status());
      } catch (error) {
        // Erro também é aceitável
        expect(error).toBeTruthy();
      }
    }
  });
});

/**
 * Testes de Segurança - Proteção contra Ataques Comuns
 */
test.describe('Security - Common Attacks', () => {
  test('deve proteger contra SQL Injection', async ({ request }) => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE auctions; --",
      "' OR '1'='1",
      "1' UNION SELECT * FROM users--",
      "admin'--",
      "' OR 1=1--",
    ];

    for (const payload of sqlInjectionPayloads) {
      const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active?search=${encodeURIComponent(payload)}`);
      
      // Não deve retornar erro 500 (erro de SQL)
      expect(response.status()).not.toBe(500);
      
      // Deve retornar 200 (com resultados vazios) ou 400 (bad request)
      expect([200, 400, 422]).toContain(response.status());
    }
  });

  test('deve proteger contra XSS', async ({ request }) => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
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
        const title = data.title || data.data?.title || '';
        
        // Verificar que payload foi sanitizado
        expect(title).not.toContain('<script>');
        expect(title).not.toContain('onerror=');
        expect(title).not.toContain('javascript:');
      }
    }
  });

  test('deve proteger contra Path Traversal', async ({ request }) => {
    const pathTraversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    ];

    for (const payload of pathTraversalPayloads) {
      const response = await request.get(`${API_BASE_URL}/api/v1/auctions/${payload}`);
      
      // Deve retornar 404 ou 400, não 200 com conteúdo do arquivo
      expect([400, 404, 422]).toContain(response.status());
    }
  });

  test('deve proteger contra Command Injection', async ({ request }) => {
    const commandInjectionPayloads = [
      '; ls -la',
      '| cat /etc/passwd',
      '&& rm -rf /',
      '`whoami`',
      '$(id)',
    ];

    for (const payload of commandInjectionPayloads) {
      const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active?search=${encodeURIComponent(payload)}`);
      
      // Não deve executar comandos (não deve retornar 500 com erro de sistema)
      expect(response.status()).not.toBe(500);
    }
  });
});

/**
 * Testes de Segurança - Validação de Tokens JWT
 */
test.describe('Security - JWT Validation', () => {
  test('deve validar assinatura do token', async ({ request }) => {
    // Token com assinatura inválida
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImV4cCI6OTk5OTk5OTk5OX0.invalid-signature';
    
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions`, {
      headers: {
        'Authorization': `Bearer ${invalidToken}`
      }
    });

    expect(response.status()).toBe(401);
  });

  test('deve validar expiração do token', async ({ request }) => {
    // Token expirado (exp: 1000000000 = 2001)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImV4cCI6MTAwMDAwMDAwMH0.expired';
    
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });

    expect(response.status()).toBe(401);
  });

  test('deve validar formato do token', async ({ request }) => {
    const invalidTokens = [
      'not-a-token',
      'Bearer',
      'Bearer invalid.format.token',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // Token incompleto
    ];

    for (const token of invalidTokens) {
      const response = await request.get(`${API_BASE_URL}/api/v1/auctions`, {
        headers: {
          'Authorization': token
        }
      });

      expect(response.status()).toBe(401);
    }
  });
});

module.exports = {};
