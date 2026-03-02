const express = require('express');
const router = express.Router();
const marketplaceController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Rotas públicas (listagens ativas podem ser visualizadas publicamente)
 */

// Listar listagens ativas (público)
router.get('/listings/active', marketplaceController.listListings);

// Obter listagem por ID (público)
router.get('/listings/:id', marketplaceController.getListing);

/**
 * Rotas autenticadas
 */

// Listagens
router.get('/listings', authenticateToken, marketplaceController.listListings);
router.post('/listings', authenticateToken, marketplaceController.createListing);
router.put('/listings/:id', authenticateToken, marketplaceController.updateListing);

// Aprovação/Rejeição (apenas admin)
router.post('/listings/:id/approve', authenticateToken, marketplaceController.approveListing);
router.post('/listings/:id/reject', authenticateToken, marketplaceController.rejectListing);

// Pedidos
router.get('/orders', authenticateToken, marketplaceController.listOrders);
router.post('/orders', authenticateToken, marketplaceController.createOrder);

// Comissões
router.get('/commissions', authenticateToken, marketplaceController.listCommissions);

module.exports = router;
