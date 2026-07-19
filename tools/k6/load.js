/**
 * RSV360 capacity load (E5) — light stages for p95 / error% capture.
 * Measurement is run by the operator after merge — this file is scaffolding only.
 *
 *   k6 run -e BASE_URL=http://localhost:3002 -e TOKEN=<jwt> tools/k6/load.js
 *   k6 run -e BASE_URL=... -e EMAIL=... -e PASSWORD=... tools/k6/load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import {
  authHeaders,
  baseUrl,
  checkInOut,
  extractAccessToken,
  hotelId,
  jsonHeaders,
} from './lib/env.js';

const errorRate = new Rate('rsv_errors');
const disponiveisDuration = new Trend('rsv_disponiveis_ms');
const metricsDuration = new Trend('rsv_metrics_ms');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 15 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    rsv_errors: ['rate<0.15'],
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
  const vu = (__VU + __ITER) % 4;

  if (vu === 0) {
    const res = http.get(`${base}/metrics`);
    metricsDuration.add(res.timings.duration);
    const ok = check(res, { 'metrics 200': (r) => r.status === 200 });
    errorRate.add(!ok);
  } else if (vu === 1) {
    const qs = `hotelId=${encodeURIComponent(hid)}&adults=2&children=0&checkIn=${checkIn}&checkOut=${checkOut}`;
    const res = http.get(`${base}/api/v1/acomodacoes/disponiveis?${qs}`, {
      headers: authHeaders(token),
    });
    disponiveisDuration.add(res.timings.duration);
    const ok = check(res, { 'disponiveis <500': (r) => r.status < 500 });
    errorRate.add(!ok);
  } else if (vu === 2) {
    const body = {
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      name: `K6 Load ${__VU}`,
      phone: '62999999999',
      email: `k6-load-${__VU}@example.com`,
      hotelId: hid,
    };
    const res = http.post(`${base}/api/v1/cotacao/gerar-proposta`, JSON.stringify(body), {
      headers: jsonHeaders(null),
    });
    const ok = check(res, { 'proposta <500': (r) => r.status < 500 });
    errorRate.add(!ok);
  } else if (token) {
    const fd = new FormData();
    fd.append(
      'file',
      http.file(`codigo_externo\nK6L${__VU}${__ITER}\n`, 'k6-load.csv', 'text/csv'),
    );
    const res = http.post(`${base}/api/v1/acomodacoes/import/preview`, fd.body(), {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data; boundary=' + fd.boundary,
      },
    });
    const ok = check(res, { 'import preview <500': (r) => r.status < 500 });
    errorRate.add(!ok);
  } else {
    const res = http.get(`${base}/health`);
    const ok = check(res, { 'health 200': (r) => r.status === 200 });
    errorRate.add(!ok);
  }

  sleep(0.5);
}
