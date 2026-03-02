/**
 * Teste de Endurance (k6)
 * Testa o sistema por um período prolongado para detectar memory leaks
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '5m', target: 50 },   // Ramp up: 0 a 50 usuários
    { duration: '30m', target: 50 },  // Estável: 50 usuários por 30 minutos
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_TOKEN = __ENV.API_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` }),
};

export function setup() {
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

export default function (data) {
  const token = data.token || API_TOKEN;
  const authHeaders = { ...headers, ...(token && { 'Authorization': `Bearer ${token}` }) };

  // Ciclo de requisições típicas
  const res1 = http.get(`${BASE_URL}/api/properties`, { headers: authHeaders });
  check(res1, { 'status is 200': (r) => r.status === 200 });
  errorRate.add(res1.status !== 200);

  sleep(2);

  const res2 = http.get(`${BASE_URL}/api/bookings`, { headers: authHeaders });
  check(res2, { 'status is 200': (r) => r.status === 200 });
  errorRate.add(res2.status !== 200);

  sleep(2);

  const res3 = http.get(`${BASE_URL}/api/metrics`, { headers: authHeaders });
  check(res3, { 'status is 200': (r) => r.status === 200 });
  errorRate.add(res3.status !== 200);

  sleep(2);
}

