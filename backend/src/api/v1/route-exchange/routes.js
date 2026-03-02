const express = require('express');
const router = express.Router();
const orderBookController = require('./orderBookController');
const { authenticateToken } = require('../../../middleware/auth');
const { asyncHandler } = require('../../../middleware/errorHandler');

/**
 * Rotas do Global Route Exchange
 * Sistema de Bolsa de Valores de Destinos
 */

// Order Book
router.get('/markets/:marketId/orderbook', authenticateToken, asyncHandler(orderBookController.getOrderBook));
router.get('/markets/:marketId/spread', authenticateToken, asyncHandler(orderBookController.getSpread));

// Bids (Ordens de Compra)
router.post('/bids', authenticateToken, asyncHandler(orderBookController.placeBid));
router.get('/bids/my', authenticateToken, asyncHandler(orderBookController.getMyBids));
router.delete('/bids/:bidId', authenticateToken, asyncHandler(orderBookController.cancelBid));

// Asks (Ordens de Venda)
router.post('/asks', authenticateToken, asyncHandler(orderBookController.placeAsk));
router.get('/asks/my', authenticateToken, asyncHandler(orderBookController.getMyAsks));
router.delete('/asks/:askId', authenticateToken, asyncHandler(orderBookController.cancelAsk));

// Matches (Negócios Fechados)
router.get('/matches', authenticateToken, asyncHandler(orderBookController.getMatches));
router.get('/matches/:matchId', authenticateToken, asyncHandler(orderBookController.getMatchById));
router.post('/matches/:matchId/confirm', authenticateToken, asyncHandler(orderBookController.confirmMatch));

// Verification (Proof of Transparency)
router.get('/verify/:entityType/:entityId', authenticateToken, asyncHandler(orderBookController.verifyEntity));

module.exports = router;
