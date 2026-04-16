/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */

const client = require('prom-client');

const metricsRegistry = new client.Registry();
client.collectDefaultMetrics({ register: metricsRegistry, prefix: 'rsv360_' });

const httpRequestDuration = new client.Histogram({
  name: 'rsv360_http_request_duration_seconds',
  help: 'Tempo de resposta das rotas HTTP do RSV360',
  labelNames: ['method', 'route', 'status_code', 'property_id'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: 'rsv360_http_requests_total',
  help: 'Quantidade total de requests HTTP',
  labelNames: ['method', 'route', 'status_code', 'property_id'],
});

metricsRegistry.registerMetric(httpRequestDuration);
metricsRegistry.registerMetric(httpRequestsTotal);

function normalizeRoute(req) {
  return req.route?.path
    ? `${req.baseUrl || ''}${req.route.path}`
    : req.path || req.originalUrl || 'unknown';
}

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const elapsed = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = {
      method: req.method,
      route: normalizeRoute(req),
      status_code: String(res.statusCode),
      property_id: String(req.propertyId || 1),
    };

    httpRequestDuration.observe(labels, elapsed);
    httpRequestsTotal.inc(labels);
  });

  next();
}

async function renderMetrics() {
  return metricsRegistry.metrics();
}

module.exports = {
  metricsRegistry,
  metricsMiddleware,
  renderMetrics,
};
