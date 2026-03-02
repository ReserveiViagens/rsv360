const { test, expect } = require('@playwright/test');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Testes de Performance e Carga
 */
test.describe('Performance Tests', () => {
  test('deve responder em menos de 200ms para GET /api/v1/auctions/active', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(200);
  });

  test('deve responder em menos de 300ms para GET /api/v1/flash-deals/active', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE_URL}/api/v1/flash-deals/active`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(300);
  });

  test('deve responder em menos de 500ms para GET /api/v1/marketplace/listings/active', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE_URL}/api/v1/marketplace/listings/active`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(500);
  });

  test('deve lidar com múltiplas requisições simultâneas', async ({ request }) => {
    const promises = Array(10).fill(null).map(() =>
      request.get(`${API_BASE_URL}/api/v1/auctions/active`)
    );

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Todas devem ter sucesso
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    // Deve completar em menos de 2 segundos
    expect(totalTime).toBeLessThan(2000);
  });

  test('deve ter tamanho de resposta razoável', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
    const body = await response.text();
    const sizeKB = Buffer.byteLength(body, 'utf8') / 1024;

    // Resposta não deve exceder 1MB
    expect(sizeKB).toBeLessThan(1024);
  });
});

/**
 * Testes de Carga
 */
test.describe('Load Tests', () => {
  test('deve lidar com 100 requisições sequenciais', async ({ request }) => {
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < 100; i++) {
      try {
        const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
        if (response.status() === 200) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Taxa de sucesso deve ser > 95%
    const successRate = (successCount / 100) * 100;
    expect(successRate).toBeGreaterThan(95);

    // Deve completar em tempo razoável
    expect(totalTime).toBeLessThan(30000); // 30 segundos
  });

  test('deve lidar com 50 requisições simultâneas', async ({ request }) => {
    const promises = Array(50).fill(null).map(() =>
      request.get(`${API_BASE_URL}/api/v1/flash-deals/active`).catch(() => null)
    );

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();

    const successCount = responses.filter(r => r && r.status() === 200).length;
    const successRate = (successCount / 50) * 100;

    // Taxa de sucesso deve ser > 90%
    expect(successRate).toBeGreaterThan(90);

    // Deve completar em menos de 10 segundos
    expect(endTime - startTime).toBeLessThan(10000);
  });

  test('deve manter performance sob carga contínua', async ({ request }) => {
    const responseTimes = [];
    const iterations = 20;

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
      
      // Pequeno delay entre requisições
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);

    // Tempo médio deve ser < 500ms
    expect(avgResponseTime).toBeLessThan(500);
    
    // Tempo máximo deve ser < 2000ms
    expect(maxResponseTime).toBeLessThan(2000);
  });
});

/**
 * Testes de Stress
 */
test.describe('Stress Tests', () => {
  test('deve lidar com pico de tráfego', async ({ request }) => {
    // Simular pico: 200 requisições em 5 segundos
    const promises = Array(200).fill(null).map(() =>
      request.get(`${API_BASE_URL}/api/v1/auctions/active`).catch(() => null)
    );

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();

    const successCount = responses.filter(r => r && r.status() === 200).length;
    const successRate = (successCount / 200) * 100;

    // Mesmo sob stress, taxa de sucesso deve ser > 80%
    expect(successRate).toBeGreaterThan(80);
    
    // Deve completar em tempo razoável
    expect(endTime - startTime).toBeLessThan(15000);
  });
});

module.exports = {};
