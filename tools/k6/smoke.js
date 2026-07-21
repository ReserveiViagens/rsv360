/**
 * RSV360 capacity smoke (E5) — 1 VU, sequential probes.
 *
 *   k6 run tools/k6/smoke.js
 *   k6 run -e BASE_URL=http://localhost:3002 -e TOKEN=<jwt> -e METRICS_TOKEN=<token> tools/k6/smoke.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import {
  authHeaders,
  baseUrl,
  checkInOut,
  extractAccessToken,
  hotelId,
  jsonHeaders,
} from './lib/env.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ['rate>0.9'],
    http_req_failed: ['rate<0.3'],
  },
};

export function setup() {
  const base = baseUrl();
  let token = __ENV.TOKEN || '';

  if (!token && __ENV.EMAIL && __ENV.PASSWORD) {
    const loginRes = http.post(
      `${base}/api/v1/auth/login`,
      JSON.stringify({ email: __ENV.EMAIL, password: __ENV.PASSWORD }),
      { headers: jsonHeaders(null) },
    );
    token = extractAccessToken(loginRes.body) || '';
  }

  return { base, token };
}

export default function (data) {
  const { base, token } = data;
  const { checkIn, checkOut } = checkInOut();
  const hid = hotelId();

  group('health', () => {
    const res = http.get(`${base}/health`);
    check(res, { 'health 200': (r) => r.status === 200 });
  });

  group('metrics', () => {
    const metricsToken = __ENV.METRICS_TOKEN || '';
    const res = http.get(`${base}/metrics`, {
      headers: metricsToken ? { Authorization: `Bearer ${metricsToken}` } : {},
    });
    check(res, {
      'metrics 200': (r) => r.status === 200,
      'metrics prometheus': (r) => String(r.body).includes('rsv360_'),
    });
  });

  group('login', () => {
    if (token) {
      check({ ok: true }, { 'token provided (skip login)': () => true });
      return;
    }
    if (!__ENV.EMAIL || !__ENV.PASSWORD) {
      check({ ok: true }, { 'login skipped (no EMAIL/PASSWORD/TOKEN)': () => true });
      return;
    }
    const res = http.post(
      `${base}/api/v1/auth/login`,
      JSON.stringify({ email: __ENV.EMAIL, password: __ENV.PASSWORD }),
      { headers: jsonHeaders(null) },
    );
    check(res, {
      'login 200': (r) => r.status === 200,
      'login has token': (r) => Boolean(extractAccessToken(r.body)),
    });
  });

  group('list acomodacoes', () => {
    const qs = `hotelId=${encodeURIComponent(hid)}&adults=2&children=0&checkIn=${checkIn}&checkOut=${checkOut}`;
    const res = http.get(`${base}/api/v1/acomodacoes/disponiveis?${qs}`, {
      headers: authHeaders(token),
    });
    check(res, {
      'disponiveis not 5xx': (r) => r.status < 500,
      'disponiveis 200 or 400': (r) => r.status === 200 || r.status === 400,
    });
  });

  group('gerar-proposta', () => {
    const body = {
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      name: 'K6 Smoke',
      phone: '62999999999',
      email: 'k6-smoke@example.com',
      hotelId: hid,
    };
    const res = http.post(`${base}/api/v1/cotacao/gerar-proposta`, JSON.stringify(body), {
      headers: jsonHeaders(null),
    });
    // Local: turnstile bypass when secret absent → often 201/400/422.
    // Prod with turnstile: 403 without token — still a valid capacity probe.
    check(res, {
      'gerar-proposta not 5xx': (r) => r.status < 500,
    });
  });

  group('import preview', () => {
    if (!token) {
      check({ ok: true }, { 'import preview skipped (no TOKEN)': () => true });
      return;
    }
    const fd = new FormData();
    fd.append('file', http.file('codigo_externo\nK6SMOKE1\n', 'k6-smoke.csv', 'text/csv'));
    const res = http.post(`${base}/api/v1/acomodacoes/import/preview`, fd.body(), {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data; boundary=' + fd.boundary,
      },
    });
    check(res, {
      'import preview not 5xx': (r) => r.status < 500,
      'import preview auth ok': (r) => r.status !== 401 && r.status !== 403,
    });
  });

  sleep(0.2);
}
