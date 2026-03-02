/**
 * Configuração do k6 para testes de performance
 * k6 é uma ferramenta moderna de teste de carga escrita em Go
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métricas customizadas
export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const requestCount = new Counter('requests');

// Configuração de opções
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up: 0 a 100 usuários em 2 minutos
    { duration: '5m', target: 100 }, // Estável: 100 usuários por 5 minutos
    { duration: '2m', target: 200 }, // Ramp up: 100 a 200 usuários em 2 minutos
    { duration: '5m', target: 200 }, // Estável: 200 usuários por 5 minutos
    { duration: '2m', target: 0 },   // Ramp down: 200 a 0 usuários em 2 minutos
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% das requisições < 500ms, 99% < 1000ms
    http_req_failed: ['rate<0.01'], // Taxa de erro < 1%
    errors: ['rate<0.01'],
  },
};

// Base URL da API
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_TOKEN = __ENV.API_TOKEN || '';

// Headers padrão
const headers = {
  'Content-Type': 'application/json',
  ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` }),
};

/**
 * Função de setup (executada uma vez antes dos testes)
 */
export function setup() {
  // Fazer login e obter token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: __ENV.TEST_USER_EMAIL || 'test@example.com',
    password: __ENV.TEST_USER_PASSWORD || 'test123',
  }), { headers: { 'Content-Type': 'application/json' } });

  if (loginRes.status === 200) {
    const data = JSON.parse(loginRes.body);
    return { token: data.token || data.data?.token };
  }

  return { token: null };
}

/**
 * Função principal de teste (executada por cada VU - Virtual User)
 */
export default function (data) {
  const token = data.token || API_TOKEN;
  const authHeaders = { ...headers, ...(token && { 'Authorization': `Bearer ${token}` }) };

  // Teste 1: Listar propriedades
  const propertiesRes = http.get(`${BASE_URL}/api/properties`, { headers: authHeaders });
  const propertiesCheck = check(propertiesRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has properties': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && Array.isArray(body.data);
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!propertiesCheck);
  responseTime.add(propertiesRes.timings.duration);
  requestCount.add(1);

  sleep(1);

  // Teste 2: Buscar propriedade específica
  if (propertiesRes.status === 200) {
    try {
      const body = JSON.parse(propertiesRes.body);
      if (body.data && body.data.length > 0) {
        const propertyId = body.data[0].id;
        const propertyRes = http.get(`${BASE_URL}/api/properties/${propertyId}`, { headers: authHeaders });
        check(propertyRes, {
          'status is 200': (r) => r.status === 200,
          'response time < 300ms': (r) => r.timings.duration < 300,
        });
        errorRate.add(propertyRes.status !== 200);
        responseTime.add(propertyRes.timings.duration);
        requestCount.add(1);
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
  }

  sleep(1);

  // Teste 3: Listar reservas
  const bookingsRes = http.get(`${BASE_URL}/api/bookings`, { headers: authHeaders });
  check(bookingsRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(bookingsRes.status !== 200);
  responseTime.add(bookingsRes.timings.duration);
  requestCount.add(1);

  sleep(1);

  // Teste 4: API de métricas
  const metricsRes = http.get(`${BASE_URL}/api/metrics`, { headers: authHeaders });
  check(metricsRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  errorRate.add(metricsRes.status !== 200);
  responseTime.add(metricsRes.timings.duration);
  requestCount.add(1);

  sleep(1);
}

/**
 * Função de teardown (executada uma vez após os testes)
 */
export function teardown(data) {
  // Limpeza se necessário
  console.log('Testes concluídos');
}

