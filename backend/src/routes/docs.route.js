/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { openApiSpec } = require('../docs/openapi');

const router = express.Router();

router.get('/', (_req, res) => {
  res.redirect('/api/docs/ui');
});

router.get('/json', (_req, res) => {
  res.json(openApiSpec);
});

router.use('/ui', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  explorer: true,
  customSiteTitle: 'RSV360 API Docs',
}));

module.exports = {
  docsRouter: router,
  openApiSpec,
};
