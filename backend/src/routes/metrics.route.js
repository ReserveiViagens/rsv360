/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
const express = require('express');
const { metricsRegistry, metricsMiddleware, renderMetrics } = require('../monitoring/prometheus');

const router = express.Router();

router.get('/', async (_req, res) => {
  res.setHeader('Content-Type', metricsRegistry.contentType);
  res.send(await renderMetrics());
});

module.exports = {
  metricsRouter: router,
  metricsMiddleware,
};
