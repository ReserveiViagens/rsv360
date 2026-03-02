const express = require('express');
const router = express.Router();
const proprietorController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Rotas autenticadas para proprietário
 */

// Dashboard stats
router.get('/dashboard/stats', authenticateToken, proprietorController.getDashboardStats);

// Leilões do proprietário
router.get('/auctions', authenticateToken, proprietorController.getAuctions);

// Receita do proprietário
router.get('/revenue', authenticateToken, proprietorController.getRevenue);

// Taxa de ocupação
router.get('/occupancy', authenticateToken, proprietorController.getOccupancy);

// Tendências de receita
router.get('/revenue/trends', authenticateToken, proprietorController.getRevenueTrends);

// Tendências de ocupação
router.get('/occupancy/trends', authenticateToken, proprietorController.getOccupancyTrends);

// Performance de leilões
router.get('/auctions/performance', authenticateToken, proprietorController.getAuctionPerformance);

module.exports = router;
