const express = require('express');

const cloneAlerts = [];
const router = express.Router();

router.post('/', (req, res) => {
  const payload = {
    id: cloneAlerts.length + 1,
    cloneDomain: req.body?.cloneDomain || req.get('host') || 'unknown',
    cloneUrl: req.body?.cloneUrl || req.originalUrl,
    referrer: req.body?.referrer || null,
    userAgent: req.body?.userAgent || req.get('user-agent') || null,
    timestamp: req.body?.timestamp || new Date().toISOString(),
  };

  cloneAlerts.push(payload);
  console.warn('[CLONE-ALERT] possível clone detectado:', payload.cloneDomain, payload.cloneUrl);

  res.status(201).json({
    success: true,
    data: payload,
  });
});

module.exports = { cloneAlertRouter: router, cloneAlerts };
