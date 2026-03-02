const { test, expect } = require('@playwright/test');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Testes de Performance - Tempo de Resposta
 */
test.describe('Performance - Response Time', () => {
  const endpoints = [
    { path: '/api/v1/auctions/active', maxTime: 200 },
    { path: '/api/v1/flash-deals/active', maxTime: 300 },
    { path: '/api/v1/marketplace/listings/active', maxTime: 500 },
    { path: '/api/v1/google-hotel-ads/feeds', maxTime: 500 },
  ];

  endpoints.forEach(({ path, maxTime }) => {
    test(`deve responder ${path} em menos de ${maxTime}ms`, async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${API_BASE_URL}${path}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(maxTime);
    });
  });
});

/**
 * Testes de Performance - Throughput
 */
test.describe('Performance - Throughput', () => {
  test('deve processar pelo menos 50 requisições/segundo', async ({ request }) => {
    const startTime = Date.now();
    const requests = Array(50).fill(null).map(() =>
      request.get(`${API_BASE_URL}/api/v1/auctions/active`)
    );

    await Promise.all(requests);
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // em segundos
    const throughput = 50 / totalTime;

    expect(throughput).toBeGreaterThan(50);
  });
});

/**
 * Testes de Performance - Memória
 */
test.describe('Performance - Memory', () => {
  test('não deve vazar memória em requisições repetidas', async ({ request }) => {
    // Fazer 100 requisições e verificar que não há degradação de performance
    const responseTimes = [];

    for (let i = 0; i < 100; i++) {
      const startTime = Date.now();
      await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
    }

    // Calcular média das primeiras 10 e últimas 10
    const first10 = responseTimes.slice(0, 10);
    const last10 = responseTimes.slice(-10);
    const avgFirst = first10.reduce((a, b) => a + b, 0) / first10.length;
    const avgLast = last10.reduce((a, b) => a + b, 0) / last10.length;

    // Performance não deve degradar mais de 50%
    expect(avgLast).toBeLessThan(avgFirst * 1.5);
  });
});

/**
 * Testes de Performance - Concorrência
 */
test.describe('Performance - Concurrency', () => {
  test('deve lidar com 100 requisições simultâneas', async ({ request }) => {
    const startTime = Date.now();
    const promises = Array(100).fill(null).map(() =>
      request.get(`${API_BASE_URL}/api/v1/auctions/active`).catch(() => null)
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const successCount = responses.filter(r => r && r.status() === 200).length;
    const successRate = (successCount / 100) * 100;

    expect(successRate).toBeGreaterThan(90);
    expect(totalTime).toBeLessThan(5000);
  });

  test('deve manter consistência sob carga', async ({ request }) => {
    const results = [];
    const iterations = 20;

    for (let i = 0; i < iterations; i++) {
      const response = await request.get(`${API_BASE_URL}/api/v1/auctions/active`);
      const data = await response.json();
      results.push(Array.isArray(data) ? data.length : (data.data?.length || 0));
    }

    // Verificar que os resultados são consistentes (não variam muito)
    const uniqueResults = [...new Set(results)];
    // Deve haver pouca variação nos resultados
    expect(uniqueResults.length).toBeLessThanOrEqual(3);
  });
});

/**
 * Testes de Performance - Escalabilidade
 */
test.describe('Performance - Scalability', () => {
  test('deve escalar linearmente com carga', async ({ request }) => {
    const loadLevels = [10, 25, 50, 100];
    const results = [];

    for (const load of loadLevels) {
      const startTime = Date.now();
      const promises = Array(load).fill(null).map(() =>
        request.get(`${API_BASE_URL}/api/v1/auctions/active`)
      );
      await Promise.all(promises);
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / load;
      results.push({ load, avgTime });
    }

    // Verificar que o tempo médio não aumenta drasticamente
    const firstAvg = results[0].avgTime;
    const lastAvg = results[results.length - 1].avgTime;

    // Tempo médio não deve aumentar mais de 3x
    expect(lastAvg).toBeLessThan(firstAvg * 3);
  });
});

module.exports = {};
