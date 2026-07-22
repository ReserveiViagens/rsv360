/**
 * RSV360 PMS/CRM — Reservei Viagens
 * PR-05b — Bearer METRICS_TOKEN; PR-06a — generous per-IP rate limit (closes CodeQL #4520).
 * Scrape every 15s ≈ 4/min; allow 120/min/IP headroom for probes + multi-scraper lab.
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const { isMetricsBearerAuthorized } = require('@rsv360/shared');
const { metricsRegistry, metricsMiddleware, renderMetrics } = require('../monitoring/prometheus');

const router = express.Router();

const METRICS_WINDOW_MS = 60_000;
const METRICS_MAX_PER_WINDOW = 120;

const metricsIpLimiter = rateLimit({
  windowMs: METRICS_WINDOW_MS,
  max: METRICS_MAX_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const xf = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
    return xf || req.socket?.remoteAddress || 'unknown';
  },
  handler: (_req, res) => {
    res.status(429).json({ success: false, error: 'Too many requests' });
  },
});

function requireMetricsBearer(req, res, next) {
  if (!isMetricsBearerAuthorized(req.headers.authorization)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return next();
}

router.get('/', metricsIpLimiter, requireMetricsBearer, async (_req, res) => {
  res.setHeader('Content-Type', metricsRegistry.contentType);
  res.send(await renderMetrics());
});

module.exports = {
  metricsRouter: router,
  metricsMiddleware,
  requireMetricsBearer,
  metricsIpLimiter,
  METRICS_MAX_PER_WINDOW,
  METRICS_WINDOW_MS,
};
