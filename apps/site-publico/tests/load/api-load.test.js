/**
 * ✅ TESTES DE CARGA - APIs
 * 
 * Execute com: k6 run tests/load/api-load.test.js
 * 
 * Requer: npm install -g k6
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up para 100 usuários
    { duration: '5m', target: 100 }, // Manter 100 usuários
    { duration: '2m', target: 200 }, // Ramp up para 200 usuários
    { duration: '5m', target: 200 }, // Manter 200 usuários
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser < 500ms
    http_req_failed: ['rate<0.01'], // Taxa de erro < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Teste de health check
  let res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Teste de listagem de propriedades
  res = http.get(`${BASE_URL}/api/properties`);
  check(res, {
    'properties list status is 200': (r) => r.status === 200,
    'properties list has data': (r) => JSON.parse(r.body).data !== undefined,
  });

  sleep(1);

  // Teste de busca
  res = http.get(`${BASE_URL}/api/properties/search?city=Caldas Novas`);
  check(res, {
    'search status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

