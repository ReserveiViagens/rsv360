const express = require('express');
const router = express.Router();
const crmIntegrationsController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Rotas autenticadas (apenas admin CRM)
 */

// Participantes de leilões
router.get('/auctions/:id/participants', authenticateToken, crmIntegrationsController.getAuctionParticipants);

// Clientes de flash deals
router.get('/flash-deals/:id/customers', authenticateToken, crmIntegrationsController.getFlashDealCustomers);

// Criar segmentos
router.post('/segments/from-auction/:id', authenticateToken, crmIntegrationsController.createAuctionSegment);
router.post('/segments/from-flash-deal/:id', authenticateToken, crmIntegrationsController.createFlashDealSegment);

// Analytics
router.get('/analytics/auctions', authenticateToken, crmIntegrationsController.getAuctionAnalytics);
router.get('/analytics/flash-deals', authenticateToken, crmIntegrationsController.getFlashDealAnalytics);

// Histórico do cliente
router.get('/customers/:id/history', authenticateToken, crmIntegrationsController.getCustomerHistory);

module.exports = router;
