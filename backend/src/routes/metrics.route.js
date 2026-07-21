/**
 * RSV360 PMS/CRM — Reservei Viagens
 * PR-05b — /metrics requires Authorization: Bearer METRICS_TOKEN (fail-closed).
 */
const express = require('express');
const { isMetricsBearerAuthorized } = require('@rsv360/shared');
const { metricsRegistry, metricsMiddleware, renderMetrics } = require('../monitoring/prometheus');

const router = express.Router();

function requireMetricsBearer(req, res, next) {
  if (!isMetricsBearerAuthorized(req.headers.authorization)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return next();
}

router.get('/', requireMetricsBearer, async (_req, res) => {
  res.setHeader('Content-Type', metricsRegistry.contentType);
  res.send(await renderMetrics());
});

module.exports = {
  metricsRouter: router,
  metricsMiddleware,
  requireMetricsBearer,
};
