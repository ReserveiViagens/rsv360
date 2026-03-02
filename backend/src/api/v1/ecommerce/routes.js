const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');

/**
 * Rotas de E-commerce
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0
  });
}));

module.exports = router;
