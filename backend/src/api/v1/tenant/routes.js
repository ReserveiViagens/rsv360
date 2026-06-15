const express = require('express');
const { extractBearerToken } = require('../auth/jwt-verify');

const router = express.Router();

/** GET /api/v1/tenant/context — tenant ativo (header/query/path via middleware). */
router.get('/context', (req, res) => {
  const enterpriseId = req.enterpriseId || 'ent_1';
  const token = extractBearerToken(req);

  return res.json({
    enterpriseId,
    propertyId: req.propertyId ?? null,
    authenticated: Boolean(token),
  });
});

module.exports = { tenantRouter: router };
