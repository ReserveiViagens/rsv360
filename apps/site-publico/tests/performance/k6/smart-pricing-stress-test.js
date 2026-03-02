/**
 * ✅ TAREFA HIGH-9: Teste de Stress para Smart Pricing
 * Testa performance do Smart Pricing sob carga
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas customizadas
const smartPricingErrorRate = new Rate('smart_pricing_errors');
const smartPricingDuration = new Trend('smart_pricing_duration');

export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp up para 50 usuários
    { duration: '5m', target: 50 }, // Manter 50 usuários
    { duration: '2m', target: 100 }, // Ramp up para 100 usuários
    { duration: '5m', target: 100 }, // Manter 100 usuários
    { duration: '2m', target: 200 }, // Ramp up para 200 usuários
    { duration: '5m', target: 200 }, // Manter 200 usuários
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser < 2s
    http_req_failed: ['rate<0.01'], // Taxa de erro < 1%
    smart_pricing_errors: ['rate<0.05'], // Taxa de erro do Smart Pricing < 5%
    smart_pricing_duration: ['p(95)<3000'], // 95% das requisições < 3s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_PROPERTY_ID = __ENV.PROPERTY_ID || 1;

export default function () {
  // Gerar datas aleatórias
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30));
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 7) + 1);
  const basePrice = 100 + Math.floor(Math.random() * 200);

  // Teste 1: Calcular preço com Smart Pricing
  const startTime = Date.now();
  const pricingResponse = http.get(
    `${BASE_URL}/api/pricing/smart/calculate?property_id=${TEST_PROPERTY_ID}&check_in=${checkIn.toISOString()}&check_out=${checkOut.toISOString()}&base_price=${basePrice}`
  );

  const duration = Date.now() - startTime;
  smartPricingDuration.add(duration);

  const pricingSuccess = check(pricingResponse, {
    'pricing status is 200': (r) => r.status === 200,
    'pricing has finalPrice': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success && data.data && data.data.finalPrice > 0;
      } catch {
        return false;
      }
    },
  });

  if (!pricingSuccess) {
    smartPricingErrorRate.add(1);
  } else {
    smartPricingErrorRate.add(0);
  }

  sleep(1);

  // Teste 2: Obter histórico de preços
  const historyResponse = http.get(
    `${BASE_URL}/api/pricing/history?property_id=${TEST_PROPERTY_ID}&limit=10`
  );

  check(historyResponse, {
    'history status is 200': (r) => r.status === 200,
    'history returns array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success && Array.isArray(data.data);
      } catch {
        return false;
      }
    },
  });

  sleep(1);

  // Teste 3: Calcular ROI
  const periodStart = new Date();
  periodStart.setMonth(periodStart.getMonth() - 1);
  const periodEnd = new Date();

  const roiResponse = http.get(
    `${BASE_URL}/api/pricing/roi?property_id=${TEST_PROPERTY_ID}&period_start=${periodStart.toISOString().split('T')[0]}&period_end=${periodEnd.toISOString().split('T')[0]}`
  );

  check(roiResponse, {
    'roi status is 200': (r) => r.status === 200,
    'roi has summary': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success && data.data;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'smart-pricing-stress-report.json': JSON.stringify(data, null, 2),
  };
}

