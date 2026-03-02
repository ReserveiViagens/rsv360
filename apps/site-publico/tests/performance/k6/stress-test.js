/**
 * Teste de Stress (k6)
 * Testa o limite do sistema aumentando carga gradualmente
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up: 0 a 50 usuários
    { duration: '2m', target: 100 },  // Ramp up: 50 a 100 usuários
    { duration: '2m', target: 200 },  // Ramp up: 100 a 200 usuários
    { duration: '2m', target: 300 },  // Ramp up: 200 a 300 usuários
    { duration: '2m', target: 400 },  // Ramp up: 300 a 400 usuários
    { duration: '2m', target: 500 },  // Ramp up: 400 a 500 usuários
    { duration: '5m', target: 500 },  // Estável: 500 usuários
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% < 2s (mais tolerante para stress test)
    http_req_failed: ['rate<0.05'],     // Taxa de erro < 5%
    errors: ['rate<0.05'],
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

  // Teste de carga: múltiplas requisições simultâneas
  const endpoints = [
    '/api/properties',
    '/api/bookings',
    '/api/metrics',
    '/api/crm/dashboard',
    '/api/analytics/insights',
  ];

  for (const endpoint of endpoints) {
    const res = http.get(`${BASE_URL}${endpoint}`, { headers: authHeaders });
    const checkResult = check(res, {
      'status is 200': (r) => r.status === 200,
    });
    errorRate.add(!checkResult);
  }

  sleep(0.5); // Menos sleep para mais carga
}

