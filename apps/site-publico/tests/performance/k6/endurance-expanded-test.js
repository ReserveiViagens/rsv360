/**
 * ✅ TAREFA HIGH-9: Teste de Endurance Expandido
 * Testa sistema por período prolongado com múltiplos endpoints
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métricas customizadas
const endpointErrorRate = new Rate('endpoint_errors');
const endpointDuration = new Trend('endpoint_duration');
const requestsCounter = new Counter('total_requests');

export const options = {
  stages: [
    { duration: '10m', target: 20 }, // Ramp up para 20 usuários
    { duration: '30m', target: 20 }, // Manter 20 usuários por 30 minutos
    { duration: '10m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% das requisições < 3s
    http_req_failed: ['rate<0.02'], // Taxa de erro < 2%
    endpoint_errors: ['rate<0.05'], // Taxa de erro dos endpoints < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_PROPERTY_ID = __ENV.PROPERTY_ID || 1;
const TEST_USER_ID = __ENV.USER_ID || 1;

// Lista de endpoints para testar
const endpoints = [
  {
    name: 'smart-pricing-calculate',
    method: 'GET',
    url: () =>
      `${BASE_URL}/api/pricing/smart/calculate?property_id=${TEST_PROPERTY_ID}&check_in=${new Date().toISOString()}&check_out=${new Date(Date.now() + 86400000).toISOString()}&base_price=100`,
  },
  {
    name: 'pricing-history',
    method: 'GET',
    url: () => `${BASE_URL}/api/pricing/history?property_id=${TEST_PROPERTY_ID}&limit=10`,
  },
  {
    name: 'pricing-roi',
    method: 'GET',
    url: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return `${BASE_URL}/api/pricing/roi?property_id=${TEST_PROPERTY_ID}&period_start=${start.toISOString().split('T')[0]}&period_end=${end.toISOString().split('T')[0]}`;
    },
  },
  {
    name: 'top-hosts-leaderboard',
    method: 'GET',
    url: () => `${BASE_URL}/api/top-hosts/leaderboard?page=1&page_size=10`,
  },
  {
    name: 'wishlists',
    method: 'GET',
    url: () => `${BASE_URL}/api/wishlists?user_id=${TEST_USER_ID}`,
  },
  {
    name: 'loyalty-points',
    method: 'GET',
    url: () => `${BASE_URL}/api/loyalty/points`,
  },
  {
    name: 'tickets',
    method: 'GET',
    url: () => `${BASE_URL}/api/tickets?status=open`,
  },
  {
    name: 'bookings',
    method: 'GET',
    url: () => `${BASE_URL}/api/bookings?user_id=${TEST_USER_ID}&limit=10`,
  },
];

export default function () {
  // Selecionar endpoint aleatório
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const startTime = Date.now();
  let response;

  if (endpoint.method === 'GET') {
    response = http.get(endpoint.url());
  } else if (endpoint.method === 'POST') {
    response = http.post(endpoint.url(), JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const duration = Date.now() - startTime;
  endpointDuration.add(duration);
  requestsCounter.add(1);

  const success = check(response, {
    [`${endpoint.name} status is 200 or 201`]: (r) => r.status === 200 || r.status === 201,
    [`${endpoint.name} has valid response`]: (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success !== false; // Aceita success: true ou ausência de success
      } catch {
        return r.status < 500; // Aceita qualquer resposta não-500 se não for JSON
      }
    },
  });

  if (!success) {
    endpointErrorRate.add(1);
  } else {
    endpointErrorRate.add(0);
  }

  // Sleep aleatório entre 1-3 segundos
  sleep(1 + Math.random() * 2);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'endurance-expanded-report.json': JSON.stringify(data, null, 2),
  };
}

