const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');

/**
 * Rotas de Chatbots
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de chatbots em desenvolvimento'
  });
}));

module.exports = router;
