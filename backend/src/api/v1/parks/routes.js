const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');

/**
 * Rotas de Parques
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de parques em desenvolvimento'
  });
}));

module.exports = router;
