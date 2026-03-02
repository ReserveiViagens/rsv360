const express = require('express');
const router = express.Router();
const affiliatesController = require('./controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Rotas públicas
 */

// Buscar afiliado por código (público - para tracking)
router.get('/code/:code', affiliatesController.getAffiliateByCode);

/**
 * Rotas autenticadas
 */

// Afiliados
router.get('/', authenticateToken, affiliatesController.listAffiliates);
router.post('/', authenticateToken, affiliatesController.createAffiliate);
router.get('/:id', authenticateToken, affiliatesController.getAffiliate);
router.put('/:id', authenticateToken, affiliatesController.updateAffiliate);

// Referências
router.get('/:id/referrals', authenticateToken, affiliatesController.listReferrals);
router.post('/:id/referrals', authenticateToken, affiliatesController.createReferral);

// Comissões
router.get('/:id/commissions', authenticateToken, affiliatesController.listCommissions);

// Payouts
router.get('/:id/payouts', authenticateToken, affiliatesController.listPayouts);
router.post('/:id/payouts', authenticateToken, affiliatesController.createPayout);

// Dashboard
router.get('/:id/dashboard', authenticateToken, affiliatesController.getDashboard);

module.exports = router;
